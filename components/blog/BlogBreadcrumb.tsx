import { Link } from "@/i18n/navigation";

interface BlogBreadcrumbProps {
	homeLabel: string;
	blogLabel: string;
	title: string;
}

/**
 * Home / Blog / <post title> breadcrumb trail shown above a blog post.
 */
export function BlogBreadcrumb({
	homeLabel,
	blogLabel,
	title,
}: BlogBreadcrumbProps) {
	return (
		<nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
			<Link href="/" className="hover:text-primary">
				{homeLabel}
			</Link>
			<span>/</span>
			<Link href="/blog/" className="hover:text-primary">
				{blogLabel}
			</Link>
			<span>/</span>
			<span className="text-foreground line-clamp-1">{title}</span>
		</nav>
	);
}
