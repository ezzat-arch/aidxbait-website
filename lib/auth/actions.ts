"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

export const login = async (formData: FormData) => {
	const supabase = await createClient();
	const t = await getTranslations("auth.actions");

	// Extract and validate form data
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const redirectTo = formData.get("redirect") as string | null;

	// Basic validation
	if (!email?.trim() || !password?.trim()) {
		const params = new URLSearchParams({
			error: t("email_password_required"),
		});
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/login?${params.toString()}`);
	}

	const { data, error } = await supabase.auth.signInWithPassword({
		email: email.trim(),
		password: password,
	});

	if (error) {
		console.error("Login error:", error);

		// If it's an email confirmation error and we have disabled email confirmation,
		// try to auto-confirm the user using admin client
		if (error.message.toLowerCase().includes("email not confirmed")) {
			try {
				// Try to confirm the user automatically
				const confirmResponse = await fetch(
					`${
						process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
					}/api/auth/confirm-user`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email: email.trim() }),
					}
				);

				const confirmResult = await confirmResponse.json();

				if (confirmResult.success) {
					// Try login again after confirmation
					const { data: retryData, error: retryError } =
						await supabase.auth.signInWithPassword({
							email: email.trim(),
							password: password,
						});

					if (!retryError && retryData.user) {
						revalidatePath("/", "layout");
						redirect(redirectTo || "/");
					}
				}
			} catch (confirmError) {
				console.error("Auto-confirmation failed:", confirmError);
			}
		}

		// Use the actual error message from Supabase
		const params = new URLSearchParams({ error: error.message });
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/login?${params.toString()}`);
	}

	// Check if user exists
	if (!data.user) {
		const params = new URLSearchParams({
			error: t("login_failed"),
		});
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/login?${params.toString()}`);
	}

	revalidatePath("/", "layout");
	redirect(redirectTo || "/");
};

export const signup = async (formData: FormData) => {
	const supabase = await createClient();
	const t = await getTranslations("auth.actions");

	// Extract form data
	const firstName = formData.get("firstName") as string;
	const lastName = formData.get("lastName") as string;
	const email = formData.get("email") as string;
	const phone = formData.get("phone") as string;
	const password = formData.get("password") as string;
	const redirectTo = formData.get("redirect") as string | null;

	// Validate required fields
	if (
		!firstName?.trim() ||
		!lastName?.trim() ||
		!email?.trim() ||
		!phone?.trim() ||
		!password?.trim()
	) {
		const params = new URLSearchParams({ error: t("all_fields_required") });
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/register?${params.toString()}`);
	}

	try {
		// Step 1: Create auth user
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
		});

		if (authError) {
			const params = new URLSearchParams({ error: authError.message });
			if (redirectTo) params.set("redirect", redirectTo);
			redirect(`/register?${params.toString()}`);
		}

		if (!authData.user?.id) {
			const params = new URLSearchParams({
				error: t("failed_to_create_account"),
			});
			if (redirectTo) params.set("redirect", redirectTo);
			redirect(`/register?${params.toString()}`);
		}

		// Step 2: Create database records in a transaction using RPC
		const { error: dbError } = await supabase.rpc(
			"create_website_user_with_patient",
			{
				p_supabase_id: authData.user.id,
				p_first_name: firstName.trim(),
				p_last_name: lastName.trim(),
				p_email: email.trim(),
				p_phone_number: phone.trim(),
			}
		);

		if (dbError) {
			// If database creation fails, we should ideally clean up the auth user
			// For now, log the error and redirect with a message
			console.error("Database error:", dbError);
			const params = new URLSearchParams({
				error: t("profile_setup_failed"),
			});
			if (redirectTo) params.set("redirect", redirectTo);
			redirect(`/register?${params.toString()}`);
		}

		revalidatePath("/", "layout");
		const params = new URLSearchParams({
			message: t("check_email"),
		});
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/login?${params.toString()}`);
	} catch (error) {
		console.error("Signup error:", error);
		const params = new URLSearchParams({
			error: t("unexpected_error"),
		});
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/register?${params.toString()}`);
	}
};

