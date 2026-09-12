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
	CheckCircle2,
	Mail,
	MailCheck,
} from "lucide-react";
import { requestPasswordReset } from "@/lib/auth/actions";
import { useTranslations } from "next-intl";

const ForgotPasswordForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();

	const t = useTranslations("forgot_password.text");
	const tPlaceholder = useTranslations("forgot_password.attr.placeholder");

	const error = searchParams.get("error")
		? decodeURIComponent(searchParams.get("error")!)
		: null;
	const expired = searchParams.get("expired") === "1";
	const sent = searchParams.get("sent") === "1";
	const sentTo = searchParams.get("email") ?? "";

	const handleSubmit = async (formData: FormData) => {
		setIsLoading(true);
		try {
			await requestPasswordReset(formData);
		} catch (err) {
			// Errors surface via the server action redirect; this only catches
			// unexpected client-side failures.
			console.error("Forgot password error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8 relative overflow-auto pt-32">
			<div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
				{/* Header */}
				<div className="text-center mb-10">
					<h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-3 tracking-tight">
						{t("forgot_your_password")}
					</h1>
					<p className="text-white/90 text-lg font-medium">
						{t("no_worries_we_ll_help")}
					</p>
				</div>

				<Card className="border border-blue-200/50 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl" />
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl" />

					{sent ? (
						/* ---------- Success state ---------- */
						<CardContent className="relative z-10 pt-10 pb-8 text-center">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
								<MailCheck className="h-10 w-10 text-green-600" />
							</div>
							<h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
								{t("check_your_inbox")}
							</h2>
							<p className="text-slate-600 text-lg leading-relaxed">
								{t("if_account_exists_we_sent")}
							</p>
							{sentTo && (
								<p dir="ltr" className="mt-2 font-semibold text-slate-800 break-all">
									{sentTo}
								</p>
							)}
							<p className="mt-6 text-sm text-slate-500">
								{t("link_expires_check_spam")}
							</p>

							<div className="mt-8 space-y-3">
								<Button
									asChild
									className="w-full h-14 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white font-bold text-lg rounded-2xl transition-all duration-300"
								>
									<Link href="/login">
										<ArrowLeft className="w-5 h-5 rtl:rotate-180" />
										{t("back_to_login")}
									</Link>
								</Button>
								<Link
									href="/forgot-password"
									className="inline-block text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
								>
									{t("didn_t_get_it_try_again")}
								</Link>
							</div>
						</CardContent>
					) : (
						/* ---------- Request form ---------- */
						<>
							<CardHeader className="space-y-1 pb-8 relative z-10">
								<CardTitle className="text-3xl lg:text-4xl pb-2 font-bold text-center bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 bg-clip-text text-transparent">
									{t("reset_password")}
								</CardTitle>
								<CardDescription className="text-center text-slate-600 text-lg">
									{t("enter_email_and_we_ll_send")}
								</CardDescription>
							</CardHeader>

							<CardContent className="relative z-10">
								{(error || expired) && (
									<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
										<AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
										<p className="text-sm text-red-700">
											{error ?? t("link_expired_request_new")}
										</p>
									</div>
								)}

								<form action={handleSubmit} className="space-y-8">
									<div className="space-y-3">
										<Label
											htmlFor="email"
											className="text-sm font-semibold text-slate-700 tracking-wide"
										>
											{t("email_address")}
										</Label>
										<div className="relative group">
											<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-4 rtl:pr-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
												<Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
											</div>
											<Input
												id="email"
												name="email"
												type="email"
												inputMode="email"
												autoComplete="email"
												autoFocus
												placeholder={tPlaceholder("enter_your_email_address")}
												className="ltr:pl-12 rtl:pr-12 h-14 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 rounded-xl text-lg shadow-inner"
												required
											/>
											<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-cyan-500/10 group-focus-within:to-blue-500/10 transition-all duration-300 pointer-events-none" />
										</div>
									</div>

									<Button
										type="submit"
										disabled={isLoading}
										className="w-full h-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 disabled:transform-none disabled:hover:scale-100 relative overflow-hidden group"
									>
										<div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-cyan-400/20 group-hover:to-blue-400/20 transition-all duration-300" />
										{isLoading ? (
											<div className="flex items-center gap-3 relative z-10">
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												<span className="tracking-wide">{t("sending")}</span>
											</div>
										) : (
											<div className="flex items-center gap-3 relative z-10">
												<span className="tracking-wide">{t("send_reset_link")}</span>
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
						</>
					)}
				</Card>

				<p className="text-center text-sm text-white/70 mt-8 flex items-center justify-center gap-2">
					<CheckCircle2 className="h-4 w-4" />
					{t("we_never_share_your_email")}
				</p>
			</div>
		</div>
	);
};

const ForgotPasswordPage = () => {
	const t = useTranslations("forgot_password.text");

	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8">
					<div className="text-white text-xl">{t("loading")}</div>
				</div>
			}
		>
			<ForgotPasswordForm />
		</Suspense>
	);
};

export default ForgotPasswordPage;
