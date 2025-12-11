"use client";

import { useState, Suspense } from "react";
import { Link, useRouter } from "@/i18n/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	ArrowRight,
	Check,
	X,
	AlertCircle,
	Phone,
	User,
	CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

const RegisterForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [showErrorDialog, setShowErrorDialog] = useState(false);
	const [dialogMessage, setDialogMessage] = useState("");
	const [dialogTitle, setDialogTitle] = useState("");
	const searchParams = useSearchParams();
	const router = useRouter();

	const t = useTranslations("register.text");
	const tPlaceholder = useTranslations("register.attr.placeholder");
	const tValidation = useTranslations("register.validation");
	const tDialog = useTranslations("register.dialog");
	const tRequirements = useTranslations("register.requirements");

	const error = searchParams.get("error");
	const message = searchParams.get("message");
	const redirect = searchParams.get("redirect") || null;

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validatePassword = (password: string) => {
		const requirements = {
			length: password.length >= 8,
			uppercase: /[A-Z]/.test(password),
			lowercase: /[a-z]/.test(password),
			number: /\d/.test(password),
			special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
		};
		return requirements;
	};

	const passwordRequirements = validatePassword(password);
	const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

	// Real-time password confirmation validation
	const passwordsMatch =
		password && confirmPassword && password === confirmPassword;
	const showPasswordMismatch = confirmPassword && password !== confirmPassword;

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!firstName?.trim()) {
			newErrors.firstName = tValidation("first_name_required");
		}

		if (!lastName?.trim()) {
			newErrors.lastName = tValidation("last_name_required");
		}

		if (!email?.trim()) {
			newErrors.email = tValidation("email_required");
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = tValidation("email_invalid");
		}

		if (!phone?.trim()) {
			newErrors.phone = tValidation("phone_required");
		} else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phone.replace(/\s/g, ""))) {
			newErrors.phone = tValidation("phone_invalid");
		}

		if (!password) {
			newErrors.password = tValidation("password_required");
		} else if (!Object.values(validatePassword(password)).every(Boolean)) {
			newErrors.password = tValidation("password_weak");
		}

		if (password !== confirmPassword) {
			newErrors.confirmPassword = t("passwords_do_not_match");
		}

		if (!acceptTerms) {
			newErrors.terms = tValidation("terms_required");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (formData: FormData) => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		try {
			// Create a custom signup function that doesn't redirect
			const result = await signupWithoutRedirect();

			if (result.success) {
				setDialogTitle(tDialog("success_title"));
				setDialogMessage(tDialog("success_message"));
				setShowSuccessDialog(true);
			} else {
				setDialogTitle(tDialog("error_title"));
				setDialogMessage(result.error || tDialog("error_message"));
				setShowErrorDialog(true);
			}
		} catch (error) {
			console.error("Signup error:", error);
			setDialogTitle(tDialog("error_title"));
			setDialogMessage(tDialog("error_message"));
			setShowErrorDialog(true);
		} finally {
			setIsLoading(false);
		}
	};

	// Custom signup function that uses secure API route
	const signupWithoutRedirect = async () => {
		// Validate required fields
		if (
			!firstName?.trim() ||
			!lastName?.trim() ||
			!email?.trim() ||
			!phone?.trim() ||
			!password?.trim()
		) {
			return { success: false, error: tValidation("all_fields_required") };
		}

		try {
			// Call our secure API route that uses service role key
			const response = await fetch("/api/auth/signup/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					email: email.trim(),
					phone: phone.trim(),
					password: password.trim(),
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: result.error || tDialog("error_message"),
				};
			}

			return result;
		} catch (error) {
			console.error("Signup error:", error);
			return {
				success: false,
				error: tDialog("error_message"),
			};
		}
	};

	const clearForm = () => {
		setFirstName("");
		setLastName("");
		setEmail("");
		setPhone("");
		setPassword("");
		setConfirmPassword("");
		setAcceptTerms(false);
		setErrors({});
	};

	const handleSuccessDialogClose = () => {
		setShowSuccessDialog(false);
		clearForm();
		const loginUrl = redirect
			? `/login?redirect=${encodeURIComponent(redirect)}`
			: "/login";
		router.push(loginUrl);
	};

	const handleErrorDialogClose = () => {
		setShowErrorDialog(false);
	};

	const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
		<div
			className={`flex items-center gap-2 text-xs transition-colors ${
				met ? "text-green-600" : "text-gray-500"
			}`}
		>
			{met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
			<span>{text}</span>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8 relative overflow-auto pt-48">
			<div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
				{/* Header */}
				<div className="text-center mb-10">
					<h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-3 tracking-tight">
						{t("join_aidxbait")}
					</h1>
					<p className="text-white/90 text-lg font-medium">
						{t("create_your_account_to_get")}
					</p>
				</div>

				{/* Registration Card */}
				<Card className="border border-blue-200/50 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
					{/* Card glow effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl" />
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl" />
					<CardHeader className="space-y-1 pb-8 relative z-10">
						<CardTitle className="text-3xl lg:text-4xl font-bold text-center bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 bg-clip-text text-transparent">
							{t("create_account")}
						</CardTitle>
						<CardDescription className="text-center text-slate-600 text-lg">
							{t("fill_in_your_information_to")}
						</CardDescription>
					</CardHeader>

					<CardContent className="relative z-10">
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
								<p className="text-sm text-red-700">{error}</p>
							</div>
						)}

						{message && (
							<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-green-500 shrink-0" />
								<p className="text-sm text-green-700">{message}</p>
							</div>
						)}

						<form action={handleSubmit} className="space-y-6 lg:space-y-8">
							{/* Name Fields */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* First Name Field */}
								<div className="space-y-2">
									<Label
										htmlFor="firstName"
										className="text-sm font-medium text-gray-700"
									>
										{t("first_name")}
									</Label>
									<div className="relative">
										<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
											<User className="h-4 w-4 text-gray-400" />
										</div>
										<Input
											id="firstName"
											name="firstName"
											type="text"
											placeholder={tPlaceholder("enter_your_first_name")}
											value={firstName}
											onChange={(e) => setFirstName(e.target.value)}
											className={`ltr:pl-9 rtl:pr-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
												errors.firstName ? "border-red-500" : ""
											}`}
											required
										/>
									</div>
									{errors.firstName && (
										<p className="text-xs text-red-500">{errors.firstName}</p>
									)}
								</div>

								{/* Last Name Field */}
								<div className="space-y-2">
									<Label
										htmlFor="lastName"
										className="text-sm font-medium text-gray-700"
									>
										{t("last_name")}
									</Label>
									<div className="relative">
										<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
											<User className="h-4 w-4 text-gray-400" />
										</div>
										<Input
											id="lastName"
											name="lastName"
											type="text"
											placeholder={tPlaceholder("enter_your_last_name")}
											value={lastName}
											onChange={(e) => setLastName(e.target.value)}
											className={`ltr:pl-9 rtl:pr-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
												errors.lastName ? "border-red-500" : ""
											}`}
											required
										/>
									</div>
									{errors.lastName && (
										<p className="text-xs text-red-500">{errors.lastName}</p>
									)}
								</div>
							</div>

							{/* Email Field */}
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-medium text-gray-700"
								>
									{t("email_address")}
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
										<Mail className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder={tPlaceholder("enter_your_email_address")}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className={`ltr:pl-9 rtl:pr-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											errors.email ? "border-red-500" : ""
										}`}
										required
									/>
								</div>
								{errors.email && (
									<p className="text-xs text-red-500">{errors.email}</p>
								)}
							</div>

							{/* Phone Field */}
							<div className="space-y-2">
								<Label
									htmlFor="phone"
									className="text-sm font-medium text-gray-700"
								>
									{t("phone_number")}
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
										<Phone className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="phone"
										name="phone"
										type="tel"
										placeholder={tPlaceholder("enter_your_phone_number")}
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										className={`ltr:pl-9 rtl:pr-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											errors.phone ? "border-red-500" : ""
										}`}
										required
									/>
								</div>
								{errors.phone && (
									<p className="text-xs text-red-500">{errors.phone}</p>
								)}
							</div>

							{/* Password Field */}
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-sm font-medium text-gray-700"
								>
									{t("password")}
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
										<Lock className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										placeholder={tPlaceholder("create_a_strong_password")}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className={`ltr:pl-9 rtl:pr-9 ltr:pr-9 rtl:pl-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											errors.password ? "border-red-500" : ""
										}`}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center hover:text-blue-600 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 text-gray-400" />
										) : (
											<Eye className="h-4 w-4 text-gray-400" />
										)}
									</button>
								</div>

								{/* Password Requirements */}
								{password && (
									<div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1">
										<p className="text-xs font-medium text-gray-700 mb-2">
											{t("password_requirements")}
										</p>
										<RequirementItem
											met={passwordRequirements.length}
											text={tRequirements("min_length")}
										/>
										<RequirementItem
											met={passwordRequirements.uppercase}
											text={tRequirements("uppercase")}
										/>
										<RequirementItem
											met={passwordRequirements.lowercase}
											text={tRequirements("lowercase")}
										/>
										<RequirementItem
											met={passwordRequirements.number}
											text={tRequirements("number")}
										/>
										<RequirementItem
											met={passwordRequirements.special}
											text={tRequirements("special")}
										/>
									</div>
								)}

								{errors.password && (
									<p className="text-xs text-red-500">{errors.password}</p>
								)}
							</div>

							{/* Confirm Password Field */}
							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className="text-sm font-medium text-gray-700"
								>
									{t("confirm_password")}
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
										<Lock className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder={tPlaceholder("confirm_your_password")}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className={`ltr:pl-9 rtl:pr-9 ltr:pr-12 rtl:pl-12 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											showPasswordMismatch
												? "border-red-500"
												: passwordsMatch
												? "border-green-500"
												: ""
										}`}
										required
									/>
									{/* Password match indicator */}
									{confirmPassword && (
										<div className="absolute inset-y-0 ltr:right-8 rtl:left-8 flex items-center pointer-events-none">
											{passwordsMatch ? (
												<Check className="h-4 w-4 text-green-500" />
											) : (
												<X className="h-4 w-4 text-red-500" />
											)}
										</div>
									)}
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center hover:text-blue-600 transition-colors"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4 text-gray-400" />
										) : (
											<Eye className="h-4 w-4 text-gray-400" />
										)}
									</button>
								</div>

								{/* Real-time password match feedback */}
								{confirmPassword && (
									<div
										className={`text-xs transition-colors ${
											passwordsMatch ? "text-green-600" : "text-red-500"
										}`}
									>
										{passwordsMatch ? (
											<div className="flex items-center gap-1">
												<Check className="w-3 h-3" />
												<span>{t("passwords_match")}</span>
											</div>
										) : (
											<div className="flex items-center gap-1">
												<X className="w-3 h-3" />
												<span>{t("passwords_do_not_match")}</span>
											</div>
										)}
									</div>
								)}

								{errors.confirmPassword && (
									<p className="text-xs text-red-500">
										{errors.confirmPassword}
									</p>
								)}
							</div>

							{/* Terms and Conditions */}
							<div className="space-y-2">
								<div className="flex items-start gap-3">
									<Checkbox
										id="terms"
										checked={acceptTerms}
										onCheckedChange={(checked) =>
											setAcceptTerms(checked as boolean)
										}
										className="mt-1"
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											htmlFor="terms"
											className="text-sm text-gray-700 cursor-pointer"
										>
											{t("i_agree_to_the")}{" "}
											<Link
												href="/terms"
												className="text-blue-600 hover:text-blue-800 font-medium"
											>
												{t("terms_of_service")}
											</Link>{" "}
											{t("and")}{" "}
											<Link
												href="/privacy"
												className="text-blue-600 hover:text-blue-800 font-medium"
											>
												{t("privacy_policy")}
											</Link>
										</Label>
									</div>
								</div>
								{errors.terms && (
									<p className="text-xs text-red-500">{errors.terms}</p>
								)}
							</div>

							{/* Create Account Button */}
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:transform-none disabled:hover:scale-100"
							>
								{isLoading ? (
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										<span>{t("creating_account")}</span>
									</div>
								) : (
									<div className="flex items-center gap-2">
										<span>{t("create_account")}</span>
										<ArrowRight className="w-4 h-4 rtl:rotate-180" />
									</div>
								)}
							</Button>
						</form>

						{/* Log In Link */}
						<div className="text-center mt-8 pt-6 border-t border-slate-200">
							<p className="text-slate-600">
								{t("already_have_an_account")}{" "}
								<Link
									href={
										redirect
											? `/login?redirect=${encodeURIComponent(redirect)}`
											: "/login"
									}
									className="font-semibold text-blue-600 hover:text-blue-500 transition-colors tracking-wide"
								>
									{t("log_in_here")}
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Footer Text */}
				<p className="text-center text-sm text-white/70 mt-8">
					{t("by_creating_an_account_you")}
				</p>
			</div>

			{/* Success Dialog */}
			<Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-2">
							<CheckCircle className="h-6 w-6 text-green-500" />
							<DialogTitle className="text-green-700">
								{dialogTitle}
							</DialogTitle>
						</div>
						<DialogDescription className="text-gray-600 mt-2">
							{dialogMessage}
						</DialogDescription>
					</DialogHeader>
					<div className="flex ltr:justify-end rtl:justify-start mt-4">
						<Button
							onClick={handleSuccessDialogClose}
							className="bg-green-600 hover:bg-green-700 text-white"
						>
							{t("continue")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Error Dialog */}
			<Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-2">
							<AlertCircle className="h-6 w-6 text-red-500" />
							<DialogTitle className="text-red-700">{dialogTitle}</DialogTitle>
						</div>
						<DialogDescription className="text-gray-600 mt-2">
							{dialogMessage}
						</DialogDescription>
					</DialogHeader>
					<div className="flex ltr:justify-end rtl:justify-start mt-4">
						<Button
							onClick={handleErrorDialogClose}
							variant="outline"
							className="border-red-300 text-red-700 hover:bg-red-50"
						>
							{t("try_again")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

const RegisterPage = () => {
	const t = useTranslations("register.text");

	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8">
					<div className="text-white text-xl">{t("loading")}</div>
				</div>
			}
		>
			<RegisterForm />
		</Suspense>
	);
};

export default RegisterPage;
