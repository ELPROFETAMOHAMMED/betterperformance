"use client";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search } from "lucide-react";

interface SearchPackagesInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search input component with icon and styled with shadcn theme tokens.
 */
export function SearchPackagesInput({ value, onChange }: SearchPackagesInputProps) {
  return (
    <div className="relative group w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
        <Search className="h-5 w-5" />
      </div>
      <Input
        placeholder="Search for Windows applications (e.g., Discord, VS Code, Steam)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border-border/60 bg-background pl-12 text-sm"
      />
      {value && (
        <Button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md"
          variant="ghost"
          size="icon"
          type="button"
        >
          <span className="sr-only">Clear search</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      )}
    </div>
  );
}
