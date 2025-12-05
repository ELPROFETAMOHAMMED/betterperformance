"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LandingErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle auth errors from callback
  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      const message = errorDescription || error || "Authentication failed";
      toast.error(message);
      // Clean up URL
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
