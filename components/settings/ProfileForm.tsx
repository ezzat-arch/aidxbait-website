"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateProfile } from "@/lib/auth/settings-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function ProfileForm() {
	const { userProfile } = useAuth();
	const { toast } = useToast();
	const t = useTranslations("settings.profile");
	const [saving, setSaving] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");

	useEffect(() => {
		if (userProfile) {
			setFirstName(userProfile.first_name || "");
			setLastName(userProfile.last_name || "");
			setPhone(userProfile.phone_number || "");
		}
	}, [userProfile]);

	const initials =
		`${userProfile?.first_name?.[0] ?? ""}${userProfile?.last_name?.[0] ?? ""}`.toUpperCase();

	const hasChanges =
		firstName !== (userProfile?.first_name ?? "") ||
		lastName !== (userProfile?.last_name ?? "") ||
		phone !== (userProfile?.phone_number ?? "");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const result = await updateProfile({
				firstName,
				lastName,
				phoneNumber: phone,
			});
			if (result.error) {
				toast({ title: t("toast.error"), description: result.error, variant: "destructive" });
			} else {
				toast({ title: t("toast.updated_title"), description: t("toast.updated_description") });
			}
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Identity card */}
			<Card>
				<CardHeader>
					<CardTitle>{t("profile_information")}</CardTitle>
					<CardDescription>{t("update_your_personal_details")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Avatar row */}
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16">
							<AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
								{initials || <User className="h-7 w-7" />}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-semibold text-base">
								{userProfile?.first_name} {userProfile?.last_name}
							</p>
							<p className="text-sm text-muted-foreground">
								{userProfile?.email}
							</p>
							{userProfile?.user_type && (
								<Badge variant="secondary" className="mt-1 capitalize text-xs">
									{userProfile.user_type}
								</Badge>
							)}
						</div>
					</div>

					<Separator />

					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="firstName">{t("first_name")}</Label>
								<Input
									id="firstName"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder={t("first_name_placeholder")}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">{t("last_name")}</Label>
								<Input
									id="lastName"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder={t("last_name_placeholder")}
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="flex items-center gap-1.5">
								<Mail className="h-3.5 w-3.5" />
								{t("email_address")}
							</Label>
							<Input
								id="email"
								value={userProfile?.email ?? ""}
								disabled
								className="bg-muted cursor-not-allowed"
							/>
							<p className="text-xs text-muted-foreground">
								{t("email_cannot_be_changed")}
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone" className="flex items-center gap-1.5">
								<Phone className="h-3.5 w-3.5" />
								{t("phone_number")}
							</Label>
							<Input
								id="phone"
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="+20 123 456 7890"
							/>
						</div>

						<Button type="submit" disabled={saving || !hasChanges}>
							{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{t("save_changes")}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Read-only account info */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<ShieldCheck className="h-4 w-4 text-primary" />
						{t("account_details")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid gap-3 sm:grid-cols-2 text-sm">
						<div>
							<dt className="text-muted-foreground">{t("account_type")}</dt>
							<dd className="font-medium capitalize mt-0.5">
								{userProfile?.user_type ?? "—"}
							</dd>
						</div>
						<div>
							<dt className="text-muted-foreground">{t("patient_id")}</dt>
							<dd className="font-medium mt-0.5">
								{userProfile?.patient_id ? `#${userProfile.patient_id}` : "—"}
							</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
