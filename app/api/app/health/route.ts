import { NextResponse } from "next/server";

/**
 * GET /api/app/health
 *
 * Health check endpoint for mobile app backend
 */
export async function GET() {
	return NextResponse.json(
		{ status: "ok", timestamp: new Date().toISOString() },
		{ status: 200 }
	);
}
