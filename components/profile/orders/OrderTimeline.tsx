"use client";

import { Order, OrderStatus } from "@/lib/order-types";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface OrderTimelineProps {
	order: Order;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
	const steps: { status: OrderStatus; label: string }[] = [
		{ status: "pending", label: "Order Placed" },
		{ status: "confirmed", label: "Confirmed" },
		{ status: "shipped", label: "Shipped" },
		{ status: "delivered", label: "Delivered" },
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

	if (isCancelled) {
		return (
			<div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
				<XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
				<div>
					<p className="font-semibold text-red-900">Order Cancelled</p>
					{order.cancellation_reason && (
						<p className="text-sm text-red-700 mt-1">
							Reason: {order.cancellation_reason}
						</p>
					)}
					{order.cancellation_date && (
						<p className="text-xs text-red-600 mt-1">
							Cancelled on{" "}
							{new Date(order.cancellation_date).toLocaleDateString()}
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
								{step.label}
							</p>
							{state === "current" && (
								<p className="text-sm text-muted-foreground mt-1">
									In progress
								</p>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
