import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

export const updateSession = async (request: NextRequest) => {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value)
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				},
			},
		}
	);

	// IMPORTANT: Avoid writing any logic between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Detect locale from pathname (e.g., /ar/login -> ar)
	const pathname = request.nextUrl.pathname;
	const localeMatch = routing.locales.find(
		(locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	);

	// Strip locale from pathname for route checking (e.g., /ar/login -> /login)
	let cleanPathname = pathname;
	if (localeMatch) {
		cleanPathname = pathname.replace(new RegExp(`^/${localeMatch}`), "") || "/";
	}

	// Helper to build locale-aware paths
	const localePath = (path: string) => {
		if (localeMatch && localeMatch !== routing.defaultLocale) {
			return `/${localeMatch}${path}`;
		}
		return path;
	};

	// If user is authenticated and trying to access auth pages, redirect to home
	if (
		user &&
		(cleanPathname === "/login" ||
			cleanPathname === "/login/" ||
			cleanPathname === "/register" ||
			cleanPathname === "/register/")
	) {
		const url = request.nextUrl.clone();
		url.pathname = localePath("/");
		return NextResponse.redirect(url);
	}

	// Protected routes - redirect to login if not authenticated
	// Allow public routes: login, register, auth callback, API routes, and static assets
	const isPublicRoute =
		cleanPathname === "/" ||
		cleanPathname.startsWith("/login") ||
		cleanPathname.startsWith("/register") ||
		cleanPathname.startsWith("/auth") ||
		cleanPathname.startsWith("/api") ||
		cleanPathname.startsWith("/_next") ||
		cleanPathname.startsWith("/services") ||
		cleanPathname.startsWith("/contact") ||
		cleanPathname.startsWith("/about") ||
		cleanPathname.startsWith("/forgot-password") ||
		cleanPathname.startsWith("/terms") ||
		cleanPathname.startsWith("/privacy") ||
		cleanPathname.includes(".");

	if (!user && !isPublicRoute) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = localePath("/login");
		return NextResponse.redirect(url);
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse;
};
