import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
	// Handle internationalization first
	const intlResponse = intlMiddleware(request);
	
	// If intl middleware returns a response (redirect), handle Supabase session for it
	if (intlResponse) {
		const supabaseResponse = await updateSession(request);
		
		// Merge headers from both middlewares
		const response = intlResponse;
		supabaseResponse.headers.forEach((value, key) => {
			response.headers.set(key, value);
		});
		
		return response;
	}
	
	// Otherwise, just handle Supabase session
	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - icon.png (app icon)
		 * - images/ (public images)
		 * - placeholder.* (placeholder assets)
		 * - sitemap.xml (sitemap)
		 * - robots.txt (robots file)
		 * - Files with extensions
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|icon.png|images/|placeholder.*|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
