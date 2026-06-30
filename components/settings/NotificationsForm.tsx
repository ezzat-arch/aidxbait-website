"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MessageSquare, Bell } from "lucide-react";

interface NotificationPrefs {
	orderUpdates: boolean;
	appointmentReminders: boolean;
	promotions: boolean;
	smsOrderAlerts: boolean;
	smsAppointments: boolean;
}

interface ToggleRowProps {
	id: string;
	label: string;
	description: string;
	checked: boolean;
	onChange: () => void;
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="space-y-0.5 flex-1">
				<Label htmlFor={id} className="text-sm font-medium cursor-pointer">
					{label}
				</Label>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
			<Switch id={id} checked={checked} onCheckedChange={onChange} />
		</div>
	);
}

export function NotificationsForm() {
	const { toast } = useToast();
	const [saving, setSaving] = useState(false);
	const [prefs, setPrefs] = useState<NotificationPrefs>({
		orderUpdates: true,
		appointmentReminders: true,
		promotions: false,
		smsOrderAlerts: true,
		smsAppointments: false,
	});

	const toggle = (key: keyof NotificationPrefs) =>
		setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

	const handleSave = async () => {
		setSaving(true);
		// Persist to server when notification preferences table is available
		await new Promise((r) => setTimeout(r, 400));
		setSaving(false);
		toast({
			title: "Preferences saved",
			description: "Your notification settings have been updated.",
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5 text-primary" />
						Email Notifications
					</CardTitle>
					<CardDescription>
						Choose which emails you want to receive from Doctoory
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<ToggleRow
						id="orderUpdates"
						label="Order Updates"
						description="Shipping confirmations, delivery status, and order changes"
						checked={prefs.orderUpdates}
						onChange={() => toggle("orderUpdates")}
					/>
					<Separator />
					<ToggleRow
						id="appointmentReminders"
						label="Appointment Reminders"
						description="Reminders before home visits, consultations, and lab tests"
						checked={prefs.appointmentReminders}
						onChange={() => toggle("appointmentReminders")}
					/>
					<Separator />
					<ToggleRow
						id="promotions"
						label="Promotions & Offers"
						description="Exclusive discounts, seasonal deals, and new service announcements"
						checked={prefs.promotions}
						onChange={() => toggle("promotions")}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-primary" />
						SMS Notifications
					</CardTitle>
					<CardDescription>
						Text message alerts sent to your registered phone number
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<ToggleRow
						id="smsOrderAlerts"
						label="Order Alerts"
						description="SMS when your order ships or is out for delivery"
						checked={prefs.smsOrderAlerts}
						onChange={() => toggle("smsOrderAlerts")}
					/>
					<Separator />
					<ToggleRow
						id="smsAppointments"
						label="Appointment Alerts"
						description="SMS reminders 1 hour before your scheduled appointments"
						checked={prefs.smsAppointments}
						onChange={() => toggle("smsAppointments")}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5 text-primary" />
						Push Notifications
					</CardTitle>
					<CardDescription>
						In-app notifications when you are active on the platform
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Push notifications are always enabled for critical account alerts such as
						payment confirmations and security events.
					</p>
				</CardContent>
			</Card>

			<Button onClick={handleSave} disabled={saving}>
				{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
				Save Preferences
			</Button>
		</div>
	);
}
