"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BodyPart } from "@/types/body-map-types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useTranslations } from "next-intl";

interface JointSelectionModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedPart: BodyPart | null;
}

export function JointSelectionModal({
	isOpen,
	onOpenChange,
	selectedPart,
}: JointSelectionModalProps) {
	const router = useRouter();
	const isMobile = useIsMobile();
	const t = useTranslations();

	const handleViewProducts = () => {
		if (selectedPart) {
			router.push(`/services/store?joint=${selectedPart.joint}`);
			onOpenChange(false);
		}
	};

	if (!selectedPart) return null;

	// Get the translated label for the selected body part
	const translatedLabel = t(selectedPart.translationKey);

	// Mobile: Bottom Sheet (Drawer)
	if (isMobile) {
		return (
			<Drawer open={isOpen} onOpenChange={onOpenChange}>
				<DrawerContent className="bg-white dark:bg-gray-900 border-t-4 border-primary">
					<DrawerHeader className="text-center px-6 pb-4">
						<DrawerTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
							{t.rich("sections.body_map.modal.title", {
								part: translatedLabel,
								highlight: (chunks) => (
									<span className="text-primary">{chunks}</span>
								),
							})}
						</DrawerTitle>
						<DrawerDescription className="text-base text-gray-600 dark:text-gray-300">
							{t.rich("sections.body_map.modal.description", {
								part: translatedLabel.toLowerCase(),
								highlight: (chunks) => (
									<span className="font-semibold text-gray-900 dark:text-white">
										{chunks}
									</span>
								),
							})}
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter className="pb-8 px-6">
						<Button
							onClick={handleViewProducts}
							size="lg"
							className="bg-primary hover:bg-primary/90 text-white font-semibold w-full group py-6 text-base"
						>
							{t("sections.body_map.modal.view_products")}
							<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	// Desktop: Centered Modal (Dialog)
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-2 border-primary/20 shadow-2xl">
				<DialogHeader className="text-center space-y-3 pb-2">
					<DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
						{t.rich("sections.body_map.modal.title", {
							part: translatedLabel,
							highlight: (chunks) => (
								<span className="text-primary">{chunks}</span>
							),
						})}
					</DialogTitle>
					<DialogDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
						{t.rich("sections.body_map.modal.description", {
							part: translatedLabel.toLowerCase(),
							highlight: (chunks) => (
								<span className="font-semibold text-gray-900 dark:text-white">
									{chunks}
								</span>
							),
						})}
					</DialogDescription>
				</DialogHeader>
				<div className="flex justify-center pt-6 pb-2">
					<Button
						onClick={handleViewProducts}
						size="lg"
						className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group w-full text-base"
					>
						{t("sections.body_map.modal.view_products")}
						<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

