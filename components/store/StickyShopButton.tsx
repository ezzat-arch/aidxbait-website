"use client";

import { ShoppingBag } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Floating "Shop Now" call-to-action pinned to the bottom of the viewport.
 * Wiggles on a timed loop to draw attention and shakes on hover. Hidden while
 * the user is already inside the store so it doesn't get in the way.
 */
export function StickyShopButton() {
	const t = useTranslations("sections.hero.text");
	const pathname = usePathname();

	// Don't show it on the store pages themselves.
	if (pathname.startsWith("/services/store")) {
		return null;
	}

	return (
		<div className="fixed block md:hidden bottom-5 ltr:right-5 rtl:left-5 z-50">
			<Link
				href="/services/store/"
				aria-label={t("shop_now")}
				className="group pointer-events-auto inline-flex transition-transform duration-200 hover:scale-105 active:scale-95"
			>
				<span className="animate-wiggle group-hover:animate-shake-anim inline-flex items-center justify-center gap-2 bg-primary group-hover:bg-primary/90 text-white font-semibold px-5 py-3 rounded-full shadow-xl group-hover:shadow-2xl min-h-[52px]">
					<ShoppingBag className="h-5 w-5" />
					<span>{t("shop_now")}</span>
				</span>
			</Link>
		</div>
	);
}
