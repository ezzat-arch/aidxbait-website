import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/app/manifest-rewriter
 *
 * Rewrites HLS manifest files to include authentication tokens for secure video playback.
 * This endpoint:
 * 1. Validates the user's JWT token
 * 2. Fetches the original manifest from CloudFront
 * 3. Rewrites all URLs in the manifest to include the auth token
 * 4. Returns the rewritten manifest content
 *
 * Body: { videoUrl: string }
 * Headers: Authorization: Bearer <jwt_token>
 */
export async function POST(request: NextRequest) {
	try {
		// ------------------------------------------------------------------------
		// 1. Extract and validate body
		// ------------------------------------------------------------------------
		const body = await request.json();
		const { videoUrl } = body;

		if (!videoUrl) {
			return NextResponse.json(
				{ success: false, error: "Video URL is required" },
				{ status: 400 }
			);
		}

		// ------------------------------------------------------------------------
		// 2. Extract JWT from Authorization header
		// ------------------------------------------------------------------------
		const authHeader = request.headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json(
				{ success: false, error: "Authorization header is required" },
				{ status: 401 }
			);
		}
		const token = authHeader.replace("Bearer ", "");

		// ------------------------------------------------------------------------
		// 3. Validate token with Supabase
		// ------------------------------------------------------------------------
		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(token);

		if (authError || !user) {
			return NextResponse.json(
				{ success: false, error: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		// ------------------------------------------------------------------------
		// 4. Fetch the original manifest
		// ------------------------------------------------------------------------
		const manifestRes = await fetch(videoUrl, {
			method: "GET",
			headers: {
				// Forward the same JWT for private buckets if needed
				Authorization: `Bearer ${token}`,
			},
		});

		if (!manifestRes.ok) {
			const txt = await manifestRes.text();
			console.error(
				"Failed to fetch manifest",
				videoUrl,
				manifestRes.status,
				txt
			);
			return NextResponse.json(
				{ success: false, error: "Unable to fetch manifest" },
				{ status: manifestRes.status }
			);
		}

		const originalManifest = await manifestRes.text();

		// Compute the manifest directory and server origin for URL resolution
		const manifestDir = videoUrl.substring(0, videoUrl.lastIndexOf("/") + 1);

		// Use configured APP_URL for API endpoints (e.g., /api/aes-key)
		// This ensures mobile devices can reach these URLs (localhost won't work from devices)
		// Falls back to request origin for local development without the env var
		const serverOrigin =
			process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

		// Debug logging for development
		if (process.env.NODE_ENV === "development") {
			console.log("[manifest-rewriter] Using serverOrigin:", serverOrigin);
		}

		// ------------------------------------------------------------------------
		// 5. Rewrite manifest
		// ------------------------------------------------------------------------
		const rewrittenManifest = rewriteManifest(
			originalManifest,
			token,
			manifestDir,
			serverOrigin
		);

		// ------------------------------------------------------------------------
		// 6. Return rewritten manifest
		// ------------------------------------------------------------------------
		return new Response(rewrittenManifest, {
			status: 200,
			headers: {
				"Content-Type": "application/vnd.apple.mpegurl",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error("Manifest rewriter API error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 }
		);
	}
}

/**
 * Append the token as a query param, preserving existing params.
 */
function appendToken(url: string, token: string): string {
	// Handle empty/placeholder lines gracefully
	if (!url) return url;
	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}token=${token}`;
}

/**
 * Make a possibly-relative URL absolute.
 * `ref` is the line value (segment path or URI attribute).
 * For segments we use the original manifest directory as base.
 * For our API paths (those starting with "/api/") we use the current
 * server origin so the player can reach them even when the manifest is a data: URL.
 */
function absolutize(
	ref: string,
	manifestDir: string,
	serverOrigin: string
): string {
	if (ref.startsWith("http")) return ref; // already absolute
	if (ref.startsWith("/api/")) return `${serverOrigin}${ref}`;
	// otherwise treat as relative segment path
	return `${manifestDir}${ref}`;
}

/**
 * Rewrite the manifest content by adding the token to every URL reference.
 */
function rewriteManifest(
	manifest: string,
	token: string,
	manifestDir: string,
	serverOrigin: string
): string {
	const addToken = (url: string) =>
		appendToken(absolutize(url, manifestDir, serverOrigin), token);

	return manifest
		.split("\n")
		.map((line) => {
			const trimmed = line.trim();

			// Key directive lines – replace URI attribute
			if (trimmed.startsWith("#EXT-X-KEY")) {
				return line.replace(
					/URI="([^"]+)"/g,
					(_m, p1) => `URI="${addToken(p1)}"`
				);
			}
			// Skip comments / blank lines
			if (trimmed.startsWith("#") || trimmed === "") return line;

			// Segment or sub-playlist line
			return addToken(line);
		})
		.join("\n");
}

