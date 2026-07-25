"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, LogOut } from "lucide-react";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

export function DangerZone() {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { signOut } = useAuth();
	const t = useTranslations("settings.danger_zone");

	return (
		<div className="space-y-6">
			{/* Sign out from all devices */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<LogOut className="h-4 w-4" />
						{t("sign_out")}
					</CardTitle>
					<CardDescription>
						{t("sign_out_description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="outline" onClick={signOut}>
						{t("sign_out")}
					</Button>
				</CardContent>
			</Card>

			<Separator />

			{/* Danger zone */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						{t("danger_zone")}
					</CardTitle>
					<CardDescription>
						{t("danger_zone_description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
						<div>
							<p className="font-semibold text-sm">{t("delete_account")}</p>
							<p className="text-sm text-muted-foreground mt-0.5">
								{t("delete_account_description")}
							</p>
						</div>
						<Button
							variant="destructive"
							className="shrink-0"
							onClick={() => setDeleteOpen(true)}
						>
							{t("delete_account")}
						</Button>
					</div>
				</CardContent>
			</Card>

			<DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
		</div>
	);
}
