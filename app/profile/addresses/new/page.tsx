"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AddressFormFields } from "@/components/profile/addresses/AddressFormFields";
import { createAddress } from "@/lib/addresses/address-service";
import { AddressType } from "@/lib/order-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function NewAddressPage() {
	const { userProfile } = useAuth();
	const router = useRouter();
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

		if (!userProfile?.patient_id) {
			toast({
				title: "Error",
				description: "User information not available. Please log in again.",
				variant: "destructive",
			});
			return;
		}

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
				patient_id: userProfile.patient_id,
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

			router.push("/profile/addresses");
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
		<div className="space-y-6">
			<div>
				<Button variant="ghost" asChild className="-ml-4 mb-4">
					<Link href="/profile/addresses">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Addresses
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mb-2">Add New Address</h1>
				<p className="text-muted-foreground">
					Add a shipping or billing address to your account
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Address Information</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
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
								onClick={() => router.back()}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
