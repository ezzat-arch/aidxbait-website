"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JOINT_CATEGORIES } from "@/lib/store-data";
import { Joint } from "@/lib/store-types";
import { Check, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

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
			return joint ? `${joint.icon} ${joint.label}` : selectedJoints[0];
		}
		return `${selectedJoints.length} joints selected`;
	};

	// Desktop Joint Capsules with Icons
	const JointCapsules = () => (
		<div className="flex flex-wrap gap-3">
			{jointOptions.map((joint) => {
				const isSelected = selectedJoints.includes(joint.value as Joint);
				return (
					<button
						key={joint.value}
						onClick={() => handleJointToggle(joint.value as Joint)}
						className={`
							group relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-medium 
							transition-all duration-300 border-2 hover:shadow-lg transform hover:scale-105 
							active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50
							${
								isSelected
									? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-primary shadow-lg scale-105 ring-2 ring-primary/20"
									: "bg-background text-foreground border-border hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10"
							}
						`}
					>
						{/* Icon */}
						<span
							className={`text-lg transition-transform duration-200 ${
								isSelected ? "scale-110" : "group-hover:scale-110"
							}`}
						>
							{joint.icon}
						</span>

						{/* Label */}
						<span className="font-medium">{joint.label}</span>

						{/* Check Icon for Selected */}
						{isSelected && (
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-foreground text-primary rounded-full flex items-center justify-center">
								<Check className="h-3 w-3" />
							</div>
						)}
					</button>
				);
			})}
		</div>
	);

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Desktop Version */}
			<div className="hidden md:block space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-lg">Filter by Joint</h3>
						<Badge variant="outline" className="text-xs">
							{selectedJoints.length}/{jointOptions.length}
						</Badge>
					</div>
					<div className="flex gap-2">
						{hasSelection && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearAll}
								className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
							>
								<X className="h-3 w-3 mr-1" />
								Clear All
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={isAllSelected ? handleClearAll : handleSelectAll}
							className="h-8 px-3 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
						>
							<Check className="h-3 w-3 mr-1" />
							{isAllSelected ? "Deselect All" : "Select All"}
						</Button>
					</div>
				</div>

				<JointCapsules />

				{hasSelection && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>Selected:</span>
						{selectedJoints.map((jointValue, index) => {
							const joint = jointOptions.find((j) => j.value === jointValue);
							return joint ? (
								<Badge key={jointValue} variant="secondary" className="text-xs">
									{joint.icon} {joint.label}
								</Badge>
							) : null;
						})}
					</div>
				)}
			</div>

			{/* Mobile Version */}
			<div className="md:hidden">
				<Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-between h-12 px-4"
						>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">Joint Filter:</span>
								<span className="text-sm">{getSelectedJointLabels()}</span>
							</div>
							<div className="flex items-center gap-2">
								{hasSelection && (
									<Badge variant="secondary" className="text-xs">
										{selectedJoints.length}
									</Badge>
								)}
								<ChevronDown className="h-4 w-4" />
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

						<div className="mt-6 space-y-6">
							{/* Mobile Grid */}
							<div className="grid grid-cols-2 gap-3">
								{jointOptions.map((joint) => {
									const isSelected = selectedJoints.includes(
										joint.value as Joint
									);
									return (
										<button
											key={joint.value}
											onClick={() => handleJointToggle(joint.value as Joint)}
											className={`
												relative p-4 rounded-xl border-2 transition-all duration-200
												${
													isSelected
														? "bg-primary text-primary-foreground border-primary shadow-md"
														: "bg-background border-border hover:border-primary/50 hover:bg-primary/5"
												}
											`}
										>
											<div className="flex flex-col items-center gap-2">
												<span className="text-2xl">{joint.icon}</span>
												<span className="text-sm font-medium">
													{joint.label}
												</span>
												{isSelected && (
													<div className="absolute top-2 right-2 w-5 h-5 bg-primary-foreground text-primary rounded-full flex items-center justify-center">
														<Check className="h-3 w-3" />
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
												<Badge key={jointValue} variant="secondary">
													{joint.icon} {joint.label}
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
