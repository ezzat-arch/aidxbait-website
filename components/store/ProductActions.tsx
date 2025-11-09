"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Heart } from "lucide-react";
import { Product } from "@/lib/store-types";
import { useCart } from "@/contexts/cart-context";

interface ProductActionsProps {
	product: Product;
	isInStock: boolean;
}

export function ProductActions({ product, isInStock }: ProductActionsProps) {
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const { addToCart } = useCart();
	const router = useRouter();
	const t = useTranslations("store.ProductActions.text");

	const handleAddToCart = async () => {
		if (!isInStock) return;

		setIsAddingToCart(true);
		addToCart(product, quantity);

		setTimeout(() => {
			setIsAddingToCart(false);
			router.push("/services/store?openCart=true");
		}, 300);
	};

	const handleBuyNow = async () => {
		if (!isInStock) return;

		setIsAddingToCart(true);
		addToCart(product, quantity);

		setTimeout(() => {
			setIsAddingToCart(false);
			window.location.href = "/services/store/checkout";
		}, 300);
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= product.stock) {
			setQuantity(newQuantity);
		}
	};

	return (
		<div className="space-y-4">
			{isInStock && (
				<div className="flex items-center gap-4">
					<label className="text-sm font-medium">{t("quantity")}</label>
					<div className="flex items-center border-2 rounded-lg overflow-hidden">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleQuantityChange(quantity - 1)}
							disabled={quantity <= 1}
							className="h-10 w-10"
						>
							<Minus className="h-4 w-4" />
						</Button>
						<span className="px-6 py-2 font-semibold min-w-[60px] text-center">
							{quantity}
						</span>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleQuantityChange(quantity + 1)}
							disabled={quantity >= product.stock}
							className="h-10 w-10"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			<div className="flex gap-3">
				<Button
					onClick={handleBuyNow}
					disabled={!isInStock || isAddingToCart}
					size="lg"
					className="flex-1 h-12 text-lg font-semibold"
				>
					{isAddingToCart ? t("processing") : t("buy_now")}
				</Button>

				<Button
					variant="outline"
					onClick={handleAddToCart}
					disabled={!isInStock || isAddingToCart}
					size="lg"
					className="flex-1 h-12 text-lg font-semibold"
				>
					<ShoppingCart className="h-5 w-5 mr-2" />
					{t("add_to_cart")}
				</Button>

				<Button
					variant="outline"
					size="lg"
					onClick={() => setIsLiked(!isLiked)}
					className={`h-12 px-6 ${
						isLiked ? "text-red-500 border-red-300 bg-red-50" : ""
					}`}
				>
					<Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
				</Button>
			</div>
		</div>
	);
}

