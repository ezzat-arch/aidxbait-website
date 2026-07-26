import { stripScriptsFromHtml } from "@/lib/blog-format";

interface BlogRichTextProps {
	html: string;
	className?: string;
}

/**
 * Renders dashboard-authored rich-text HTML (TinyMCE output) with the site's
 * prose styling. <script> blocks are stripped server-side before rendering.
 */
export function BlogRichText({ html, className = "" }: BlogRichTextProps) {
	return (
		<div
			className={`prose prose-neutral dark:prose-invert max-w-none ${className}`.trim()}
			dangerouslySetInnerHTML={{ __html: stripScriptsFromHtml(html) }}
		/>
	);
}
