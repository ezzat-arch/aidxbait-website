"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, AlertTriangle } from "lucide-react";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SecurityForm } from "@/components/settings/SecurityForm";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
import { DangerZone } from "@/components/settings/DangerZone";

export default function SettingsPage() {
    return (
        <div className="space-y-6 pt-40">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger
                        value="profile"
                        className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                        <User className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                        <Shield className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="notifications"
                        className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                        <Bell className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="account"
                        className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Account</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileForm />
                </TabsContent>

                <TabsContent value="security">
                    <SecurityForm />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationsForm />
                </TabsContent>

                <TabsContent value="account">
                    <DangerZone />
                </TabsContent>
            </Tabs>
        </div>
    );
}
