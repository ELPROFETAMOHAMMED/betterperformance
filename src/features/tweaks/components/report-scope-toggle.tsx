"use client";

import {
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

type ReportScopeToggleProps = {
  allCount: number;
  canViewUserScope: boolean;
  scope: "user" | "global";
  userCount: number;
  onScopeChange: (scope: "user" | "global") => void;
};

export function ReportScopeToggle({
  allCount,
  canViewUserScope,
  scope,
  userCount,
  onScopeChange,
}: ReportScopeToggleProps) {
  return (
    <div className="flex flex-col gap-2 p-1">
      <Button
        variant={scope === "global" ? "secondary" : "ghost"}
        size="sm"
        className="h-9 justify-start gap-2 rounded-lg px-3"
        onClick={() => onScopeChange("global")}
      >
        <UsersIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Global Reports</span>
        <Badge variant="outline" className="ml-auto h-4 px-1 text-[10px]">
          {allCount}
        </Badge>
      </Button>
      <Button
        variant={scope === "user" ? "secondary" : "ghost"}
        size="sm"
        className="h-9 justify-start gap-2 rounded-lg px-3"
        onClick={() => onScopeChange("user")}
        disabled={!canViewUserScope}
      >
        <UserIcon className="h-4 w-4" />
        <span className="text-sm font-medium">My Reports</span>
        <Badge variant="outline" className="ml-auto h-4 px-1 text-[10px]">
          {userCount}
        </Badge>
      </Button>
    </div>
  );
}
