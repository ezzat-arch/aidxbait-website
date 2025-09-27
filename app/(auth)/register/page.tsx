"use client";

import { useState } from "react";
import Link from "next/link";
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
	Eye,
	EyeOff,
	Mail,
	Phone,
	Lock,
	User,
	ArrowRight,
	Check,
	X,
} from "lucide-react";

export default function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [acceptTerms, setAcceptTerms] = useState(false);

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

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

	const passwordRequirements = validatePassword(formData.password);
	const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = "First name is required";
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = "Last name is required";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "Phone number is required";
		} else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
			newErrors.phone = "Please enter a valid phone number";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (!isPasswordValid) {
			newErrors.password = "Password does not meet requirements";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!acceptTerms) {
			newErrors.terms = "You must accept the terms and conditions";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		console.log("Registration attempt:", {
			firstName: formData.firstName,
			lastName: formData.lastName,
			phone: formData.phone,
			email: formData.email,
			password: "***hidden***",
			confirmPassword: "***hidden***",
			acceptedTerms: acceptTerms,
		});

		setIsLoading(false);
	};

	const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
		<div
			className={`flex items-center space-x-2 text-xs transition-colors ${
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
						Join AidXBait
					</h1>
					<p className="text-white/90 text-lg font-medium">
						Create your account to get started
					</p>
				</div>

				{/* Registration Card */}
				<Card className="border border-blue-200/50 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
					{/* Card glow effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl" />
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl" />
					<CardHeader className="space-y-1 pb-8 relative z-10">
						<CardTitle className="text-3xl lg:text-4xl font-bold text-center bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 bg-clip-text text-transparent">
							Create Account
						</CardTitle>
						<CardDescription className="text-center text-slate-600 text-lg">
							Fill in your information to create your account
						</CardDescription>
					</CardHeader>

					<CardContent className="relative z-10">
						<form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
							{/* Name Fields */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label
										htmlFor="firstName"
										className="text-sm font-medium text-gray-700"
									>
										First Name
									</Label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<User className="h-4 w-4 text-gray-400" />
										</div>
										<Input
											id="firstName"
											type="text"
											placeholder="First name"
											value={formData.firstName}
											onChange={(e) =>
												handleInputChange("firstName", e.target.value)
											}
											className={`pl-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
												errors.firstName ? "border-red-500" : ""
											}`}
											required
										/>
									</div>
									{errors.firstName && (
										<p className="text-xs text-red-500">{errors.firstName}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="lastName"
										className="text-sm font-medium text-gray-700"
									>
										Last Name
									</Label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<User className="h-4 w-4 text-gray-400" />
										</div>
										<Input
											id="lastName"
											type="text"
											placeholder="Last name"
											value={formData.lastName}
											onChange={(e) =>
												handleInputChange("lastName", e.target.value)
											}
											className={`pl-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
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

							{/* Phone Field */}
							<div className="space-y-2">
								<Label
									htmlFor="phone"
									className="text-sm font-medium text-gray-700"
								>
									Phone Number
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Phone className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="phone"
										type="tel"
										placeholder="Enter your phone number"
										value={formData.phone}
										onChange={(e) => handleInputChange("phone", e.target.value)}
										className={`pl-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											errors.phone ? "border-red-500" : ""
										}`}
										required
									/>
								</div>
								{errors.phone && (
									<p className="text-xs text-red-500">{errors.phone}</p>
								)}
							</div>

							{/* Email Field */}
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-medium text-gray-700"
								>
									Email Address
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="email"
										type="email"
										placeholder="Enter your email address"
										value={formData.email}
										onChange={(e) => handleInputChange("email", e.target.value)}
										className={`pl-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											errors.email ? "border-red-500" : ""
										}`}
										required
									/>
								</div>
								{errors.email && (
									<p className="text-xs text-red-500">{errors.email}</p>
								)}
							</div>

							{/* Password Field */}
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-sm font-medium text-gray-700"
								>
									Password
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Create a strong password"
										value={formData.password}
										onChange={(e) =>
											handleInputChange("password", e.target.value)
										}
										className={`pl-9 pr-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											errors.password ? "border-red-500" : ""
										}`}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 text-gray-400" />
										) : (
											<Eye className="h-4 w-4 text-gray-400" />
										)}
									</button>
								</div>

								{/* Password Requirements */}
								{formData.password && (
									<div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1">
										<p className="text-xs font-medium text-gray-700 mb-2">
											Password Requirements:
										</p>
										<RequirementItem
											met={passwordRequirements.length}
											text="At least 8 characters"
										/>
										<RequirementItem
											met={passwordRequirements.uppercase}
											text="One uppercase letter"
										/>
										<RequirementItem
											met={passwordRequirements.lowercase}
											text="One lowercase letter"
										/>
										<RequirementItem
											met={passwordRequirements.number}
											text="One number"
										/>
										<RequirementItem
											met={passwordRequirements.special}
											text="One special character"
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
									Confirm Password
								</Label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Confirm your password"
										value={formData.confirmPassword}
										onChange={(e) =>
											handleInputChange("confirmPassword", e.target.value)
										}
										className={`pl-9 pr-9 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
											errors.confirmPassword ? "border-red-500" : ""
										}`}
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4 text-gray-400" />
										) : (
											<Eye className="h-4 w-4 text-gray-400" />
										)}
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="text-xs text-red-500">
										{errors.confirmPassword}
									</p>
								)}
							</div>

							{/* Terms and Conditions */}
							<div className="space-y-2">
								<div className="flex items-start space-x-3">
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
											I agree to the{" "}
											<Link
												href="/terms"
												className="text-blue-600 hover:text-blue-800 font-medium"
											>
												Terms of Service
											</Link>{" "}
											and{" "}
											<Link
												href="/privacy"
												className="text-blue-600 hover:text-blue-800 font-medium"
											>
												Privacy Policy
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
									<div className="flex items-center space-x-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										<span>Creating Account...</span>
									</div>
								) : (
									<div className="flex items-center space-x-2">
										<span>Create Account</span>
										<ArrowRight className="w-4 h-4" />
									</div>
								)}
							</Button>
						</form>

						{/* Sign In Link */}
						<div className="text-center mt-8 pt-6 border-t border-slate-200">
							<p className="text-slate-600">
								Already have an account?{" "}
								<Link
									href="/login"
									className="font-semibold text-blue-600 hover:text-blue-500 transition-colors tracking-wide"
								>
									Sign in here
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Footer Text */}
				<p className="text-center text-sm text-white/70 mt-8">
					By creating an account, you agree to receive communications from
					AidXBait
				</p>
			</div>
		</div>
	);
}
