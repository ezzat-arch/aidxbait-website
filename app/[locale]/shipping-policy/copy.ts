import en from "./strings-en";
import ar from "./strings-ar";

export type ShippingPolicyCopy = typeof en;

export function getShippingPolicyCopy(locale: string): ShippingPolicyCopy {
	return locale === "ar" ? ar : en;
}
