import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogRichText } from "@/components/blog/BlogRichText";
import { BlogVideoEmbed } from "@/components/blog/BlogVideoEmbed";
import type { PostItem } from "@/lib/blog-types";

interface BlogPostItemProps {
	item: PostItem;
	/** Post title, used for image alt text / iframe titles */
	postTitle: string;
	visitLinkLabel: string;
}

/**
 * One ordered content block of a blog post: a rich-text body plus whichever
 * optional media the editor attached — an image URL, a video URL
 * (YouTube/Vimeo embed or native video) and/or an external link.
 */
export function BlogPostItem({
	item,
	postTitle,
	visitLinkLabel,
}: BlogPostItemProps) {
	return (
		<section className="mb-10 space-y-6">
			<BlogRichText html={item.body} />

			{item.image && (
				<div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
					<Image
						src={item.image}
						alt={postTitle}
						fill
						className="object-cover"
						sizes="(min-width: 1024px) 896px, 100vw"
					/>
				</div>
			)}

			{item.video && <BlogVideoEmbed url={item.video} title={postTitle} />}

			{item.link && (
				<Button variant="outline" asChild>
					<a href={item.link} target="_blank" rel="noopener noreferrer">
						{visitLinkLabel}
						<ExternalLink className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
					</a>
				</Button>
			)}
		</section>
	);
}
