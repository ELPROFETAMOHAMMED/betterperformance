"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/shared/hooks/use-user";

interface UserReport {
  tweak_id: string;
  description: string;
  created_at: string;
}

interface AllReportWithDescription {
  tweak_id: string;
  description: string;
  created_at: string;
}

async function fetchUserReports(): Promise<UserReport[]> {
  const response = await fetch("/api/tweaks/user-reports");
  if (!response.ok) {
    throw new Error("Failed to fetch user reports");
  }
  return response.json();
}

async function fetchAllReportsWithDescriptions(): Promise<AllReportWithDescription[]> {
  const response = await fetch("/api/tweaks/all-reports-with-descriptions");
  if (!response.ok) {
    throw new Error("Failed to fetch all reports with descriptions");
  }
  return response.json();
}

interface UseTweakReportsFiltersResult {
  reportedTweakIds: Set<string>;
  userReportDescriptions: Map<string, string>;
  allReportDescriptions: Map<string, string>;
  isLoading: boolean;
  refreshReports: () => Promise<void>;
}

export function useTweakReportsFilters(
  enabled: boolean
): UseTweakReportsFiltersResult {
  const { user } = useUser();

  const {
    data: userReports,
    isLoading: isUserReportsLoading,
    refetch: refetchUserReports,
  } = useQuery({
    queryKey: ["user-reports", user?.id],
    queryFn: fetchUserReports,
    enabled: enabled && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: allReportsWithDescriptions,
    isLoading: isAllReportsLoading,
    refetch: refetchAllReports,
  } = useQuery({
    queryKey: ["all-reports-with-descriptions"],
    queryFn: fetchAllReportsWithDescriptions,
    enabled: enabled && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    reportedTweakIds,
    userReportDescriptions,
    allReportDescriptions,
  } = useMemo(() => {
    const reportedIds = new Set<string>();
    const userDescriptions = new Map<string, string>();
    const allDescriptions = new Map<string, string>();

    if (userReports) {
      for (const report of userReports) {
        reportedIds.add(report.tweak_id);
        // Store the most recent description for each tweak (already sorted by created_at desc)
        if (!userDescriptions.has(report.tweak_id)) {
          userDescriptions.set(report.tweak_id, report.description);
        }
      }
    }

    if (allReportsWithDescriptions) {
      for (const report of allReportsWithDescriptions) {
        allDescriptions.set(report.tweak_id, report.description);
      }
    }

    return {
      reportedTweakIds: reportedIds,
      userReportDescriptions: userDescriptions,
      allReportDescriptions: allDescriptions,
    };
  }, [userReports, allReportsWithDescriptions]);

  const refreshReports = async () => {
    await Promise.all([
      refetchUserReports(),
      refetchAllReports(),
    ]);
  };

  return {
    reportedTweakIds,
    userReportDescriptions,
    allReportDescriptions,
    isLoading: (isUserReportsLoading || isAllReportsLoading) && enabled,
    refreshReports,
  };
}

