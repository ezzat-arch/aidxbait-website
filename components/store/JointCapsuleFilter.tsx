"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JOINT_CATEGORIES } from "@/lib/store-data";
import { Joint } from "@/lib/store-types";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface JointCapsuleFilterProps {
	selectedJoints: Joint[];
	onJointsChange: (joints: Joint[]) => void;
	className?: string;
}

export function JointCapsuleFilter({
	selectedJoints,
	onJointsChange,
	className,
}: JointCapsuleFilterProps) {
	const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
	const [isDesktopOpen, setIsDesktopOpen] = useState(false);
	const jointOptions = JOINT_CATEGORIES.filter(
		(joint) => joint.value !== "all"
	);

	const handleJointToggle = (joint: Joint) => {
		if (selectedJoints.includes(joint)) {
			onJointsChange(selectedJoints.filter((j) => j !== joint));
		} else {
			onJointsChange([...selectedJoints, joint]);
		}
	};

	const handleSelectAll = () => {
		const allJoints = jointOptions.map((joint) => joint.value as Joint);
		onJointsChange(allJoints);
	};

	const handleClearAll = () => {
		onJointsChange([]);
	};

	const isAllSelected = selectedJoints.length === jointOptions.length;
	const hasSelection = selectedJoints.length > 0;

	const getSelectedJointLabels = () => {
		if (selectedJoints.length === 0) return "All Joints";
		if (selectedJoints.length === 1) {
			const joint = jointOptions.find((j) => j.value === selectedJoints[0]);
			return joint ? joint.label : selectedJoints[0];
		}
		return `${selectedJoints.length} joints selected`;
	};

	// Desktop Joint Capsules with Icons
	const JointCapsules = () => (
		<div className="flex flex-wrap gap-4">
			{jointOptions.map((joint) => {
				const isSelected = selectedJoints.includes(joint.value as Joint);
				return (
					<button
						key={joint.value}
						onClick={() => handleJointToggle(joint.value as Joint)}
						className={`
							group relative inline-flex flex-col items-center gap-3 px-6 py-5 rounded-2xl text-sm font-medium 
							transition-all duration-300 border-2 hover:shadow-xl transform hover:scale-105 
							active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[120px]
							${
								isSelected
									? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-primary shadow-xl scale-105 ring-4 ring-primary/20"
									: "bg-card text-foreground border-border hover:border-primary/70 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 shadow-md"
							}
						`}
					>
						{/* Icon */}
						<div
							className={`relative w-12 h-12 transition-all duration-300 ${
								isSelected
									? "scale-110 drop-shadow-lg"
									: "group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
							}`}
						>
							{joint.icon.startsWith("/") ? (
								<Image
									src={joint.icon}
									alt={joint.label}
									fill
									className="object-contain"
								/>
							) : (
								<span className="text-3xl">{joint.icon}</span>
							)}
						</div>

						{/* Label */}
						<span className="font-semibold text-center leading-tight">
							{joint.label}
						</span>

						{/* Check Icon for Selected */}
						{isSelected && (
							<div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background">
								<Check className="h-4 w-4 stroke-[3]" />
							</div>
						)}

						{/* Pulse animation for selected */}
						{isSelected && (
							<div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse"></div>
						)}
					</button>
				);
			})}
		</div>
	);

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Desktop Version */}
			<div className="hidden md:block space-y-6">
				<Collapsible open={isDesktopOpen} onOpenChange={setIsDesktopOpen}>
					{/* Enhanced Container with Background */}
					<div className="bg-gradient-to-br from-muted/40 via-muted/20 to-background border-2 border-border/60 rounded-2xl shadow-lg overflow-hidden">
						{/* Collapsible Trigger Header */}
						<CollapsibleTrigger asChild>
							<button
								className={`w-full flex items-center justify-between ${
									isDesktopOpen ? "p-6" : "p-3"
								} hover:bg-muted/30 transition-colors group`}
							>
								<div className="flex items-center gap-3">
									<div
										className={`${
											isDesktopOpen ? "w-10 h-10" : "w-8 h-8"
										} bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md`}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className={`${
												isDesktopOpen ? "h-6 w-6" : "h-5 w-5"
											} text-primary-foreground`}
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2.5}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
											/>
										</svg>
									</div>
									<div className="text-left">
										<h3
											className={`font-bold ${
												isDesktopOpen ? "text-xl" : "text-base"
											} text-foreground`}
										>
											Filter by Body Part
										</h3>
										<p
											className={`${
												isDesktopOpen ? "text-sm" : "text-xs"
											} text-muted-foreground`}
										>
											{isDesktopOpen
												? "Select one or more joints to find specialized products"
												: hasSelection
												? `${selectedJoints.length} joint${
														selectedJoints.length > 1 ? "s" : ""
												  } selected`
												: "Click to expand and filter products"}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{hasSelection && (
										<Badge
											variant="default"
											className={`${
												isDesktopOpen
													? "text-sm px-3 py-1.5"
													: "text-xs px-2 py-0.5"
											} font-semibold shadow-sm`}
										>
											{selectedJoints.length}
										</Badge>
									)}
									{isDesktopOpen ? (
										<ChevronUp
											className={`${
												isDesktopOpen ? "h-6 w-6" : "h-5 w-5"
											} text-muted-foreground group-hover:text-foreground transition-colors`}
										/>
									) : (
										<ChevronDown
											className={`${
												isDesktopOpen ? "h-6 w-6" : "h-5 w-5"
											} text-muted-foreground group-hover:text-foreground transition-colors`}
										/>
									)}
								</div>
							</button>
						</CollapsibleTrigger>

						<CollapsibleContent>
							<div className="px-6 pb-6 space-y-6">
								{/* Header Section */}
								<div className="flex items-center justify-between pb-4 border-b-2 border-border/40">
									<Badge
										variant="secondary"
										className="text-sm font-semibold px-3 py-1.5 shadow-sm"
									>
										{selectedJoints.length === 0
											? "All"
											: selectedJoints.length}{" "}
										of {jointOptions.length}
									</Badge>
									<div className="flex items-center gap-3">
										{hasSelection && (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleClearAll}
												className="h-9 px-4 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-medium"
											>
												<X className="h-4 w-4 mr-1.5" />
												Clear
											</Button>
										)}
										<Button
											variant="outline"
											size="sm"
											onClick={isAllSelected ? handleClearAll : handleSelectAll}
											className="h-9 px-4 text-sm border-2 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
										>
											<Check className="h-4 w-4 mr-1.5" />
											{isAllSelected ? "Deselect All" : "Select All"}
										</Button>
									</div>
								</div>

								{/* Joint Capsules */}
								<JointCapsules />

								{/* Selected Summary */}
								{hasSelection && (
									<div className="pt-5 border-t-2 border-border/40">
										<div className="flex items-start gap-3">
											<span className="text-sm font-semibold text-foreground mt-1">
												Active Filters:
											</span>
											<div className="flex flex-wrap gap-2 flex-1">
												{selectedJoints.map((jointValue, index) => {
													const joint = jointOptions.find(
														(j) => j.value === jointValue
													);
													return joint ? (
														<Badge
															key={jointValue}
															variant="default"
															className="text-sm px-3 py-1.5 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-md"
														>
															{joint.icon.startsWith("/") ? (
																<div className="relative w-5 h-5">
																	<Image
																		src={joint.icon}
																		alt={joint.label}
																		fill
																		className="object-contain brightness-0 invert"
																	/>
																</div>
															) : (
																<span>{joint.icon}</span>
															)}
															<span className="font-medium">{joint.label}</span>
															<button
																onClick={(e) => {
																	e.preventDefault();
																	handleJointToggle(jointValue);
																}}
																className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
															>
																<X className="h-3.5 w-3.5" />
															</button>
														</Badge>
													) : null;
												})}
											</div>
										</div>
									</div>
								)}
							</div>
						</CollapsibleContent>
					</div>
				</Collapsible>
			</div>

			{/* Mobile Version */}
			<div className="md:hidden">
				<Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-between h-14 px-5 border-2 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-muted/30 to-background"
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-primary-foreground"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2.5}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
										/>
									</svg>
								</div>
								<div className="flex flex-col items-start">
									<span className="text-xs font-medium text-muted-foreground">
										Filter by Body Part
									</span>
									<span className="text-sm font-semibold">
										{getSelectedJointLabels()}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{hasSelection && (
									<Badge variant="default" className="text-xs font-bold">
										{selectedJoints.length}
									</Badge>
								)}
								<ChevronDown className="h-5 w-5" />
							</div>
						</Button>
					</SheetTrigger>
					<SheetContent side="bottom" className="h-[85vh] overflow-hidden">
						{/* Handle indicator */}
						<div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full"></div>

						<SheetHeader className="text-left pt-6">
							<SheetTitle className="flex items-center justify-between">
								<div>
									<span className="text-lg">Select Joint Types</span>
									<div className="text-sm text-muted-foreground mt-1">
										Choose the joints you want to filter by
									</div>
								</div>
								<div className="flex gap-2">
									{hasSelection && (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleClearAll}
											className="h-8 px-3 text-xs"
										>
											Clear All
										</Button>
									)}
									<Button
										variant="ghost"
										size="sm"
										onClick={isAllSelected ? handleClearAll : handleSelectAll}
										className="h-8 px-3 text-xs"
									>
										{isAllSelected ? "Deselect All" : "Select All"}
									</Button>
								</div>
							</SheetTitle>
						</SheetHeader>

						<div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(85vh-200px)]">
							{/* Mobile Grid */}
							<div className="grid grid-cols-2 gap-4 pb-4">
								{jointOptions.map((joint) => {
									const isSelected = selectedJoints.includes(
										joint.value as Joint
									);
									return (
										<button
											key={joint.value}
											onClick={() => handleJointToggle(joint.value as Joint)}
											className={`
												relative p-5 rounded-2xl border-2 transition-all duration-300 shadow-md
												${
													isSelected
														? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary shadow-xl scale-[1.02] ring-4 ring-primary/20"
														: "bg-card border-border hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 active:scale-95"
												}
											`}
										>
											<div className="flex flex-col items-center gap-3">
												<div
													className={`relative w-16 h-16 transition-all duration-300 ${
														isSelected ? "scale-110 drop-shadow-lg" : ""
													}`}
												>
													{joint.icon.startsWith("/") ? (
														<Image
															src={joint.icon}
															alt={joint.label}
															fill
															className="object-contain"
														/>
													) : (
														<span className="text-3xl flex items-center justify-center w-full h-full">
															{joint.icon}
														</span>
													)}
												</div>
												<span className="text-sm font-semibold text-center leading-tight">
													{joint.label}
												</span>
												{isSelected && (
													<div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background">
														<Check className="h-4 w-4 stroke-[3]" />
													</div>
												)}
											</div>
										</button>
									);
								})}
							</div>

							{/* Selected Summary */}
							{hasSelection && (
								<div className="bg-muted/50 p-4 rounded-lg">
									<div className="text-sm font-medium mb-2">
										Selected Joints:
									</div>
									<div className="flex flex-wrap gap-2">
										{selectedJoints.map((jointValue) => {
											const joint = jointOptions.find(
												(j) => j.value === jointValue
											);
											return joint ? (
												<Badge
													key={jointValue}
													variant="secondary"
													className="flex items-center gap-1.5"
												>
													{joint.icon.startsWith("/") ? (
														<div className="relative w-4 h-4">
															<Image
																src={joint.icon}
																alt={joint.label}
																fill
																className="object-contain"
															/>
														</div>
													) : (
														<span>{joint.icon}</span>
													)}
													{joint.label}
												</Badge>
											) : null;
										})}
									</div>
								</div>
							)}

							{/* Apply Button */}
							<Button
								onClick={() => setIsMobileSheetOpen(false)}
								className="w-full h-12"
								size="lg"
							>
								Apply Filters ({selectedJoints.length} selected)
							</Button>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
}
