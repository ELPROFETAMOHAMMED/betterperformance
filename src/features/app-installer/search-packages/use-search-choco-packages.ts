"use client";

import { useEffect, useState } from "react";

import type {
  ChocoPackage,
  NugetSearchResponse,
} from "@/features/app-installer/types/choco-package";

export function useSearchChocoPackages(query: string) {
  const [packages, setPackages] = useState<ChocoPackage[]>([]);
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
          `https://azuresearch-usnc.nuget.org/query?q=${encodeURIComponent(query)}&prerelease=false&take=30`
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: NugetSearchResponse = await response.json();
        setPackages(
          (data.data ?? []).map((item) => {
            const normalizedTitle = (typeof item.title === "string" ? item.title : "").trim();
            const normalizedDescription = (typeof item.description === "string" ? item.description : "").trim();
            const normalizedAuthors = (
              Array.isArray(item.authors)
                ? item.authors.join(", ")
                : item.authors ?? ""
            ).trim();

            return {
              id: item.id,
              version: item.version,
              title: normalizedTitle || item.id,
              description: normalizedDescription || "No description available.",
              publisher: normalizedAuthors || "Unknown",
            };
          })
        );
      } catch (err) {
        console.error("Chocolatey search error:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred while searching.");
        setPackages([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  return { packages, isLoading, error };
}
