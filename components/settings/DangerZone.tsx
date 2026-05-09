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

export function DangerZone() {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const { signOut } = useAuth();

	return (
		<div className="space-y-6">
			{/* Sign out from all devices */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<LogOut className="h-4 w-4" />
						Sign Out
					</CardTitle>
					<CardDescription>
						Sign out of your account on this device
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="outline" onClick={signOut}>
						Sign Out
					</Button>
				</CardContent>
			</Card>

			<Separator />

			{/* Danger zone */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						Danger Zone
					</CardTitle>
					<CardDescription>
						Irreversible actions. Please read carefully before proceeding.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
						<div>
							<p className="font-semibold text-sm">Delete Account</p>
							<p className="text-sm text-muted-foreground mt-0.5">
								Permanently remove your account and all associated data. This
								cannot be undone.
							</p>
						</div>
						<Button
							variant="destructive"
							className="shrink-0"
							onClick={() => setDeleteOpen(true)}
						>
							Delete Account
						</Button>
					</div>
				</CardContent>
			</Card>

			<DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
		</div>
	);
}
