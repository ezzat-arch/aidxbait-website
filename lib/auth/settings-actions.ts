"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(data: {
	firstName: string;
	lastName: string;
	phoneNumber: string;
}): Promise<{ error?: string; success?: boolean }> {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: "Not authenticated" };
	}

	if (!data.firstName?.trim() || !data.lastName?.trim()) {
		return { error: "First name and last name are required" };
	}

	const updateData: Record<string, string> = {
		first_name: data.firstName.trim(),
		last_name: data.lastName.trim(),
	};

	if (data.phoneNumber?.trim()) {
		updateData.phone_number = data.phoneNumber.trim();
	}

	const { error } = await supabase
		.from("users")
		.update(updateData)
		.eq("supabase_id", user.id);

	if (error) {
		return { error: "Failed to update profile. Please try again." };
	}

	revalidatePath("/", "layout");
	return { success: true };
}

export async function changePassword(data: {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}): Promise<{ error?: string; success?: boolean }> {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: "Not authenticated" };
	}

	if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
		return { error: "All fields are required" };
	}

	if (data.newPassword !== data.confirmPassword) {
		return { error: "New passwords do not match" };
	}

	if (data.newPassword.length < 8) {
		return { error: "Password must be at least 8 characters" };
	}

	if (data.newPassword === data.currentPassword) {
		return { error: "New password must be different from current password" };
	}

	// Verify current password by re-authenticating
	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: user.email!,
		password: data.currentPassword,
	});

	if (signInError) {
		return { error: "Current password is incorrect" };
	}

	const { error } = await supabase.auth.updateUser({
		password: data.newPassword,
	});

	if (error) {
		return { error: "Failed to update password. Please try again." };
	}

	return { success: true };
}

export async function deleteAccount(
	password: string
): Promise<{ error?: string; success?: boolean }> {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: "Not authenticated" };
	}

	if (!password) {
		return { error: "Password is required to delete your account" };
	}

	// Verify password before deletion
	const { error: signInError } = await supabase.auth.signInWithPassword({
		email: user.email!,
		password,
	});

	if (signInError) {
		return { error: "Incorrect password" };
	}

	// Delete auth user (DB records cascade via FK constraints)
	const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
		user.id
	);

	if (deleteError) {
		return { error: "Failed to delete account. Please try again." };
	}

	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/");
}
