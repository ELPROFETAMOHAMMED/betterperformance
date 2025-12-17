"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

interface UseTweakRealtimeCountersOptions {
  tweakIds: string[];
  enabled?: boolean;
  pollInterval?: number; // in milliseconds
}

interface TweakCounters {
  [tweakId: string]: {
    download_count: number;
    favorite_count: number;
  };
}

export function useTweakRealtimeCounters({
  tweakIds,
  enabled = true,
  pollInterval = 3000, // Poll every 3 seconds
}: UseTweakRealtimeCountersOptions) {
  const [counters, setCounters] = useState<TweakCounters>({});
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof createClient>["channel"] | null>(null);

  useEffect(() => {
    if (!enabled || tweakIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Initial fetch
    const fetchCounters = async () => {
      try {
        const { data, error } = await supabase
          .from("tweaks")
          .select("id, download_count, favorite_count")
          .in("id", tweakIds);

        if (error) throw error;

        const newCounters: TweakCounters = {};
        (data || []).forEach((tweak) => {
          newCounters[tweak.id] = {
            download_count: tweak.download_count || 0,
            favorite_count: tweak.favorite_count || 0,
          };
        });

        setCounters(newCounters);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tweak counters:", error);
        setIsLoading(false);
      }
    };

    fetchCounters();

    // Set up polling as fallback (Supabase Realtime can be unreliable)
    intervalRef.current = setInterval(fetchCounters, pollInterval);

    // Try to set up Supabase Realtime subscription
    // Note: Realtime requires proper configuration in Supabase
    // If it fails, we fall back to polling which is more reliable
    try {
      if (tweakIds.length > 0) {
        const channel = supabase
          .channel(`tweak-counters-${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "tweaks",
            },
            (payload) => {
              const updatedTweak = payload.new as {
                id: string;
                download_count: number;
                favorite_count: number;
              };

              // Only update if this tweak is in our list
              if (tweakIds.includes(updatedTweak.id)) {
                setCounters((prev) => ({
                  ...prev,
                  [updatedTweak.id]: {
                    download_count: updatedTweak.download_count || 0,
                    favorite_count: updatedTweak.favorite_count || 0,
                  },
                }));
              }
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("Realtime subscription active for tweak counters");
            } else if (status === "CHANNEL_ERROR") {
              console.warn("Realtime subscription error, using polling only");
            }
          });

        channelRef.current = channel;
      }
    } catch (error) {
      console.warn("Could not set up Realtime subscription, using polling only:", error);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [tweakIds, enabled, pollInterval]);

  const getCounter = (tweakId: string) => {
    return counters[tweakId] || { download_count: 0, favorite_count: 0 };
  };

  return {
    counters,
    getCounter,
    isLoading,
  };
}

