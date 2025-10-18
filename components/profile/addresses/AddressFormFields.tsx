"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AddressType } from "@/lib/order-types";

interface AddressFormFieldsProps {
	addressType: AddressType;
	addressLabel: string;
	governorate: string;
	city: string;
	street: string;
	buildingName: string;
	floor: string;
	apartment: string;
	phone: string;
	additionalDirections: string;
	isPrimary: boolean;
	googleMapUrl: string;
	onAddressTypeChange: (value: AddressType) => void;
	onAddressLabelChange: (value: string) => void;
	onGovernorateChange: (value: string) => void;
	onCityChange: (value: string) => void;
	onStreetChange: (value: string) => void;
	onBuildingNameChange: (value: string) => void;
	onFloorChange: (value: string) => void;
	onApartmentChange: (value: string) => void;
	onPhoneChange: (value: string) => void;
	onAdditionalDirectionsChange: (value: string) => void;
	onIsPrimaryChange: (value: boolean) => void;
	onGoogleMapUrlChange: (value: string) => void;
	errors?: Record<string, string>;
}

export function AddressFormFields({
	addressType,
	addressLabel,
	governorate,
	city,
	street,
	buildingName,
	floor,
	apartment,
	phone,
	additionalDirections,
	isPrimary,
	googleMapUrl,
	onAddressTypeChange,
	onAddressLabelChange,
	onGovernorateChange,
	onCityChange,
	onStreetChange,
	onBuildingNameChange,
	onFloorChange,
	onApartmentChange,
	onPhoneChange,
	onAdditionalDirectionsChange,
	onIsPrimaryChange,
	onGoogleMapUrlChange,
	errors = {},
}: AddressFormFieldsProps) {
	return (
		<div className="space-y-6">
			{/* Address Type */}
			<div className="space-y-3">
				<Label>Address Type *</Label>
				<RadioGroup
					value={addressType}
					onValueChange={(value) => onAddressTypeChange(value as AddressType)}
					className="flex gap-4"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="House" id="house" />
						<Label htmlFor="house" className="font-normal cursor-pointer">
							House
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="Apartment" id="apartment" />
						<Label htmlFor="apartment" className="font-normal cursor-pointer">
							Apartment
						</Label>
					</div>
				</RadioGroup>
				{errors.address_type && (
					<p className="text-sm text-destructive">{errors.address_type}</p>
				)}
			</div>

			{/* Address Label */}
			<div className="space-y-2">
				<Label htmlFor="addressLabel">
					Address Label *{" "}
					<span className="text-xs text-muted-foreground">
						(e.g., Home, Work)
					</span>
				</Label>
				<Input
					id="addressLabel"
					value={addressLabel}
					onChange={(e) => onAddressLabelChange(e.target.value)}
					placeholder="Home"
					className={errors.address_label ? "border-destructive" : ""}
				/>
				{errors.address_label && (
					<p className="text-sm text-destructive">{errors.address_label}</p>
				)}
			</div>

			{/* Governorate and City */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="governorate">Governorate *</Label>
					<Input
						id="governorate"
						value={governorate}
						onChange={(e) => onGovernorateChange(e.target.value)}
						placeholder="Cairo"
						className={errors.governorate ? "border-destructive" : ""}
					/>
					{errors.governorate && (
						<p className="text-sm text-destructive">{errors.governorate}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="city">City *</Label>
					<Input
						id="city"
						value={city}
						onChange={(e) => onCityChange(e.target.value)}
						placeholder="Maadi"
						className={errors.city ? "border-destructive" : ""}
					/>
					{errors.city && (
						<p className="text-sm text-destructive">{errors.city}</p>
					)}
				</div>
			</div>

			{/* Street */}
			<div className="space-y-2">
				<Label htmlFor="street">Street *</Label>
				<Input
					id="street"
					value={street}
					onChange={(e) => onStreetChange(e.target.value)}
					placeholder="123 Main Street"
					className={errors.street ? "border-destructive" : ""}
				/>
				{errors.street && (
					<p className="text-sm text-destructive">{errors.street}</p>
				)}
			</div>

			{/* Building Name, Floor, Apartment (conditional) */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor="buildingName">
						Building Name {addressType === "Apartment" && "*"}
					</Label>
					<Input
						id="buildingName"
						value={buildingName}
						onChange={(e) => onBuildingNameChange(e.target.value)}
						placeholder="Building 5"
						className={errors.building_name ? "border-destructive" : ""}
					/>
					{errors.building_name && (
						<p className="text-sm text-destructive">{errors.building_name}</p>
					)}
				</div>

				{addressType === "Apartment" && (
					<>
						<div className="space-y-2">
							<Label htmlFor="floor">Floor</Label>
							<Input
								id="floor"
								value={floor}
								onChange={(e) => onFloorChange(e.target.value)}
								placeholder="3"
								className={errors.floor ? "border-destructive" : ""}
							/>
							{errors.floor && (
								<p className="text-sm text-destructive">{errors.floor}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="apartment">Apartment</Label>
							<Input
								id="apartment"
								value={apartment}
								onChange={(e) => onApartmentChange(e.target.value)}
								placeholder="12"
								className={errors.apartment ? "border-destructive" : ""}
							/>
							{errors.apartment && (
								<p className="text-sm text-destructive">{errors.apartment}</p>
							)}
						</div>
					</>
				)}
			</div>

			{/* Phone */}
			<div className="space-y-2">
				<Label htmlFor="phone">Phone Number</Label>
				<Input
					id="phone"
					type="tel"
					value={phone}
					onChange={(e) => onPhoneChange(e.target.value)}
					placeholder="+20 123 456 7890"
					className={errors.phone ? "border-destructive" : ""}
				/>
				{errors.phone && (
					<p className="text-sm text-destructive">{errors.phone}</p>
				)}
			</div>

			{/* Google Map URL */}
			<div className="space-y-2">
				<Label htmlFor="googleMapUrl">Google Maps Link (Optional)</Label>
				<Input
					id="googleMapUrl"
					type="url"
					value={googleMapUrl}
					onChange={(e) => onGoogleMapUrlChange(e.target.value)}
					placeholder="https://maps.google.com/..."
					className={errors.google_map_url ? "border-destructive" : ""}
				/>
				{errors.google_map_url && (
					<p className="text-sm text-destructive">{errors.google_map_url}</p>
				)}
			</div>

			{/* Additional Directions */}
			<div className="space-y-2">
				<Label htmlFor="additionalDirections">Additional Directions</Label>
				<Textarea
					id="additionalDirections"
					value={additionalDirections}
					onChange={(e) => onAdditionalDirectionsChange(e.target.value)}
					placeholder="Next to the pharmacy, green gate"
					rows={3}
					className={errors.additional_directions ? "border-destructive" : ""}
				/>
				{errors.additional_directions && (
					<p className="text-sm text-destructive">
						{errors.additional_directions}
					</p>
				)}
			</div>

			{/* Set as Primary */}
			<div className="flex items-center space-x-2">
				<Checkbox
					id="isPrimary"
					checked={isPrimary}
					onCheckedChange={(checked) => onIsPrimaryChange(checked as boolean)}
				/>
				<Label
					htmlFor="isPrimary"
					className="text-sm font-normal cursor-pointer"
				>
					Set as primary address
				</Label>
			</div>
		</div>
	);
}
