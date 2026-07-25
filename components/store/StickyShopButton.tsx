"use client";

import { ShoppingBag } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Floating "Shop Now" call-to-action pinned just below the navbar logo.
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
		<div className="fixed top-40 sm:top-40 ltr:left-5 rtl:right-5 z-[39]">
			<Link
				href="/services/store/"
				aria-label={t("shop_now")}
				className="group pointer-events-auto inline-flex transition-transform duration-200 hover:scale-105 active:scale-95"
			>
				<span className="animate-wiggle group-hover:animate-shake-anim inline-flex items-center justify-center gap-3 bg-primary group-hover:bg-primary/90 text-white font-bold text-lg sm:text-xl px-7 sm:px-9 py-4 rounded-full shadow-xl group-hover:shadow-2xl min-h-[60px] sm:min-h-[68px]">
					<ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7" />
					<span>{t("shop_now")}</span>
				</span>
			</Link>
		</div>
	);
}
