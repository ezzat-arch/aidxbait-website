"use client";

import { PaymentMethod } from "@/lib/order-types";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaymentMethodSelectorProps {
	selectedMethod: PaymentMethod;
	onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
	selectedMethod,
	onSelectMethod,
}: PaymentMethodSelectorProps) {
	const tLabel = useTranslations("store.checkout.data.label");
	const tDesc = useTranslations("store.checkout.data.description");

	const paymentMethods = [
		{
			value: "cash_on_delivery" as PaymentMethod,
			label: tLabel("cash_on_delivery"),
			description: tDesc("pay_when_you_receive_your"),
			icon: Banknote,
		},
		{
			value: "online" as PaymentMethod,
			label: tLabel("online_payment"),
			description: tDesc("pay_securely_with_your_card"),
			icon: CreditCard,
			disabled: false,
		},
	];

	return (
		<RadioGroup
			value={selectedMethod}
			onValueChange={(value) => onSelectMethod(value as PaymentMethod)}
			className="space-y-3"
		>
			{paymentMethods.map((method) => (
				<Card
					key={method.value}
					className={`cursor-pointer transition-colors ${
						method.disabled
							? "opacity-50 cursor-not-allowed"
							: selectedMethod === method.value
							? "border-primary bg-primary/5"
							: "hover:border-primary/50"
					}`}
				>
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<RadioGroupItem
								value={method.value}
								id={`payment-${method.value}`}
								className="mt-1 ltr:order-first rtl:order-last"
								disabled={method.disabled}
							/>
							<Label
								htmlFor={`payment-${method.value}`}
								className={`flex-1 ${
									method.disabled ? "cursor-not-allowed" : "cursor-pointer"
								}`}
							>
								<div className="flex items-center gap-2 mb-1">
									<method.icon className="h-5 w-5 text-muted-foreground" />
									<span className="font-medium">{method.label}</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{method.description}
								</p>
							</Label>
						</div>
					</CardContent>
				</Card>
			))}
		</RadioGroup>
	);
}
