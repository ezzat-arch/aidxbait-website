import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogBreadcrumb } from "@/components/blog/BlogBreadcrumb";
import { BlogPostHeader } from "@/components/blog/BlogPostHeader";
import { BlogPostItem } from "@/components/blog/BlogPostItem";
import { BlogPostJsonLd } from "@/components/blog/BlogPostJsonLd";
import { BlogRelatedProducts } from "@/components/blog/BlogRelatedProducts";
import { BlogRichText } from "@/components/blog/BlogRichText";
import { getPostBySlug, getRelatedShopifyProductCards } from "@/lib/blog";
import {
	buildBlogPostUrl,
	formatPostDate,
	getPostDescription,
	pickPostTranslation,
} from "@/lib/blog-format";

interface BlogPostPageProps {
	params: Promise<{
		locale: string;
		slug: string;
	}>;
}

export async function generateMetadata({
	params,
}: BlogPostPageProps): Promise<Metadata> {
	const { locale, slug } = await params;
	const result = await getPostBySlug(slug);

	const translation = result
		? pickPostTranslation(
				result.post.post_translations,
				locale,
				result.matchedLanguage
			)
		: null;

	if (!result || !translation) {
		const t = await getTranslations({ locale, namespace: "blog.post.text" });
		return {
			title: t("not_found_title"),
		};
	}

	const title = translation.meta_title || translation.title;
	const description = getPostDescription(translation, 155);
	// Canonicalize on the RENDERED translation's slug — the same post is also
	// reachable through its other language's slug.
	const postUrl = buildBlogPostUrl(locale, translation.slug);
	const languages = Object.fromEntries(
		result.post.post_translations.map((tr) => [
			tr.language,
			buildBlogPostUrl(tr.language, tr.slug),
		])
	);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: postUrl,
			siteName: "Doctoory",
			images: result.post.featured_image
				? [{ url: result.post.featured_image, alt: translation.title }]
				: [],
			type: "article",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: result.post.featured_image ? [result.post.featured_image] : [],
		},
		alternates: {
			canonical: postUrl,
			languages,
		},
	};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: "blog.post.text" });

	const result = await getPostBySlug(slug);
	if (!result) {
		notFound();
	}

	const { post, matchedLanguage } = result;
	const translation = pickPostTranslation(
		post.post_translations,
		locale,
		matchedLanguage
	);
	if (!translation) {
		notFound();
	}

	const dateLabel = formatPostDate(post.published_at || post.created_at, locale);
	const relatedProducts = await getRelatedShopifyProductCards(
		post.post_shopify_products || [],
		locale
	);

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const postUrl = buildBlogPostUrl(locale, translation.slug);

	// Keep the article readable when the shown translation's language differs
	// from the page locale (a slug always belongs to one language).
	const articleDir = translation.language === "ar" ? "rtl" : "ltr";

	return (
		<>
			<BlogPostJsonLd
				post={post}
				translation={translation}
				postUrl={postUrl}
				baseUrl={baseUrl}
				locale={locale}
				homeLabel={t("home")}
				blogLabel={t("blog")}
			/>

			<div className="min-h-screen bg-background pt-40">
				<div className="container mx-auto px-4 py-8">
					<BlogBreadcrumb
						homeLabel={t("home")}
						blogLabel={t("blog")}
						title={translation.title}
					/>

					<Button variant="ghost" className="mb-6 -ml-4" asChild>
						<Link href="/blog/">
							<ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2 rtl:rotate-180" />
							{t("back_to_blog")}
						</Link>
					</Button>

					<article className="max-w-4xl mx-auto" dir={articleDir}>
						<BlogPostHeader
							title={translation.title}
							excerpt={translation.excerpt}
							featuredImage={post.featured_image}
							publishedLabel={
								dateLabel ? t("published_on", { date: dateLabel }) : ""
							}
						/>

						<BlogRichText html={translation.content} className="mb-10" />

						{translation.post_items.map((item) => (
							<BlogPostItem
								key={item.id}
								item={item}
								postTitle={translation.title}
								visitLinkLabel={t("visit_link")}
							/>
						))}
					</article>

					<BlogRelatedProducts
						products={relatedProducts}
						heading={t("related_products")}
					/>
				</div>
			</div>
		</>
	);
}
