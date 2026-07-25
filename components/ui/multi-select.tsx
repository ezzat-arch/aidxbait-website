"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

export interface MultiSelectOption {
	value: string;
	label: string;
}

interface MultiSelectProps {
	options: MultiSelectOption[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	maxDisplayed?: number;
	className?: string;
	emptyText?: string;
	searchPlaceholder?: string;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder,
	maxDisplayed = 2,
	className,
	emptyText,
	searchPlaceholder,
}: MultiSelectProps) {
	const t = useTranslations("ui.multi_select");
	const resolvedPlaceholder = placeholder ?? t("select_items");
	const resolvedEmptyText = emptyText ?? t("no_results_found");
	const resolvedSearchPlaceholder = searchPlaceholder ?? t("search");
	const [open, setOpen] = React.useState(false);

	const handleToggle = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter((item) => item !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	const handleSelectAll = () => {
		onChange(options.map((option) => option.value));
	};

	const handleClearAll = () => {
		onChange([]);
	};

	const getDisplayText = () => {
		if (selected.length === 0) {
			return resolvedPlaceholder;
		}

		if (selected.length <= maxDisplayed) {
			return selected
				.map(
					(value) => options.find((option) => option.value === value)?.label
				)
				.filter(Boolean)
				.join(", ");
		}

		return t("n_selected", { count: selected.length });
	};

	const isAllSelected = selected.length === options.length;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"justify-between h-12 border-2 shadow-sm hover:shadow-md transition-shadow",
						className
					)}
				>
					<span className="truncate">{getDisplayText()}</span>
					<div className="flex items-center gap-2 ml-2 shrink-0">
						{selected.length > 0 && (
							<Badge
								variant="secondary"
								className="rounded-sm px-1.5 py-0.5 text-xs font-bold"
							>
								{selected.length}
							</Badge>
						)}
						<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[280px] p-0" align="start">
				<Command>
					<CommandInput placeholder={resolvedSearchPlaceholder} />
					<CommandList>
						<CommandEmpty>{resolvedEmptyText}</CommandEmpty>
						<CommandGroup>
							{/* Action Buttons */}
							<div className="flex items-center justify-between gap-2 px-2 py-2 border-b">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleSelectAll}
									disabled={isAllSelected}
									className="h-7 px-2 text-xs"
								>
									<Check className="h-3 w-3 mr-1" />
									{t("select_all")}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearAll}
									disabled={selected.length === 0}
									className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
								>
									<X className="h-3 w-3 mr-1" />
									{t("clear")}
								</Button>
							</div>

							{/* Options List */}
							{options.map((option) => {
								const isSelected = selected.includes(option.value);
								return (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => handleToggle(option.value)}
										className="cursor-pointer"
									>
										<div className="flex items-center gap-2 w-full">
											<Checkbox
												checked={isSelected}
												onCheckedChange={() => handleToggle(option.value)}
												className="pointer-events-none"
											/>
											<span className="flex-1">{option.label}</span>
											{isSelected && (
												<Check className="h-4 w-4 text-primary" />
											)}
										</div>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

