// Pure formatting/parsing helpers for the blog module. No data access here —
// safe to import from any server or client component (see lib/blog.ts for
// the Supabase fetchers).
import { routing } from "@/i18n/routing";

// The intl middleware uses localePrefix "as-needed": the default locale (en)
// is served WITHOUT a prefix and /en/... 307-redirects to /... — so absolute
// URLs (canonical, og, sitemap, JSON-LD) must omit the prefix for it.
export function localeUrlPrefix(locale: string): string {
	return locale === routing.defaultLocale ? "" : `/${locale}`;
}

// Absolute URL of a blog post from a raw DB slug.
export function buildBlogPostUrl(locale: string, slug: string): string {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	return `${baseUrl}${localeUrlPrefix(locale)}/blog/${encodeURIComponent(
		decodeURIComponent(slug)
	)}/`;
}

// Absolute URL of the blog listing.
export function buildBlogListUrl(locale: string): string {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	return `${baseUrl}${localeUrlPrefix(locale)}/blog/`;
}

// Remove <script> blocks before rendering dashboard-authored HTML
export function stripScriptsFromHtml(html: string): string {
	return html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

export function htmlToPlainText(html: string): string {
	return stripScriptsFromHtml(html)
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function formatPostDate(
	dateString: string | null,
	locale: string
): string {
	if (!dateString) return "";
	try {
		return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
			dateStyle: "long",
		}).format(new Date(dateString));
	} catch {
		return "";
	}
}

// Derive an embeddable player URL from a YouTube/Vimeo link, or null when the
// URL should fall back to a native <video> element.
export function getVideoEmbedUrl(url: string): string | null {
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");
		if (host === "youtube.com") {
			if (parsed.pathname === "/watch") {
				const videoId = parsed.searchParams.get("v");
				return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
			}
			if (parsed.pathname.startsWith("/embed/")) {
				return url;
			}
			if (parsed.pathname.startsWith("/shorts/")) {
				const videoId = parsed.pathname.split("/")[2];
				return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
			}
			return null;
		}
		if (host === "youtu.be") {
			const videoId = parsed.pathname.split("/").filter(Boolean)[0];
			return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
		}
		if (host === "vimeo.com") {
			const videoId = parsed.pathname.split("/").filter(Boolean)[0];
			return videoId && /^\d+$/.test(videoId)
				? `https://player.vimeo.com/video/${videoId}`
				: null;
		}
		if (host === "player.vimeo.com") {
			return url;
		}
		return null;
	} catch {
		return null;
	}
}

// Prefer the translation for the current locale, fall back to the matched
// language (the one whose slug was requested), then to whatever exists.
export function pickPostTranslation<T extends { language: string }>(
	translations: T[],
	locale: string,
	matchedLanguage?: string
): T | null {
	return (
		translations.find((t) => t.language === locale) ??
		(matchedLanguage
			? translations.find((t) => t.language === matchedLanguage)
			: undefined) ??
		translations[0] ??
		null
	);
}

// Meta/JSON-LD description: explicit meta description, else excerpt, else the
// beginning of the content as plain text.
export function getPostDescription(
	translation: {
		meta_description: string | null;
		excerpt: string | null;
		content: string;
	},
	maxLength: number
): string {
	return (
		translation.meta_description ||
		translation.excerpt ||
		htmlToPlainText(translation.content)
	).slice(0, maxLength);
}
