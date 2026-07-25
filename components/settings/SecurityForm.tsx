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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { changePassword } from "@/lib/auth/settings-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

function PasswordStrength({ password }: { password: string }) {
	const t = useTranslations("settings.security.requirements");
	const checks = [
		{ label: t("min_characters"), pass: password.length >= 8 },
		{ label: t("uppercase_letter"), pass: /[A-Z]/.test(password) },
		{ label: t("number"), pass: /\d/.test(password) },
		{ label: t("special_character"), pass: /[^A-Za-z0-9]/.test(password) },
	];
	const score = checks.filter((c) => c.pass).length;
	const colors = ["bg-destructive", "bg-orange-400", "bg-yellow-400", "bg-green-500", "bg-green-600"];

	if (!password) return null;

	return (
		<div className="space-y-2">
			<div className="flex gap-1">
				{checks.map((_, i) => (
					<div
						key={i}
						className={`h-1 flex-1 rounded-full transition-colors ${
							i < score ? colors[score] : "bg-muted"
						}`}
					/>
				))}
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				{checks.map((c) => (
					<span
						key={c.label}
						className={`text-xs flex items-center gap-1 ${
							c.pass ? "text-green-600" : "text-muted-foreground"
						}`}
					>
						<CheckCircle2 className={`h-3 w-3 ${c.pass ? "opacity-100" : "opacity-30"}`} />
						{c.label}
					</span>
				))}
			</div>
		</div>
	);
}

interface PasswordFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (v: string) => void;
	show: boolean;
	onToggle: () => void;
	children?: React.ReactNode;
}

function PasswordField({ id, label, value, onChange, show, onToggle, children }: PasswordFieldProps) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				<Input
					id={id}
					type={show ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="pr-10"
					required
				/>
				<button
					type="button"
					onClick={onToggle}
					className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
					tabIndex={-1}
				>
					{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</button>
			</div>
			{children}
		</div>
	);
}

export function SecurityForm() {
	const { toast } = useToast();
	const t = useTranslations("settings.security");
	const [loading, setLoading] = useState(false);
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (mismatch) {
			toast({ title: t("toast.passwords_dont_match"), variant: "destructive" });
			return;
		}
		setLoading(true);
		try {
			const result = await changePassword({
				currentPassword,
				newPassword,
				confirmPassword,
			});
			if (result.error) {
				toast({ title: t("toast.error"), description: result.error, variant: "destructive" });
			} else {
				toast({ title: t("toast.password_changed"), description: t("toast.password_changed_description") });
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<KeyRound className="h-5 w-5 text-primary" />
						{t("change_password")}
					</CardTitle>
					<CardDescription>
						{t("change_password_description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-5">
						<PasswordField
							id="currentPassword"
							label={t("current_password")}
							value={currentPassword}
							onChange={setCurrentPassword}
							show={showCurrent}
							onToggle={() => setShowCurrent(!showCurrent)}
						/>

						<Separator />

						<PasswordField
							id="newPassword"
							label={t("new_password")}
							value={newPassword}
							onChange={setNewPassword}
							show={showNew}
							onToggle={() => setShowNew(!showNew)}
						>
							<PasswordStrength password={newPassword} />
						</PasswordField>

						<PasswordField
							id="confirmPassword"
							label={t("confirm_new_password")}
							value={confirmPassword}
							onChange={setConfirmPassword}
							show={showConfirm}
							onToggle={() => setShowConfirm(!showConfirm)}
						>
							{mismatch && (
								<p className="text-xs text-destructive">{t("passwords_do_not_match")}</p>
							)}
						</PasswordField>

						<Button
							type="submit"
							disabled={loading || !currentPassword || !newPassword || !confirmPassword}
						>
							{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{t("change_password")}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">{t("security_tips")}</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
						<li>{t("tips.unique_password")}</li>
						<li>{t("tips.mix_characters")}</li>
						<li>{t("tips.never_share")}</li>
						<li>{t("tips.change_if_suspect")}</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