export const signOut = async () => {
	const supabase = await createClient();
	const t = await getTranslations("auth.actions");

	const { error } = await supabase.auth.signOut();

	if (error) {
		const params = new URLSearchParams({ error: t("unable_to_sign_out") });
		redirect(`/login?${params.toString()}`);
	}

	revalidatePath("/", "layout");
	redirect("/login");
};

export const getUser = async () => {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		return null;
	}

	return user;
};

// ---------------------------------------------------------------------------
// Password reset flow
//   1. /forgot-password  → requestPasswordReset()  → Supabase sends recovery email
//   2. email link        → /auth/callback          → session established from code
//   3. /reset-password   → resetPassword()         → password updated, back to /login
// ---------------------------------------------------------------------------

const PASSWORD_MIN_LENGTH = 8;

/** Absolute origin of the site, used to build the recovery redirect URL. */
const getSiteOrigin = async () => {
	const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	if (configured) return configured.replace(/\/+$/, "");

	const h = await headers();
	const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
	const proto =
		h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
	return `${proto}://${host}`;
};

/** Prefix a path with the current locale unless it's the default one. */
const withLocale = (locale: string, path: string) =>
	locale === routing.defaultLocale ? path : `/${locale}${path}`;

export const requestPasswordReset = async (formData: FormData) => {
	const supabase = await createClient();
	const t = await getTranslations("auth.actions");
	const locale = await getLocale();

	const email = (formData.get("email") as string | null)?.trim() ?? "";

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		const params = new URLSearchParams({ error: t("valid_email_required") });
		redirect(withLocale(locale, `/forgot-password?${params.toString()}`));
	}

	const origin = await getSiteOrigin();
	// After the user clicks the email link Supabase sends them here with a
	// one-time code; the callback turns it into a session and forwards to
	// /reset-password. Both URLs must be allow-listed in Supabase Auth.
	const next = withLocale(locale, "/reset-password/");
	const redirectTo = `${origin}${withLocale(
		locale,
		"/auth/callback/"
	)}?next=${encodeURIComponent(next)}`;

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo,
	});

	if (error) {
		console.error("Password reset request error:", error);
		// Rate limiting is the one failure the user can act on; everything else
		// falls through to the generic "sent" state so we never reveal whether
		// an email address is registered.
		if (error.status === 429 || /rate limit/i.test(error.message)) {
			const params = new URLSearchParams({ error: t("too_many_requests") });
			redirect(withLocale(locale, `/forgot-password?${params.toString()}`));
		}
	}

	const params = new URLSearchParams({ sent: "1", email });
	redirect(withLocale(locale, `/forgot-password?${params.toString()}`));
};

export const resetPassword = async (formData: FormData) => {
	const supabase = await createClient();
	const t = await getTranslations("auth.actions");
	const locale = await getLocale();

	const password = (formData.get("password") as string | null) ?? "";
	const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";

	// The recovery link must have produced a session before we can change anything.
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect(withLocale(locale, "/forgot-password?expired=1"));
	}

	if (!password || !confirmPassword) {
		const params = new URLSearchParams({ error: t("all_fields_required") });
		redirect(withLocale(locale, `/reset-password?${params.toString()}`));
	}

	if (password.length < PASSWORD_MIN_LENGTH) {
		const params = new URLSearchParams({ error: t("password_too_short") });
		redirect(withLocale(locale, `/reset-password?${params.toString()}`));
	}

	if (password !== confirmPassword) {
		const params = new URLSearchParams({ error: t("passwords_do_not_match") });
		redirect(withLocale(locale, `/reset-password?${params.toString()}`));
	}

	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		console.error("Password reset error:", error);
		const message = /same password|different from the old/i.test(error.message)
			? t("password_must_differ")
			: t("password_update_failed");
		const params = new URLSearchParams({ error: message });
		redirect(withLocale(locale, `/reset-password?${params.toString()}`));
	}

	// End the temporary recovery session so the user signs in with the new password.
	await supabase.auth.signOut();
	revalidatePath("/", "layout");

	const params = new URLSearchParams({ message: t("password_updated") });
	redirect(withLocale(locale, `/login?${params.toString()}`));
};
