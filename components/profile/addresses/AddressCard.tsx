"use client";

import { PatientAddress } from "@/lib/order-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Star, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AddressCardProps {
	address: PatientAddress;
	onSetPrimary?: (id: number) => void;
	onDelete?: (id: number) => void;
}

export function AddressCard({
	address,
	onSetPrimary,
	onDelete,
}: AddressCardProps) {
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
		<Card className={address.is_primary ? "border-primary" : ""}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2">
						<MapPin className="h-5 w-5 text-muted-foreground" />
						<CardTitle className="text-lg">{address.address_label}</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						{address.is_primary && (
							<Badge className="bg-primary">Primary</Badge>
						)}
						<Badge variant="outline" className="capitalize">
							{address.address_type}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<p className="text-sm text-muted-foreground mb-1">Address</p>
					<p className="text-base">{fullAddress}</p>
				</div>

				{address.phone && (
					<div>
						<p className="text-sm text-muted-foreground mb-1">Phone</p>
						<p className="text-base">{address.phone}</p>
					</div>
				)}

				{address.additional_directions && (
					<div>
						<p className="text-sm text-muted-foreground mb-1">
							Additional Directions
						</p>
						<p className="text-base text-sm">{address.additional_directions}</p>
					</div>
				)}

				{address.google_map_url && (
					<div>
						<Button variant="link" className="p-0 h-auto" asChild>
							<a
								href={address.google_map_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1"
							>
								<ExternalLink className="h-3 w-3" />
								View on Google Maps
							</a>
						</Button>
					</div>
				)}

				<div className="flex gap-2 pt-2">
					<Button variant="outline" size="sm" asChild className="flex-1">
						<Link href={`/profile/addresses/${address.id}/edit`}>
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</Link>
					</Button>

					{!address.is_primary && onSetPrimary && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onSetPrimary(address.id)}
							className="flex-1"
						>
							<Star className="h-4 w-4 mr-2" />
							Set Primary
						</Button>
					)}

					{onDelete && (
						<Button
							variant="destructive"
							size="sm"
							onClick={() => onDelete(address.id)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
