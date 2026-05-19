"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

async function createCheckoutSession(variantId: string) {
	const response = await fetch("/api/checkout", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ variantId }),
	});
	return response.json() as Promise<{ checkoutUrl?: string; error?: string }>;
}

export function AddToCartButton({
	variantId,
	text,
	disabled,
}: {
	variantId: string;
	text: string;
	disabled: boolean;
}) {
	const [loading, setLoading] = useState(false);
	const t = useTranslations("store.StoreShopifyContent");

	const handleCheckout = async () => {
		if (!variantId) return;
		setLoading(true);
		try {
			const data = await createCheckoutSession(variantId);
			if (data?.checkoutUrl) {
				window.location.href = data.checkoutUrl;
			} else {
				alert(t("checkout_error"));
			}
		} catch (error) {
			console.error(error);
			alert(t("checkout_error"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			size="lg"
			className="w-full sm:w-auto"
			disabled={disabled || loading}
			onClick={handleCheckout}
		>
			{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			{text}
		</Button>
	);
}
