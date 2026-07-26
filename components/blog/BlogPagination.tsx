import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface BlogPaginationProps {
	page: number;
	totalPages: number;
	previousLabel: string;
	nextLabel: string;
}

/**
 * Previous/Next pagination for the blog listing, driven by the ?page= query
 * param. Renders nothing when there is a single page.
 */
export function BlogPagination({
	page,
	totalPages,
	previousLabel,
	nextLabel,
}: BlogPaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<nav className="flex items-center justify-center gap-4 mt-10">
			{page > 1 ? (
				<Button variant="outline" asChild>
					<Link href={`/blog/?page=${page - 1}`}>
						<ChevronLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2 rtl:rotate-180" />
						{previousLabel}
					</Link>
				</Button>
			) : (
				<Button variant="outline" disabled>
					<ChevronLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2 rtl:rotate-180" />
					{previousLabel}
				</Button>
			)}
			<span className="text-sm text-muted-foreground">
				{page} / {totalPages}
			</span>
			{page < totalPages ? (
				<Button variant="outline" asChild>
					<Link href={`/blog/?page=${page + 1}`}>
						{nextLabel}
						<ChevronRight className="h-4 w-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
					</Link>
				</Button>
			) : (
				<Button variant="outline" disabled>
					{nextLabel}
					<ChevronRight className="h-4 w-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
				</Button>
			)}
		</nav>
	);
}
