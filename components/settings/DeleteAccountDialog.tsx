"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { deleteAccount } from "@/lib/auth/settings-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TriangleAlert } from "lucide-react";

const CONFIRM_PHRASE = "DELETE";

interface DeleteAccountDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
	open,
	onOpenChange,
}: DeleteAccountDialogProps) {
	const { toast } = useToast();
	const [password, setPassword] = useState("");
	const [confirmText, setConfirmText] = useState("");
	const [loading, setLoading] = useState(false);

	const isConfirmed = confirmText === CONFIRM_PHRASE && password.length > 0;

	const handleClose = (nextOpen: boolean) => {
		if (!loading) {
			setPassword("");
			setConfirmText("");
			onOpenChange(nextOpen);
		}
	};

	const handleDelete = async () => {
		if (!isConfirmed) return;
		setLoading(true);
		try {
			const result = await deleteAccount(password);
			if (result?.error) {
				toast({ title: "Error", description: result.error, variant: "destructive" });
			}
			// On success the server action redirects to "/" — no client-side action needed.
		} catch {
			// redirect throws an error in Next.js server actions — safe to ignore
		} finally {
			setLoading(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={handleClose}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2 text-destructive">
						<TriangleAlert className="h-5 w-5" />
						Delete Your Account
					</AlertDialogTitle>
				</AlertDialogHeader>

				<div className="space-y-4 text-sm">
					<p className="text-muted-foreground">
						This action is <strong className="text-foreground">permanent</strong> and
						cannot be undone. The following data will be deleted:
					</p>
					<ul className="space-y-1 list-disc list-inside text-muted-foreground">
						<li>Your profile and personal information</li>
						<li>Your complete order history</li>
						<li>All saved addresses</li>
						<li>Appointment and consultation records</li>
					</ul>

					<Separator />

					<div className="space-y-2">
						<Label htmlFor="del-password">
							Enter your password to confirm
						</Label>
						<Input
							id="del-password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Your current password"
							disabled={loading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="del-confirm">
							Type{" "}
							<span className="font-bold text-destructive">{CONFIRM_PHRASE}</span> to
							confirm
						</Label>
						<Input
							id="del-confirm"
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							placeholder={CONFIRM_PHRASE}
							disabled={loading}
							className={
								confirmText && confirmText !== CONFIRM_PHRASE
									? "border-destructive focus-visible:ring-destructive"
									: ""
							}
						/>
					</div>
				</div>

				<AlertDialogFooter className="gap-2 sm:gap-0">
					<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
					<Button
						variant="destructive"
						disabled={!isConfirmed || loading}
						onClick={handleDelete}
					>
						{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Permanently Delete Account
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
