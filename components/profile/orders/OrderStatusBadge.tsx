"use client";

import { Badge } from "@/components/ui/badge";
import { OrderStatus, PaymentStatus, PaymentMethod } from "@/lib/order-types";
import { useTranslations } from "next-intl";

interface OrderStatusBadgeProps {
	status: OrderStatus;
	className?: string;
}

interface PaymentStatusBadgeProps {
	status: PaymentStatus;
	paymentMethod?: PaymentMethod;
	className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	const t = useTranslations("profile.orders.data.order_status");

	const getStatusColor = (status: OrderStatus) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "confirmed":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "shipped":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "delivered":
				return "bg-green-100 text-green-800 border-green-200";
			case "cancelled":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusText = (status: OrderStatus) => {
		switch (status) {
			case "pending":
				return t("pending");
			case "confirmed":
				return t("confirmed");
			case "shipped":
				return t("shipped");
			case "delivered":
				return t("delivered");
			case "cancelled":
				return t("cancelled");
			default:
				return status;
		}
	};

	return (
		<Badge
			variant="outline"
			className={`${getStatusColor(status)} ${className}`}
		>
			{getStatusText(status)}
		</Badge>
	);
}

export function PaymentStatusBadge({
	status,
	paymentMethod,
	className,
}: PaymentStatusBadgeProps) {
	const t = useTranslations("profile.orders.data.payment_status");

	const getStatusColor = (status: PaymentStatus) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "paid":
				return "bg-green-100 text-green-800 border-green-200";
			case "failed":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusText = (
		status: PaymentStatus,
		paymentMethod?: PaymentMethod
	) => {
		switch (status) {
			case "pending":
				return paymentMethod === "cash_on_delivery"
					? t("on_delivery")
					: t("pending");
			case "paid":
				return t("paid");
			case "failed":
				return t("failed");
			default:
				return status;
		}
	};

	return (
		<Badge
			variant="outline"
			className={`${getStatusColor(status)} ${className}`}
		>
			{getStatusText(status, paymentMethod)}
		</Badge>
	);
}
