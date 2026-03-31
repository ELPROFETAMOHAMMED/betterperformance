"use client";

import { Input } from "@/shared/components/ui/input";
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
        className="pl-12 h-14 text-base bg-secondary/30 backdrop-blur-md border-border/40 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all duration-300 rounded-2xl shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
        </button>
      )}
    </div>
  );
}
