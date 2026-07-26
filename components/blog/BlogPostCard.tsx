import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatPostDate, pickPostTranslation } from "@/lib/blog-format";
import type { PostListItem } from "@/lib/blog-types";

interface BlogPostCardProps {
	post: PostListItem;
	locale: string;
	readMoreLabel: string;
}

/**
 * One post card on the blog listing: featured image, date, localized title and
 * excerpt, linking to /blog/[slug].
 */
export function BlogPostCard({ post, locale, readMoreLabel }: BlogPostCardProps) {
	const translation = pickPostTranslation(post.post_translations, locale);
	if (!translation) return null;

	// Keep card text readable when the shown translation's language differs
	// from the page locale.
	const cardDir = translation.language === "ar" ? "rtl" : "ltr";
	const dateLabel = formatPostDate(post.published_at || post.created_at, locale);

	return (
		<Link href={`/blog/${encodeURIComponent(translation.slug)}/`}>
			<Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
				<div className="relative aspect-[16/10] overflow-hidden bg-muted">
					{post.featured_image ? (
						<Image
							src={post.featured_image}
							alt={translation.title}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-105"
							sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
						/>
					) : (
						<div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50" />
					)}
				</div>
				<CardContent className="p-4">
					{dateLabel && (
						<p className="text-xs text-muted-foreground mb-2">{dateLabel}</p>
					)}
					<h2
						dir={cardDir}
						className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors"
					>
						{translation.title}
					</h2>
					{translation.excerpt && (
						<p
							dir={cardDir}
							className="text-sm text-muted-foreground line-clamp-2 mb-2"
						>
							{translation.excerpt}
						</p>
					)}
					<span className="text-sm font-medium text-primary">
						{readMoreLabel}
					</span>
				</CardContent>
			</Card>
		</Link>
	);
}
