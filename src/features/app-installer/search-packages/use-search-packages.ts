"use client";

import { useState, useEffect } from "react";
import type {
  WingetPackage,
  WingetSearchResponse,
} from "@/features/app-installer/types/winget-package";

/**
 * Custom hook to search for winget packages with debounce.
 * 
 * @param query - The search string
 * @returns An object containing the search results, loading state, and any error
 */
export const useSearchPackages = (query: string) => {
  const [packages, setPackages] = useState<WingetPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setPackages([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://api.winget.run/v2/packages?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: WingetSearchResponse = await response.json();
        setPackages(data.Packages || []);
      } catch (err) {
        console.error("Winget search error:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred while searching.");
        setPackages([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  return { packages, isLoading, error };
};
