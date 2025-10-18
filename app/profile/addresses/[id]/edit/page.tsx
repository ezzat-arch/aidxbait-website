"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AddressFormFields } from "@/components/profile/addresses/AddressFormFields";
import { fetchAddresses, updateAddress } from "@/lib/addresses/address-service";
import { AddressType, PatientAddress } from "@/lib/order-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

export default function EditAddressPage() {
	const { userProfile } = useAuth();
	const router = useRouter();
	const params = useParams();
	const addressId = parseInt(params.id as string);

	const [loading, setLoading] = useState(true);
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

	useEffect(() => {
		if (userProfile?.patient_id && addressId) {
			loadAddress();
		}
	}, [userProfile?.patient_id, addressId]);

	const loadAddress = async () => {
		if (!userProfile?.patient_id) return;

		try {
			setLoading(true);
			const addresses = await fetchAddresses(userProfile.patient_id);
			const address = addresses.find((addr) => addr.id === addressId);

			if (!address) {
				toast({
					title: "Error",
					description: "Address not found.",
					variant: "destructive",
				});
				router.push("/profile/addresses");
				return;
			}

			// Populate form with existing data
			setAddressType(address.address_type);
			setAddressLabel(address.address_label);
			setGovernorate(address.governorate);
			setCity(address.city);
			setStreet(address.street);
			setBuildingName(address.building_name || "");
			setFloor(address.floor || "");
			setApartment(address.apartment || "");
			setPhone(address.phone || "");
			setAdditionalDirections(address.additional_directions || "");
			setIsPrimary(address.is_primary);
			setGoogleMapUrl(address.google_map_url || "");
		} catch (error) {
			console.error("Error loading address:", error);
			toast({
				title: "Error",
				description: "Failed to load address. Please try again.",
				variant: "destructive",
			});
			router.push("/profile/addresses");
		} finally {
			setLoading(false);
		}
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
			await updateAddress(addressId, userProfile.patient_id, {
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
				description: "Address updated successfully.",
			});

			router.push("/profile/addresses");
		} catch (error) {
			console.error("Error updating address:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to update address. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading address...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<Button variant="ghost" asChild className="-ml-4 mb-4">
					<Link href="/profile/addresses">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Addresses
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mb-2">Edit Address</h1>
				<p className="text-muted-foreground">Update your address information</p>
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
								{isSubmitting ? "Saving..." : "Save Changes"}
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
