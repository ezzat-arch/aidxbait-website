"use client";

import { PatientAddress } from "@/lib/order-types";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface AddressSelectorProps {
	addresses: PatientAddress[];
	selectedAddressId: number | null;
	onSelectAddress: (addressId: number) => void;
}

export function AddressSelector({
	addresses,
	selectedAddressId,
	onSelectAddress,
}: AddressSelectorProps) {
	if (addresses.length === 0) {
		return null;
	}

	return (
		<RadioGroup
			value={selectedAddressId?.toString()}
			onValueChange={(value) => onSelectAddress(parseInt(value))}
			className="space-y-3"
		>
			{addresses.map((address) => {
				const fullAddress = [
					address.street,
					address.building_name,
					address.floor && `Floor ${address.floor}`,
					address.apartment && `Apt ${address.apartment}`,
					address.city,
					address.governorate,
				]
					.filter(Boolean)
					.join(", ");

				return (
					<Card
						key={address.id}
						className={`cursor-pointer transition-colors ${
							selectedAddressId === address.id
								? "border-primary bg-primary/5"
								: "hover:border-primary/50"
						}`}
					>
						<CardContent className="p-4">
							<div className="flex items-start gap-3">
								<RadioGroupItem
									value={address.id.toString()}
									id={`address-${address.id}`}
									className="mt-1"
								/>
								<Label
									htmlFor={`address-${address.id}`}
									className="flex-1 cursor-pointer"
								>
									<div className="flex items-center gap-2 mb-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">{address.address_label}</span>
										{address.is_primary && (
											<Badge variant="secondary" className="text-xs">
												Primary
											</Badge>
										)}
										<Badge variant="outline" className="text-xs capitalize">
											{address.address_type}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">{fullAddress}</p>
									{address.phone && (
										<p className="text-sm text-muted-foreground mt-1">
											Phone: {address.phone}
										</p>
									)}
								</Label>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</RadioGroup>
	);
}
