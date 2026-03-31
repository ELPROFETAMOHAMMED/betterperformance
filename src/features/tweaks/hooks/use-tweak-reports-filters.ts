"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/shared/hooks/use-user";

export interface TweakReport {
  id: string;
  tweak_id: string;
  user_id: string;
  title: string;
  status: "pending" | "resolved" | "dismissed";
  risk_level: "low" | "medium" | "high";
  description: string;
  created_at: string;
}

async function fetchUserReports(): Promise<TweakReport[]> {
  const response = await fetch("/api/tweaks/user-reports");
  if (!response.ok) {
    throw new Error("Failed to fetch user reports");
  }
  return response.json();
}

async function fetchAllReports(): Promise<TweakReport[]> {
  const response = await fetch("/api/tweaks/all-reports-with-descriptions");
  if (!response.ok) {
    throw new Error("Failed to fetch all reports");
  }
  return response.json();
}

interface UseTweakReportsFiltersResult {
  reportedTweakIds: Set<string>;
  userReports: TweakReport[];
  allReports: TweakReport[];
  userReportDescriptions: Map<string, string>; // Legacy support for other parts of the UI
  allReportDescriptions: Map<string, string>;
  isLoading: boolean;
  refreshReports: () => Promise<void>;
}

export function useTweakReportsFilters(
  enabled: boolean
): UseTweakReportsFiltersResult {
  const { user } = useUser();

  const {
    data: userReportsData,
    isLoading: isUserReportsLoading,
    refetch: refetchUserReports,
  } = useQuery({
    queryKey: ["user-reports", user?.id],
    queryFn: fetchUserReports,
    enabled: enabled && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: allReportsData,
    isLoading: isAllReportsLoading,
    refetch: refetchAllReports,
  } = useQuery({
    queryKey: ["all-reports-with-descriptions"],
    queryFn: fetchAllReports,
    enabled: enabled && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    reportedTweakIds,
    userReportDescriptions,
    allReportDescriptions,
    userReports,
    allReports,
  } = useMemo(() => {
    const reportedIds = new Set<string>();
    const userDescriptions = new Map<string, string>();
    const allDescriptions = new Map<string, string>();
    const uReports = userReportsData || [];
    const aReports = allReportsData || [];

    for (const report of aReports) {
      reportedIds.add(report.tweak_id);
      if (!allDescriptions.has(report.tweak_id)) {
        allDescriptions.set(report.tweak_id, report.description);
      }
    }

    for (const report of uReports) {
      if (!userDescriptions.has(report.tweak_id)) {
        userDescriptions.set(report.tweak_id, report.description);
      }
    }

    return {
      reportedTweakIds: reportedIds,
      userReportDescriptions: userDescriptions,
      allReportDescriptions: allDescriptions,
      userReports: uReports,
      allReports: aReports,
    };
  }, [userReportsData, allReportsData]);

  const refreshReports = async () => {
    await Promise.all([
      refetchUserReports(),
      refetchAllReports(),
    ]);
  };

  return {
    reportedTweakIds,
    userReports,
    allReports,
    userReportDescriptions,
    allReportDescriptions,
    isLoading: (isUserReportsLoading || isAllReportsLoading) && enabled,
    refreshReports,
  };
}
