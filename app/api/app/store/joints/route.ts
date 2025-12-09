import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/app/store/joints
 *
 * Fetch all available joints for filtering products
 */
export async function GET(request: NextRequest) {
	try {
		const { data, error } = await supabaseAdmin
			.from("product_joint_names")
			.select("id, name, name_ar")
			.order("name");

		if (error) {
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
