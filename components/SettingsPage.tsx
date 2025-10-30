"use client";

import { useState, useEffect } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { SessionsManager } from "@/components/SessionsManager";
import { Trans } from "@lingui/react/macro";
import { Shield, User, Lock, Monitor, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icons } from "./icons";

interface SettingsPageProps {
  locale: string;
  user: any;
  roleData: any;
}

type SettingsSection = "account" | "security" | "linked-accounts" | "sessions";

export function SettingsPage({ locale, user, roleData }: SettingsPageProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");

  // Initialize active section from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the '#'
    const validSections: SettingsSection[] = [
      "account",
      "security",
      "linked-accounts",
      "sessions",
    ];

    if (hash && validSections.includes(hash as SettingsSection)) {
      setActiveSection(hash as SettingsSection);
    }
  }, []);

  // Handle tab change with URL hash update
  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section);
    window.history.pushState(null, "", `#${section}`);
  };

  const sections = [
    {
      id: "account" as SettingsSection,
      label: <Trans>Account</Trans>,
      icon: User,
      description: <Trans>Manage your profile information</Trans>,
    },
    {
      id: "security" as SettingsSection,
      label: <Trans>Security</Trans>,
      icon: Lock,
      description: <Trans>Password and security settings</Trans>,
    },
    {
      id: "linked-accounts" as SettingsSection,
      label: <Trans>Linked Accounts</Trans>,
      icon: LinkIcon,
      description: <Trans>Connect your Google account</Trans>,
    },
    {
      id: "sessions" as SettingsSection,
      label: <Trans>Sessions</Trans>,
      icon: Monitor,
      description: <Trans>Manage active and inactive sessions</Trans>,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#007FFF] to-[#17224D] flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#17224D]">
              <Trans>Settings</Trans>
            </h1>
            <p className="text-gray-600">
              <Trans>Manage your account settings and preferences</Trans>
            </p>
          </div>
        </div>
      </div>

      {/* Settings Layout with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-20">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                      isActive
                        ? "bg-[#007FFF] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive ? "text-white" : "text-gray-400"
                      )}
                    />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Account Section */}
            {activeSection === "account" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-[#007FFF]" />
                  <h2 className="text-xl font-semibold text-[#17224D]">
                    <Trans>Account Information</Trans>
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  <Trans>Update your profile information and photo</Trans>
                </p>
                <ProfileForm user={user} roleData={roleData} locale={locale} />
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-[#007FFF]" />
                  <h2 className="text-xl font-semibold text-[#17224D]">
                    <Trans>Security Settings</Trans>
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  <Trans>Manage your password and security preferences</Trans>
                </p>
                <PasswordChangeForm
                  locale={locale}
                  hasPassword={!!user.passHash}
                />
              </div>
            )}

            {/* Linked Accounts Section */}
            {activeSection === "linked-accounts" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-5 h-5 text-[#007FFF]" />
                  <h2 className="text-xl font-semibold text-[#17224D]">
                    <Trans>Linked Accounts</Trans>
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  <Trans>Connect your account with third-party services</Trans>
                </p>

                {/* Google Account */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <Icons.Google className="w-5 h-5 text-[#4285F4]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#17224D]">Google</p>
                        <p className="text-sm text-gray-600">
                          {user.googleId ? (
                            <Trans>Connected</Trans>
                          ) : (
                            <Trans>Not connected</Trans>
                          )}
                        </p>
                      </div>
                    </div>
                    {user.googleId ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                          <Trans>Active</Trans>
                        </span>
                      </div>
                    ) : (
                      <button className="px-4 py-2 bg-[#007FFF] text-white rounded-lg hover:bg-[#0066CC] transition-colors text-sm font-medium">
                        <Trans>Connect</Trans>
                      </button>
                    )}
                  </div>
                  {user.googleId && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <Trans>You can sign in with your Google account</Trans>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sessions Section */}
            {activeSection === "sessions" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-5 h-5 text-[#007FFF]" />
                  <h2 className="text-xl font-semibold text-[#17224D]">
                    <Trans>Active Sessions</Trans>
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  <Trans>Manage your active sessions across all devices</Trans>
                </p>
                <SessionsManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
