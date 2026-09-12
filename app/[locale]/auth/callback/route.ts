import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

/**
 * Auth callback — the landing point for Supabase email links.
 *
 * Supports both link styles Supabase can send:
 *   • PKCE:        /auth/callback?code=...                (default templates)
 *   • Token hash:  /auth/callback?token_hash=...&type=recovery  (custom templates)
 *
 * On success the user has a session and is forwarded to `next`
 * (default: /reset-password). On failure they go back to /forgot-password
 * with an explanatory message.
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ locale: string }> }
) {
	const { locale: rawLocale } = await params;
	const locale = routing.locales.includes(rawLocale as (typeof routing.locales)[number])
		? rawLocale
		: routing.defaultLocale;
	const withLocale = (path: string) =>
		locale === routing.defaultLocale ? path : `/${locale}${path}`;

	const { searchParams, origin } = request.nextUrl;
	const code = searchParams.get("code");
	const tokenHash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;
	const providerError =
		searchParams.get("error_description") ?? searchParams.get("error");

	// Only allow relative, same-site destinations.
	const rawNext = searchParams.get("next") ?? "";
	const next =
		rawNext.startsWith("/") && !rawNext.startsWith("//")
			? rawNext
			: withLocale("/reset-password/");

	const t = await getTranslations({ locale, namespace: "auth.actions" });

	const fail = (message: string) => {
		const url = new URL(withLocale("/forgot-password/"), origin);
		url.searchParams.set("error", message);
		return NextResponse.redirect(url);
	};

	if (providerError) {
		console.error("Auth callback provider error:", providerError);
		return fail(t("reset_link_invalid"));
	}

	const supabase = await createClient();

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error("Auth callback code exchange failed:", error);
			// The PKCE verifier lives in a cookie set by the browser that requested
			// the reset. Opening the email in another browser/device cannot succeed.
			const wrongBrowser =
				error.name === "AuthPKCECodeVerifierMissingError" ||
				/code verifier/i.test(error.message);
			return fail(t(wrongBrowser ? "reset_link_wrong_browser" : "reset_link_invalid"));
		}
		return NextResponse.redirect(new URL(next, origin));
	}

	if (tokenHash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
		if (error) {
			console.error("Auth callback OTP verification failed:", error);
			return fail(t("reset_link_invalid"));
		}
		return NextResponse.redirect(new URL(next, origin));
	}

	return fail(t("reset_link_invalid"));
}
