import { Badge } from "@/components/ui/badge";
import { OrderStatus, PaymentStatus } from "@/lib/order-types";

interface OrderStatusBadgeProps {
	status: OrderStatus;
	className?: string;
}

interface PaymentStatusBadgeProps {
	status: PaymentStatus;
	className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
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
				return "Pending";
			case "confirmed":
				return "Confirmed";
			case "shipped":
				return "Shipped";
			case "delivered":
				return "Delivered";
			case "cancelled":
				return "Cancelled";
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
	className,
}: PaymentStatusBadgeProps) {
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

	const getStatusText = (status: PaymentStatus) => {
		switch (status) {
			case "pending":
				return "Pending";
			case "paid":
				return "Paid";
			case "failed":
				return "Failed";
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
