import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { getPublishedPosts, POSTS_PER_PAGE } from "@/lib/blog";
import { buildBlogListUrl } from "@/lib/blog-format";

interface BlogPageProps {
	params: Promise<{
		locale: string;
	}>;
	searchParams: Promise<{
		page?: string;
	}>;
}

export async function generateMetadata({
	params,
}: BlogPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "blog.list.text" });

	const pageUrl = buildBlogListUrl(locale);

	return {
		title: `${t("title")} | Doctoory`,
		description: t("subtitle"),
		openGraph: {
			title: t("title"),
			description: t("subtitle"),
			url: pageUrl,
			siteName: "Doctoory",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("subtitle"),
		},
		alternates: {
			canonical: pageUrl,
		},
	};
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
	const { locale } = await params;
	const { page: pageParam } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: "blog.list.text" });

	const parsedPage = Number.parseInt(pageParam ?? "1", 10);
	const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const { posts, total } = await getPublishedPosts(page, POSTS_PER_PAGE);
	const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

	// ?page= beyond the last page: go back to page 1 instead of rendering a
	// false "no posts published yet" state.
	if (posts.length === 0 && page > 1) {
		redirect({ href: "/blog/", locale });
	}

	return (
		<div className="min-h-screen bg-background pt-40">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-10 text-center">
					<h1 className="text-4xl font-bold mb-3">{t("title")}</h1>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						{t("subtitle")}
					</p>
				</header>

				{posts.length === 0 ? (
					<p className="text-center text-muted-foreground py-16">
						{t("empty")}
					</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{posts.map((post) => (
							<BlogPostCard
								key={post.id}
								post={post}
								locale={locale}
								readMoreLabel={t("read_more")}
							/>
						))}
					</div>
				)}

				<BlogPagination
					page={page}
					totalPages={totalPages}
					previousLabel={t("previous")}
					nextLabel={t("next")}
				/>
			</div>
		</div>
	);
}
