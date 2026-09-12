"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { CartLine } from "@/lib/store-types";
import { useCart } from "@/contexts/cart-context";
import { useLocale, useTranslations } from "next-intl";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/i18n/utils";
import { MAX_QUANTITY_PER_LINE } from "@/lib/shopify/cart-limits";
import type { Locale } from "@/types/i18n";

/** One line of the cart sidebar: image, title, unit price, stepper, line total. */
export function CartItem({
	line,
	className,
}: {
	line: CartLine;
	className?: string;
}) {
	const { setQuantity, removeLine } = useCart();
	const t = useTranslations("store.CartItemLabels");
	const locale = useLocale() as Locale;

	const money = (value: number) =>
		formatCurrency(value, DEFAULT_CURRENCY, locale);

	// Shopify carries the handle on the line, so the link works without a fetch.
	const productHref = `/services/store/products/${encodeURIComponent(line.handle)}/`;

	return (
		<div className={`flex gap-4 py-4 ${className ?? ""}`}>
			<div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
				<Link href={productHref}>
					{line.imageUrl ? (
						<Image
							src={line.imageUrl}
							alt={line.title}
							fill
							className="object-cover"
							sizes="64px"
						/>
					) : (
						<span className="sr-only">{line.title}</span>
					)}
				</Link>
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-start gap-2 mb-2">
					<div className="flex-1 min-w-0">
						<Link href={productHref}>
							<h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
								{line.title}
							</h3>
						</Link>
						{line.variantTitle && (
							<p className="text-xs text-muted-foreground mt-1">
								{line.variantTitle}
							</p>
						)}
					</div>

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-destructive"
						aria-label={t("remove")}
						onClick={() => removeLine(line.variantId)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex justify-between items-center gap-2">
					<span className="font-semibold text-primary">
						{money(line.price)}
					</span>

					{/* No stepper primitive exists in components/ui, so two buttons and a
					    readout. Gaps and order flip with the document direction. */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-7 w-7"
							aria-label={t("decrease_quantity")}
							onClick={() => setQuantity(line.variantId, line.quantity - 1)}
						>
							<Minus className="h-3 w-3" />
						</Button>

						<span className="w-8 text-center text-sm font-medium tabular-nums">
							{line.quantity}
						</span>

						<Button
							variant="outline"
							size="icon"
							className="h-7 w-7"
							aria-label={t("increase_quantity")}
							disabled={line.quantity >= MAX_QUANTITY_PER_LINE}
							onClick={() => setQuantity(line.variantId, line.quantity + 1)}
						>
							<Plus className="h-3 w-3" />
						</Button>
					</div>
				</div>

				<div className="flex justify-between items-center mt-2 gap-2">
					<div className="text-xs text-muted-foreground">
						{line.quantity} × {money(line.price)}
					</div>
					<div className="font-semibold">
						{money(line.price * line.quantity)}
					</div>
				</div>
			</div>
		</div>
	);
}
