import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Create admin client with service role key
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ success: false, error: "Email is required" },
				{ status: 400 }
			);
		}

		// Get user by email
		const { data: users, error: getUserError } =
			await supabaseAdmin.auth.admin.listUsers();

		if (getUserError) {
			console.error("Error fetching users:", getUserError);
			return NextResponse.json(
				{ success: false, error: "Failed to fetch user" },
				{ status: 500 }
			);
		}

		const user = users.users.find((u) => u.email === email);

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 }
			);
		}

		// Update user to confirm email
		const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
			user.id,
			{
				email_confirm: true,
			}
		);

		if (error) {
			console.error("Error confirming user:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "User email confirmed successfully",
			user: data.user,
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
