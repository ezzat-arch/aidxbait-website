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
import { useTranslations } from "next-intl";

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
	const t = useTranslations("settings.notifications");
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
			title: t("toast.saved_title"),
			description: t("toast.saved_description"),
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5 text-primary" />
						{t("email_notifications")}
					</CardTitle>
					<CardDescription>
						{t("email_notifications_description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<ToggleRow
						id="orderUpdates"
						label={t("order_updates")}
						description={t("order_updates_description")}
						checked={prefs.orderUpdates}
						onChange={() => toggle("orderUpdates")}
					/>
					<Separator />
					<ToggleRow
						id="appointmentReminders"
						label={t("appointment_reminders")}
						description={t("appointment_reminders_description")}
						checked={prefs.appointmentReminders}
						onChange={() => toggle("appointmentReminders")}
					/>
					<Separator />
					<ToggleRow
						id="promotions"
						label={t("promotions")}
						description={t("promotions_description")}
						checked={prefs.promotions}
						onChange={() => toggle("promotions")}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-primary" />
						{t("sms_notifications")}
					</CardTitle>
					<CardDescription>
						{t("sms_notifications_description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<ToggleRow
						id="smsOrderAlerts"
						label={t("sms_order_alerts")}
						description={t("sms_order_alerts_description")}
						checked={prefs.smsOrderAlerts}
						onChange={() => toggle("smsOrderAlerts")}
					/>
					<Separator />
					<ToggleRow
						id="smsAppointments"
						label={t("sms_appointment_alerts")}
						description={t("sms_appointment_alerts_description")}
						checked={prefs.smsAppointments}
						onChange={() => toggle("smsAppointments")}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5 text-primary" />
						{t("push_notifications")}
					</CardTitle>
					<CardDescription>
						{t("push_notifications_description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						{t("push_always_enabled")}
					</p>
				</CardContent>
			</Card>

			<Button onClick={handleSave} disabled={saving}>
				{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
				{t("save_preferences")}
			</Button>
		</div>
	);
}
