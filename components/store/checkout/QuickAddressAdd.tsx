"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddressFormFields } from "@/components/profile/addresses/AddressFormFields";
import { createAddress } from "@/lib/addresses/address-service";
import { AddressType } from "@/lib/order-types";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuickAddressAddProps {
	patientId: number;
	onAddressAdded: () => void;
}

export function QuickAddressAdd({
	patientId,
	onAddressAdded,
}: QuickAddressAddProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Form state
	const [addressType, setAddressType] = useState<AddressType>("House");
	const [addressLabel, setAddressLabel] = useState("");
	const [governorate, setGovernorate] = useState("");
	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [buildingName, setBuildingName] = useState("");
	const [floor, setFloor] = useState("");
	const [apartment, setApartment] = useState("");
	const [phone, setPhone] = useState("");
	const [additionalDirections, setAdditionalDirections] = useState("");
	const [isPrimary, setIsPrimary] = useState(false);
	const [googleMapUrl, setGoogleMapUrl] = useState("");

	const resetForm = () => {
		setAddressType("House");
		setAddressLabel("");
		setGovernorate("");
		setCity("");
		setStreet("");
		setBuildingName("");
		setFloor("");
		setApartment("");
		setPhone("");
		setAdditionalDirections("");
		setIsPrimary(false);
		setGoogleMapUrl("");
		setErrors({});
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!addressLabel.trim()) {
			newErrors.address_label = "Address label is required";
		}
		if (!governorate.trim()) {
			newErrors.governorate = "Governorate is required";
		}
		if (!city.trim()) {
			newErrors.city = "City is required";
		}
		if (!street.trim()) {
			newErrors.street = "Street is required";
		}
		if (addressType === "Apartment" && !buildingName.trim()) {
			newErrors.building_name = "Building name is required for apartments";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast({
				title: "Validation Error",
				description: "Please fill in all required fields.",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsSubmitting(true);
			await createAddress({
				patient_id: patientId,
				address_type: addressType,
				address_label: addressLabel.trim(),
				governorate: governorate.trim(),
				city: city.trim(),
				street: street.trim(),
				building_name: buildingName.trim() || undefined,
				floor: floor.trim() || undefined,
				apartment: apartment.trim() || undefined,
				phone: phone.trim() || undefined,
				additional_directions: additionalDirections.trim() || undefined,
				is_primary: isPrimary,
				google_map_url: googleMapUrl.trim() || undefined,
			});

			toast({
				title: "Success",
				description: "Address added successfully.",
			});

			resetForm();
			setOpen(false);
			onAddressAdded();
		} catch (error) {
			console.error("Error creating address:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to create address. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Plus className="h-4 w-4 mr-2" />
					Add New Address
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add New Address</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6 mt-4">
					<AddressFormFields
						addressType={addressType}
						addressLabel={addressLabel}
						governorate={governorate}
						city={city}
						street={street}
						buildingName={buildingName}
						floor={floor}
						apartment={apartment}
						phone={phone}
						additionalDirections={additionalDirections}
						isPrimary={isPrimary}
						googleMapUrl={googleMapUrl}
						onAddressTypeChange={setAddressType}
						onAddressLabelChange={setAddressLabel}
						onGovernorateChange={setGovernorate}
						onCityChange={setCity}
						onStreetChange={setStreet}
						onBuildingNameChange={setBuildingName}
						onFloorChange={setFloor}
						onApartmentChange={setApartment}
						onPhoneChange={setPhone}
						onAdditionalDirectionsChange={setAdditionalDirections}
						onIsPrimaryChange={setIsPrimary}
						onGoogleMapUrlChange={setGoogleMapUrl}
						errors={errors}
					/>

					<div className="flex gap-4">
						<Button type="submit" disabled={isSubmitting} className="flex-1">
							{isSubmitting ? "Saving..." : "Save Address"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								resetForm();
								setOpen(false);
							}}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
