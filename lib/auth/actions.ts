"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const login = async (formData: FormData) => {
	const supabase = await createClient();

	// Extract and validate form data
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	// Basic validation
	if (!email?.trim() || !password?.trim()) {
		redirect("/login?error=Email and password are required");
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
						redirect("/");
					}
				}
			} catch (confirmError) {
				console.error("Auto-confirmation failed:", confirmError);
			}
		}

		// Use the actual error message from Supabase
		const errorMessage = encodeURIComponent(error.message);
		redirect(`/login?error=${errorMessage}`);
	}

	// Check if user exists
	if (!data.user) {
		redirect("/login?error=Login failed. Please try again.");
	}

	revalidatePath("/", "layout");
	redirect("/");
};

export const signup = async (formData: FormData) => {
	const supabase = await createClient();

	// Extract form data
	const firstName = formData.get("firstName") as string;
	const lastName = formData.get("lastName") as string;
	const email = formData.get("email") as string;
	const phone = formData.get("phone") as string;
	const password = formData.get("password") as string;

	// Validate required fields
	if (
		!firstName?.trim() ||
		!lastName?.trim() ||
		!email?.trim() ||
		!phone?.trim() ||
		!password?.trim()
	) {
		redirect("/register?error=All fields are required");
	}

	try {
		// Step 1: Create auth user
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
		});

		if (authError) {
			redirect(`/register?error=${encodeURIComponent(authError.message)}`);
		}

		if (!authData.user?.id) {
			redirect("/register?error=Failed to create user account");
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
			redirect(
				"/register?error=Account created but profile setup failed. Please contact support."
			);
		}

		revalidatePath("/", "layout");
		redirect("/login?message=Check your email to confirm your account");
	} catch (error) {
		console.error("Signup error:", error);
		redirect("/register?error=An unexpected error occurred. Please try again.");
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
