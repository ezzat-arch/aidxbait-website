import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center px-4 py-8 relative overflow-auto pt-32">
			<div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
				{/* Header */}
				<div className="text-center mb-10">
					<h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-3 tracking-tight">
						Authentication Error
					</h1>
					<p className="text-white/90 text-lg font-medium">
						There was an issue with your authentication
					</p>
				</div>

				{/* Error Card */}
				<Card className="border border-blue-200/50 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden relative">
					{/* Card glow effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl" />
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl" />

					<CardHeader className="space-y-1 pb-6 relative z-10 text-center">
						<div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
							<AlertCircle className="h-8 w-8 text-red-600" />
						</div>
						<CardTitle className="text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-slate-800 via-red-900 to-slate-800 bg-clip-text text-transparent">
							Authentication Failed
						</CardTitle>
						<CardDescription className="text-center text-slate-600 text-lg">
							We encountered an error while trying to authenticate your account
						</CardDescription>
					</CardHeader>

					<CardContent className="relative z-10 space-y-6">
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<h3 className="font-semibold text-red-800 mb-2">
								Possible causes:
							</h3>
							<ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
								<li>The authentication link has expired</li>
								<li>The authentication link was already used</li>
								<li>There was a network error during the process</li>
							</ul>
						</div>

						<div className="space-y-4">
							<Button
								asChild
								className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200"
							>
								<Link href="/login">Try Signing In Again</Link>
							</Button>

							<Button
								variant="outline"
								asChild
								className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-200"
							>
								<Link href="/register">Create New Account</Link>
							</Button>
						</div>

						{/* Contact Support */}
						<div className="text-center pt-4 border-t border-slate-200">
							<p className="text-sm text-slate-600">
								Still having trouble?{" "}
								<Link
									href="/contact/support"
									className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
								>
									Contact Support
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
