"use client";

import { useState } from "react";
import Link from "next/link";
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
	Eye,
	EyeOff,
	Mail,
	Phone,
	Lock,
	ArrowRight,
	AlertCircle,
} from "lucide-react";
import { login } from "@/lib/auth/actions";

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();

	const error = searchParams.get("error")
		? decodeURIComponent(searchParams.get("error")!)
		: null;
	const message = searchParams.get("message")
		? decodeURIComponent(searchParams.get("message")!)
		: null;

	const handleSubmit = async (formData: FormData) => {
		setIsLoading(true);
		try {
			await login(formData);
		} catch (error) {
			console.error("Login error:", error);
			// The error handling is done in the server action via redirect
			// This catch block is mainly for unexpected client-side errors
		} finally {
			setIsLoading(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8 relative overflow-auto pt-32">
			<div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
				{/* Header */}
				<div className="text-center mb-10">
					<h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-3 tracking-tight">
						Welcome Back
					</h1>
					<p className="text-white/90 text-lg font-medium">
						Login to your AidXBait account
					</p>
				</div>

				{/* Login Card */}
				<Card className="border border-blue-200/50 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
					{/* Card glow effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl" />
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl" />
					<CardHeader className="space-y-1 pb-8 relative z-10">
						<CardTitle className="text-3xl lg:text-4xl pb-2 font-bold text-center bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 bg-clip-text text-transparent">
							Login
						</CardTitle>
						<CardDescription className="text-center text-slate-600 text-lg">
							Enter your credentials to access your account
						</CardDescription>
					</CardHeader>

					<CardContent className="relative z-10">
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
								<AlertCircle className="h-5 w-5 text-red-500" />
								<p className="text-sm text-red-700">{error}</p>
							</div>
						)}

						{message && (
							<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
								<AlertCircle className="h-5 w-5 text-green-500" />
								<p className="text-sm text-green-700">{message}</p>
							</div>
						)}

						<form action={handleSubmit} className="space-y-8">
							{/* Email Field */}
							<div className="space-y-3">
								<Label
									htmlFor="email"
									className="text-sm font-semibold text-slate-700 tracking-wide"
								>
									Email Address
								</Label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
										<Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="Enter your email address"
										className="pl-12 h-14 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 rounded-xl text-lg shadow-inner"
										required
									/>
									{/* Input glow effect */}
									<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-cyan-500/10 group-focus-within:to-blue-500/10 transition-all duration-300 pointer-events-none" />
								</div>
							</div>

							{/* Password Field */}
							<div className="space-y-3">
								<Label
									htmlFor="password"
									className="text-sm font-semibold text-slate-700 tracking-wide"
								>
									Password
								</Label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
										<Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
									</div>
									<Input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										className="pl-12 pr-12 h-14 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 rounded-xl text-lg shadow-inner"
										required
									/>
									<button
										type="button"
										onClick={togglePasswordVisibility}
										className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
										) : (
											<Eye className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
										)}
									</button>
									{/* Input glow effect */}
									<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-cyan-500/10 group-focus-within:to-blue-500/10 transition-all duration-300 pointer-events-none" />
								</div>
							</div>

							{/* Forgot Password Link */}
							<div className="flex justify-end">
								<Link
									href="/forgot-password"
									className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors tracking-wide"
								>
									Forgot your password?
								</Link>
							</div>

							{/* Log In Button */}
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full h-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 disabled:transform-none disabled:hover:scale-100 relative overflow-hidden group"
							>
								{/* Button glow effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-cyan-400/20 group-hover:to-blue-400/20 transition-all duration-300" />

								{isLoading ? (
									<div className="flex items-center space-x-3 relative z-10">
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
										<span className="tracking-wide">Logging In...</span>
									</div>
								) : (
									<div className="flex items-center space-x-3 relative z-10">
										<span className="tracking-wide">Log In</span>
										<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
									</div>
								)}
							</Button>
						</form>

						{/* Sign Up Link */}
						<div className="text-center mt-8 pt-6 border-t border-slate-200">
							<p className="text-slate-600">
								Don't have an account?{" "}
								<Link
									href="/register"
									className="font-semibold text-blue-600 hover:text-blue-500 transition-colors tracking-wide"
								>
									Create an account for free
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Footer Text */}
				<p className="text-center text-sm text-white/70 mt-8">
					By signing in, you agree to our{" "}
					<Link
						href="/terms"
						className="text-white/90 hover:text-white transition-colors font-medium underline"
					>
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						href="/privacy"
						className="text-white/90 hover:text-white transition-colors font-medium underline"
					>
						Privacy Policy
					</Link>
				</p>
			</div>
		</div>
	);
}
