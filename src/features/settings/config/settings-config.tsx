"use client";

import React from "react";
import { SettingCard } from "../components/setting-card";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import type { EditorSettings } from "../hooks/use-editor-settings";

export type SettingGroup = {
  id: string;
  title?: string;
  description?: string;
  type: "card" | "theme";
  items?: SettingItem[];
  customContent?: React.ReactNode;
};

export type SettingItem = {
  id: keyof EditorSettings;
  title: string;
  description: string;
  type: "switch";
  experimental?: boolean;
  warning?: string;
  disabled?: boolean;
};

export const SETTINGS_GROUPS: SettingGroup[] = [
  {
    id: "theme",
    type: "theme",
    customContent: (
      <SettingCard>
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-xs text-muted-foreground">
            Toggle between system, light and dark modes. System is used by
            default.
          </p>
        </div>
        <ThemeToggle />
      </SettingCard>
    ),
  },
  {
    id: "download-behaviour",
    type: "card",
    title: "Download behaviour",
    items: [
      {
        id: "encodingUtf8",
        title: "Use UTF-8 encoding",
        description:
          "Save scripts using UTF-8 instead of UTF-16 for better compatibility.",
        type: "switch",
        disabled: true,
      },
      {
        id: "autoCreateRestorePoint",
        title: "Auto-create restore point",
        description:
          "Automatically create a system restore point before applying tweaks. If creation fails, you'll be prompted to continue or cancel.",
        type: "switch",
      },
      {
        id: "downloadEachTweak",
        title: "Download each tweak separately",
        description:
          "Export one file per tweak instead of a single combined PowerShell script.",
        type: "switch",
      },
      {
        id: "alwaysShowWarning",
        title: "Always show warning message",
        description:
          "Before downloading, remind users to review and understand each tweak.",
        type: "switch",
      },
      {
        id: "hideSensitive",
        title: "Hide sensitive values",
        description:
          "Obfuscate values that may contain personal or system-specific information in the script preview.",
        type: "switch",
      },
    ],
  },
];
