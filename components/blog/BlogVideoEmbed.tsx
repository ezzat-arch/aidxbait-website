import { getVideoEmbedUrl } from "@/lib/blog-format";

interface BlogVideoEmbedProps {
	url: string;
	title: string;
}

/**
 * Renders a video URL from a blog content block: YouTube/Vimeo links become a
 * responsive iframe embed, anything else falls back to a native <video>.
 */
export function BlogVideoEmbed({ url, title }: BlogVideoEmbedProps) {
	const embedUrl = getVideoEmbedUrl(url);

	if (embedUrl) {
		return (
			<div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
				<iframe
					src={embedUrl}
					title={title}
					className="absolute inset-0 h-full w-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</div>
		);
	}

	return (
		<video controls className="w-full rounded-lg">
			<source src={url} />
		</video>
	);
}
