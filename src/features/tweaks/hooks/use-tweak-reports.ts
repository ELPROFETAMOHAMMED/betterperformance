import { useQuery } from "@tanstack/react-query";
import type { TweakReport } from "../types/tweak-report.types";

async function fetchTweakReports(tweakId: string): Promise<TweakReport[]> {
  const response = await fetch(`/api/tweaks/${tweakId}/reports`);
  if (!response.ok) {
    throw new Error("Failed to fetch reports");
  }
  return response.json();
}

export function useTweakReports(tweakId: string | undefined) {
  return useQuery({
    queryKey: ["tweak-reports", tweakId],
    queryFn: () => fetchTweakReports(tweakId!),
    enabled: !!tweakId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

