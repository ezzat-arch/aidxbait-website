import en from "./strings-en";
import ar from "./strings-ar";

export type ReturnRefundCopy = typeof en;

export function getReturnRefundCopy(locale: string): ReturnRefundCopy {
	return locale === "ar" ? ar : en;
}
