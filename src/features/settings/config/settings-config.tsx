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
    id: "editor-display",
    type: "card",
    title: "Editor display settings",
    items: [
      {
        id: "showLineNumbers",
        title: "Show line numbers",
        description:
          "Display line numbers in the editor gutter. Automatically enabled when code editing is active.",
        type: "switch",
      },
      {
        id: "enableTextColors",
        title: "Enable syntax colors",
        description:
          "Use semantic colors for PowerShell keywords, strings and comments.",
        type: "switch",
      },
      {
        id: "showComments",
        title: "Show tweak comments",
        description:
          "When enabled, each tweak's description and metadata will be added as commented lines above its code block.",
        type: "switch",
      },
      {
        id: "wrapCode",
        title: "Enable word wrap",
        description:
          "Wrap long lines in the code editor instead of requiring horizontal scrolling.",
        type: "switch",
        experimental: true,
        warning: "This feature is in development and may cause UI misalignments or visual issues.",
      },
      {
        id: "hideSensitive",
        title: "Hide sensitive values",
        description:
          "Obfuscate values that may contain personal or system-specific information.",
        type: "switch",
      },
      {
        id: "enableCodeEditing",
        title: "Enable code editing",
        description:
          "Allow manual editing of code in the editor. When disabled, the editor is in preview mode (read-only) to prevent accidental changes.",
        type: "switch",
        disabled: true,
        warning: "This feature is not currently disabled due to technical limitations and will be enabled in the future.",
      },
    ],
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
    ],
  },
];

