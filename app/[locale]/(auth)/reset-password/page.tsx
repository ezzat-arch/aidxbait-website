"use client";

import { Suspense, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Check,
	Eye,
	EyeOff,
	Lock,
	ShieldCheck,
} from "lucide-react";
import { resetPassword } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";

const PASSWORD_MIN_LENGTH = 8;

const ResetPasswordForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();

	const t = useTranslations("reset_password.text");
	const tPlaceholder = useTranslations("reset_password.attr.placeholder");

	const error = searchParams.get("error")
		? decodeURIComponent(searchParams.get("error")!)
		: null;

	const longEnough = password.length >= PASSWORD_MIN_LENGTH;
	const matches = confirmPassword.length > 0 && password === confirmPassword;
	const canSubmit = longEnough && matches && !isLoading;

	const handleSubmit = async (formData: FormData) => {
		setIsLoading(true);
		try {
			await resetPassword(formData);
		} catch (err) {
			// Errors surface via the server action redirect; this only catches
			// unexpected client-side failures.
			console.error("Reset password error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const fieldClass =
		"ltr:pl-12 rtl:pr-12 ltr:pr-12 rtl:pl-12 h-14 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 rounded-xl text-lg shadow-inner";

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8 relative overflow-auto pt-32">
			<div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
				{/* Header */}
				<div className="text-center mb-10">
					<h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-3 tracking-tight">
						{t("set_a_new_password")}
					</h1>
					<p className="text-white/90 text-lg font-medium">
						{t("choose_a_strong_password")}
					</p>
				</div>

				<Card className="border border-blue-200/50 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl" />
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl" />

					<CardHeader className="space-y-1 pb-8 relative z-10">
						<CardTitle className="text-3xl lg:text-4xl pb-2 font-bold text-center bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 bg-clip-text text-transparent">
							{t("reset_password")}
						</CardTitle>
						<CardDescription className="text-center text-slate-600 text-lg">
							{t("enter_new_password_below")}
						</CardDescription>
					</CardHeader>

					<CardContent className="relative z-10">
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
								<p className="text-sm text-red-700">{error}</p>
							</div>
						)}

						<form action={handleSubmit} className="space-y-8">
							{/* New password */}
							<div className="space-y-3">
								<Label
									htmlFor="password"
									className="text-sm font-semibold text-slate-700 tracking-wide"
								>
									{t("new_password")}
								</Label>
								<div className="relative group">
									<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-4 rtl:pr-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
										<Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<Input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										autoComplete="new-password"
										autoFocus
										minLength={PASSWORD_MIN_LENGTH}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder={tPlaceholder("enter_new_password")}
										className={fieldClass}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((v) => !v)}
										aria-label={showPassword ? t("hide_password") : t("show_password")}
										className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center hover:text-blue-600 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
										) : (
											<Eye className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
										)}
									</button>
									<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-cyan-500/10 group-focus-within:to-blue-500/10 transition-all duration-300 pointer-events-none" />
								</div>
							</div>

							{/* Confirm password */}
							<div className="space-y-3">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-semibold text-slate-700 tracking-wide"
								>
									{t("confirm_new_password")}
								</Label>
								<div className="relative group">
									<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-4 rtl:pr-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
										<Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type={showConfirm ? "text" : "password"}
										autoComplete="new-password"
										minLength={PASSWORD_MIN_LENGTH}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder={tPlaceholder("re_enter_new_password")}
										className={fieldClass}
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirm((v) => !v)}
										aria-label={showConfirm ? t("hide_password") : t("show_password")}
										className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center hover:text-blue-600 transition-colors"
									>
										{showConfirm ? (
											<EyeOff className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
										) : (
											<Eye className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
										)}
									</button>
									<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-cyan-500/10 group-focus-within:to-blue-500/10 transition-all duration-300 pointer-events-none" />
								</div>
							</div>

							{/* Live requirements */}
							<ul className="space-y-2 text-sm" aria-live="polite">
								<li
									className={`flex items-center gap-2 transition-colors ${
										longEnough ? "text-green-600" : "text-slate-500"
									}`}
								>
									<span
										className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
											longEnough
												? "border-green-600 bg-green-600 text-white"
												: "border-slate-300"
										}`}
									>
										{longEnough && <Check className="h-3 w-3" />}
									</span>
									{t("at_least_8_characters")}
								</li>
								<li
									className={`flex items-center gap-2 transition-colors ${
										matches ? "text-green-600" : "text-slate-500"
									}`}
								>
									<span
										className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
											matches
												? "border-green-600 bg-green-600 text-white"
												: "border-slate-300"
										}`}
									>
										{matches && <Check className="h-3 w-3" />}
									</span>
									{t("passwords_match")}
								</li>
							</ul>

							<Button
								type="submit"
								disabled={!canSubmit}
								className="w-full h-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 disabled:transform-none disabled:hover:scale-100 relative overflow-hidden group"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-cyan-400/20 group-hover:to-blue-400/20 transition-all duration-300" />
								{isLoading ? (
									<div className="flex items-center gap-3 relative z-10">
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
										<span className="tracking-wide">{t("updating")}</span>
									</div>
								) : (
									<div className="flex items-center gap-3 relative z-10">
										<span className="tracking-wide">{t("update_password")}</span>
										<ArrowRight className="w-5 h-5 group-hover:ltr:translate-x-1 group-hover:rtl:-translate-x-1 transition-transform duration-200 rtl:rotate-180" />
									</div>
								)}
							</Button>
						</form>

						<div className="text-center mt-8 pt-6 border-t border-slate-200">
							<Link
								href="/login"
								className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-500 transition-colors tracking-wide"
							>
								<ArrowLeft className="w-4 h-4 rtl:rotate-180" />
								{t("back_to_login")}
							</Link>
						</div>
					</CardContent>
				</Card>

				<p className="text-center text-sm text-white/70 mt-8 flex items-center justify-center gap-2">
					<ShieldCheck className="h-4 w-4" />
					{t("you_ll_be_asked_to_log_in_again")}
				</p>
			</div>
		</div>
	);
};

const ResetPasswordPage = () => {
	const t = useTranslations("reset_password.text");

	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8">
					<div className="text-white text-xl">{t("loading")}</div>
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	);
};

export default ResetPasswordPage;
