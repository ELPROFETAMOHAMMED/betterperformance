"use client";

import { Switch } from "@/shared/components/ui/switch";
import { AlertTriangle } from "lucide-react";

interface SettingSwitchProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  experimental?: boolean;
  warning?: string;
}

export function SettingSwitch({
  title,
  description,
  checked,
  onCheckedChange,
  experimental,
  warning,
}: SettingSwitchProps) {
  const showWarning = checked && warning;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{title}</p>
            {experimental && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                Experimental
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {showWarning && (
        <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{warning}</p>
        </div>
      )}
    </div>
  );
}

