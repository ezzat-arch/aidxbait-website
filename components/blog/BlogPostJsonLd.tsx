import { buildBlogListUrl, getPostDescription } from "@/lib/blog-format";
import type { PostDetail, PostTranslation } from "@/lib/blog-types";

interface BlogPostJsonLdProps {
	post: PostDetail;
	translation: PostTranslation;
	postUrl: string;
	baseUrl: string;
	locale: string;
	homeLabel: string;
	blogLabel: string;
}

/**
 * SEO structured data for a blog post: BlogPosting + BreadcrumbList JSON-LD
 * script tags.
 */
export function BlogPostJsonLd({
	post,
	translation,
	postUrl,
	baseUrl,
	locale,
	homeLabel,
	blogLabel,
}: BlogPostJsonLdProps) {
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: translation.title,
		image: post.featured_image ? [post.featured_image] : [],
		description: getPostDescription(translation, 500),
		inLanguage: translation.language,
		datePublished: post.published_at || post.created_at,
		dateModified: post.updated_at,
		mainEntityOfPage: postUrl,
		author: {
			"@type": "Organization",
			name: "Doctoory",
		},
		publisher: {
			"@type": "Organization",
			name: "Doctoory",
		},
	};

	const breadcrumbData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: homeLabel,
				item: baseUrl,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: blogLabel,
				item: buildBlogListUrl(locale),
			},
			{
				"@type": "ListItem",
				position: 3,
				name: translation.title,
				item: postUrl,
			},
		],
	};

	// Escape "<" as < so dashboard-authored text (titles, descriptions)
	// can never close the script tag or open an HTML comment; < is valid
	// JSON, so crawlers still parse the structured data.
	const toJsonLd = (data: unknown) =>
		JSON.stringify(data).replace(/</g, "\\u003c");

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: toJsonLd(structuredData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbData) }}
			/>
		</>
	);
}
