import Image from "next/image";

interface BlogPostHeaderProps {
	title: string;
	excerpt: string | null;
	featuredImage: string | null;
	/** Fully formatted "Published on <date>" line; empty string hides it */
	publishedLabel: string;
}

/**
 * Blog post hero: featured image, title, publish date and excerpt lead.
 */
export function BlogPostHeader({
	title,
	excerpt,
	featuredImage,
	publishedLabel,
}: BlogPostHeaderProps) {
	return (
		<>
			{featuredImage && (
				<div className="relative aspect-video overflow-hidden rounded-xl bg-muted mb-8">
					<Image
						src={featuredImage}
						alt={title}
						fill
						className="object-cover"
						sizes="(min-width: 1024px) 896px, 100vw"
						priority
					/>
				</div>
			)}

			<header className="mb-8">
				<h1 className="text-4xl font-bold mb-4">{title}</h1>
				{publishedLabel && (
					<p className="text-sm text-muted-foreground mb-4">{publishedLabel}</p>
				)}
				{excerpt && (
					<p className="text-lg text-muted-foreground leading-relaxed">
						{excerpt}
					</p>
				)}
			</header>
		</>
	);
}
