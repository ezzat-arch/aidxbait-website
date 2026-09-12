"use client";

import { useMemo, useState } from "react";
import { Check, Info, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/cart-context";
import {
	defaultSelection,
	hasAvailableVariant,
	hasSelectableOptions,
	resolveVariant,
	toCartLine,
	type VariantSelection,
} from "@/lib/cart/cart-reducer";
import { MAX_QUANTITY_PER_LINE } from "@/lib/shopify/cart-limits";
import type { ShopifyProductDetailModel } from "@/lib/shopify/types";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/i18n/utils";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "@/hooks/use-toast";
import type { Locale } from "@/types/i18n";

/** Above this many values a row of radio chips stops being readable, so it becomes a dropdown. */
const MAX_VALUES_AS_RADIOS = 5;

/**
 * Variant choice, quantity and "add to cart" for one product.
 *
 * Everything is resolved from the variants already on the page: changing an
 * option costs no round trip, and a combination the merchant never created is
 * simply disabled rather than failing later at checkout.
 */
export function ProductPurchasePanel({
	product,
}: {
	product: ShopifyProductDetailModel;
}) {
	const { addLine, openCart } = useCart();
	const t = useTranslations("store.StoreShopifyContent");
	const tDetail = useTranslations("store.ProductDetail.text");
	const locale = useLocale() as Locale;

	const [selection, setSelection] = useState<VariantSelection>(() =>
		defaultSelection(product.variants)
	);
	const [quantity, setQuantity] = useState(1);

	const variant = useMemo(
		() => resolveVariant(product.variants, selection),
		[product.variants, selection]
	);

	const showOptions = hasSelectableOptions(product.options);
	const canBuy = Boolean(variant?.availableForSale);

	const money = (value: number) =>
		formatCurrency(value, DEFAULT_CURRENCY, locale);

	const handleAddToCart = () => {
		if (!variant || !variant.availableForSale) return;

		addLine(toCartLine(product, variant, quantity));
		openCart();
		toast({ title: t("added_to_cart"), description: product.title });
	};

	return (
		<div className="space-y-6">
			{/* Price comes from the selected variant, not the product's minimum, so
			    it always matches what the buyer is about to be charged. */}
			<div className="flex flex-wrap items-baseline gap-3">
				<span className="text-4xl font-bold text-primary">
					{money(variant?.price ?? Number.parseFloat(product.minPriceAmount))}
				</span>
				{variant?.compareAtPrice != null && (
					<>
						<span className="text-lg text-muted-foreground line-through">
							{money(variant.compareAtPrice)}
						</span>
						{variant.discountPercent != null && (
							<Badge variant="destructive">
								{t("save_percent", { percent: variant.discountPercent })}
							</Badge>
						)}
					</>
				)}
			</div>

			<div>
				{canBuy ? (
					<div className="flex items-center gap-2 text-green-600">
						<Check className="h-5 w-5" />
						<span className="font-medium">{tDetail("in_stock")}</span>
					</div>
				) : (
					<div className="flex items-center gap-2 text-destructive">
						<Info className="h-5 w-5" />
						<span className="font-medium">
							{variant ? t("out_of_stock") : t("unavailable_combination")}
						</span>
					</div>
				)}
			</div>

			{showOptions &&
				product.options.map((option) => (
					<OptionPicker
						key={option.name}
						option={option}
						selectedValue={selection[option.name] ?? ""}
						isValueAvailable={(value) =>
							hasAvailableVariant(product.variants, {
								...selection,
								[option.name]: value,
							})
						}
						onSelect={(value) =>
							setSelection((current) => ({ ...current, [option.name]: value }))
						}
						label={t("select_option", { name: option.name })}
					/>
				))}

			<div className="space-y-2">
				<Label htmlFor="quantity-value">{t("quantity")}</Label>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label={t("decrease_quantity")}
						disabled={quantity <= 1}
						onClick={() => setQuantity((q) => Math.max(1, q - 1))}
					>
						<Minus className="h-4 w-4" />
					</Button>
					<span
						id="quantity-value"
						aria-live="polite"
						className="w-12 text-center font-medium tabular-nums"
					>
						{quantity}
					</span>
					<Button
						variant="outline"
						size="icon"
						aria-label={t("increase_quantity")}
						disabled={quantity >= MAX_QUANTITY_PER_LINE}
						onClick={() =>
							setQuantity((q) => Math.min(MAX_QUANTITY_PER_LINE, q + 1))
						}
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<Button
				size="lg"
				className="w-full sm:w-auto"
				disabled={!canBuy}
				onClick={handleAddToCart}
			>
				<ShoppingCart className="me-2 h-4 w-4" />
				{t("add_to_cart")}
			</Button>
		</div>
	);
}

/** One product option: radio chips while the list is short, a dropdown once it is not. */
function OptionPicker({
	option,
	selectedValue,
	isValueAvailable,
	onSelect,
	label,
}: {
	option: { name: string; values: string[] };
	selectedValue: string;
	isValueAvailable: (value: string) => boolean;
	onSelect: (value: string) => void;
	label: string;
}) {
	// A value with no purchasable variant behind it is shown but not selectable,
	// which tells the buyer the combination exists but is out of stock.
	const disabledValues = new Set(
		option.values.filter((value) => !isValueAvailable(value))
	);

	if (option.values.length > MAX_VALUES_AS_RADIOS) {
		return (
			<div className="space-y-2">
				<Label>{label}</Label>
				<Select value={selectedValue} onValueChange={onSelect}>
					<SelectTrigger className="w-full sm:w-64">
						<SelectValue placeholder={label} />
					</SelectTrigger>
					<SelectContent>
						{option.values.map((value) => (
							<SelectItem
								key={value}
								value={value}
								disabled={disabledValues.has(value)}
							>
								{value}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			<RadioGroup
				value={selectedValue}
				onValueChange={onSelect}
				className="flex flex-wrap gap-4"
			>
				{option.values.map((value) => {
					const id = `${option.name}-${value}`;
					return (
						<div key={value} className="flex items-center gap-2">
							<RadioGroupItem
								value={value}
								id={id}
								disabled={disabledValues.has(value)}
							/>
							<Label
								htmlFor={id}
								className={
									disabledValues.has(value)
										? "text-muted-foreground line-through"
										: "cursor-pointer"
								}
							>
								{value}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
		</div>
	);
}
