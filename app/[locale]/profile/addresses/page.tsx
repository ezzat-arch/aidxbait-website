"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { PatientAddress } from "@/lib/order-types";
import {
	fetchAddresses,
	setAsPrimary,
	deleteAddress,
} from "@/lib/addresses/address-service";
import { AddressCard } from "@/components/profile/addresses/AddressCard";
import { DeleteAddressDialog } from "@/components/profile/addresses/DeleteAddressDialog";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function AddressesPage() {
	const { userProfile } = useAuth();
	const [addresses, setAddresses] = useState<PatientAddress[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [addressToDelete, setAddressToDelete] = useState<PatientAddress | null>(
		null
	);

	const t = useTranslations("profile.addresses.text");
	const tToastTitle = useTranslations("profile.addresses.toast.title");
	const tToastDesc = useTranslations("profile.addresses.toast.description");

	useEffect(() => {
		if (userProfile?.patient_id) {
			loadAddresses();
		}
	}, [userProfile?.patient_id]);

	const loadAddresses = async () => {
		if (!userProfile?.patient_id) return;

		try {
			setLoading(true);
			const data = await fetchAddresses(userProfile.patient_id);
			setAddresses(data);
		} catch (error) {
			console.error("Error loading addresses:", error);
			toast({
				title: tToastTitle("error"),
				description: tToastDesc("failed_to_load_addresses_please"),
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSetPrimary = async (addressId: number) => {
		if (!userProfile?.patient_id) return;

		try {
			await setAsPrimary(addressId, userProfile.patient_id);
			toast({
				title: tToastTitle("success"),
				description: tToastDesc("primary_address_updated_successfully"),
			});
			loadAddresses();
		} catch (error) {
			console.error("Error setting primary address:", error);
			toast({
				title: tToastTitle("error"),
				description: tToastDesc("failed_to_set_primary_address"),
				variant: "destructive",
			});
		}
	};

	const handleDeleteClick = (address: PatientAddress) => {
		setAddressToDelete(address);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!addressToDelete || !userProfile?.patient_id) return;

		try {
			await deleteAddress(addressToDelete.id, userProfile.patient_id);
			toast({
				title: tToastTitle("success"),
				description: tToastDesc("address_deleted_successfully"),
			});
			setDeleteDialogOpen(false);
			setAddressToDelete(null);
			loadAddresses();
		} catch (error) {
			console.error("Error deleting address:", error);
			toast({
				title: tToastTitle("error"),
				description: tToastDesc("failed_to_delete_address_please"),
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">{t("loading_addresses")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">{t("my_addresses")}</h1>
					<p className="text-muted-foreground">
						{t("manage_your_shipping_and_billing")}
					</p>
				</div>
				<Button asChild>
					<Link href="/profile/addresses/new">
						<Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
						{t("add_address")}
					</Link>
				</Button>
			</div>

			{addresses.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
						<MapPin className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="font-semibold text-lg mb-2">
						{t("no_addresses_yet")}
					</h3>
					<p className="text-muted-foreground mb-6">
						{t("add_your_first_address_to")}
					</p>
					<Button asChild>
						<Link href="/profile/addresses/new">
							<Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
							{t("add_address")}
						</Link>
					</Button>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2">
					{addresses.map((address) => (
						<AddressCard
							key={address.id}
							address={address}
							onSetPrimary={handleSetPrimary}
							onDelete={() => handleDeleteClick(address)}
						/>
					))}
				</div>
			)}

			<DeleteAddressDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				addressLabel={addressToDelete?.address_label || ""}
			/>
		</div>
	);
}
