"use client";

import { Order, OrderStatus } from "@/lib/order-types";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface OrderTimelineProps {
	order: Order;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
	const t = useTranslations("profile.orders.text");
	const tLabel = useTranslations("profile.orders.data.label");
	const tStatus = useTranslations("profile.my_orders.data.status");
	const locale = useLocale();

	const steps: { status: OrderStatus; labelKey: string }[] = [
		{ status: "pending", labelKey: "order_placed" },
		{ status: "confirmed", labelKey: "confirmed" },
		{ status: "shipped", labelKey: "shipped" },
		{ status: "delivered", labelKey: "delivered" },
	];

	const currentStatusIndex = steps.findIndex(
		(step) => step.status === order.order_status
	);
	const isCancelled = order.order_status === "cancelled";

	const getStepState = (index: number) => {
		if (isCancelled && index === 0) {
			return "cancelled";
		}
		if (isCancelled) {
			return "inactive";
		}
		if (index < currentStatusIndex) {
			return "completed";
		}
		if (index === currentStatusIndex) {
			return "current";
		}
		return "upcoming";
	};

	const getStepIcon = (state: string) => {
		switch (state) {
			case "completed":
				return <CheckCircle2 className="h-6 w-6 text-green-600" />;
			case "current":
				return (
					<div className="h-6 w-6 rounded-full bg-blue-600 animate-pulse" />
				);
			case "cancelled":
				return <XCircle className="h-6 w-6 text-red-600" />;
			default:
				return <Circle className="h-6 w-6 text-gray-300" />;
		}
	};

	const getStepColor = (state: string) => {
		switch (state) {
			case "completed":
				return "text-green-600";
			case "current":
				return "text-blue-600 font-semibold";
			case "cancelled":
				return "text-red-600";
			default:
				return "text-gray-400";
		}
	};

	// Get step label - first step uses "Order Placed", others use status name
	const getStepLabel = (step: { status: OrderStatus; labelKey: string }) => {
		if (step.labelKey === "order_placed") {
			return tLabel("order_placed");
		}
		return tStatus(step.status);
	};

	if (isCancelled) {
		return (
			<div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
				<XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
				<div>
					<p className="font-semibold text-red-900">{t("order_cancelled")}</p>
					{order.cancellation_reason && (
						<p className="text-sm text-red-700 mt-1">
							{t("reason")} {order.cancellation_reason}
						</p>
					)}
					{order.cancellation_date && (
						<p className="text-xs text-red-600 mt-1">
							{t("cancelled_on")}{" "}
							{new Date(order.cancellation_date).toLocaleDateString(
								locale === "ar" ? "ar-EG" : "en-US"
							)}
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{steps.map((step, index) => {
				const state = getStepState(index);
				const isLast = index === steps.length - 1;

				return (
					<div key={step.status} className="flex gap-4">
						<div className="flex flex-col items-center">
							{getStepIcon(state)}
							{!isLast && (
								<div
									className={`w-0.5 h-12 mt-2 ${
										state === "completed" ? "bg-green-600" : "bg-gray-200"
									}`}
								/>
							)}
						</div>
						<div className="pb-8">
							<p className={`font-medium ${getStepColor(state)}`}>
								{getStepLabel(step)}
							</p>
							{state === "current" && (
								<p className="text-sm text-muted-foreground mt-1">
									{t("in_progress")}
								</p>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
