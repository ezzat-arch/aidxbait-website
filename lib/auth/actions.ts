"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const login = async (formData: FormData) => {
	const supabase = await createClient();

	// Extract and validate form data
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const redirectTo = formData.get("redirect") as string | null;

	// Basic validation
	if (!email?.trim() || !password?.trim()) {
		const params = new URLSearchParams({
			error: "Email and password are required",
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
			error: "Login failed. Please try again.",
		});
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/login?${params.toString()}`);
	}

	revalidatePath("/", "layout");
	redirect(redirectTo || "/");
};

export const signup = async (formData: FormData) => {
	const supabase = await createClient();

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
		const params = new URLSearchParams({ error: "All fields are required" });
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
				error: "Failed to create user account",
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
				error:
					"Account created but profile setup failed. Please contact support.",
			});
			if (redirectTo) params.set("redirect", redirectTo);
			redirect(`/register?${params.toString()}`);
		}

		revalidatePath("/", "layout");
		const params = new URLSearchParams({
			message: "Check your email to confirm your account",
		});
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/login?${params.toString()}`);
	} catch (error) {
		console.error("Signup error:", error);
		const params = new URLSearchParams({
			error: "An unexpected error occurred. Please try again.",
		});
		if (redirectTo) params.set("redirect", redirectTo);
		redirect(`/register?${params.toString()}`);
	}
};

export const signOut = async () => {
	const supabase = await createClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		redirect("/login?error=Unable to sign out");
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
