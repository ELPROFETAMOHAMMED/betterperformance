import { Suspense } from "react";
import { requireAuth } from "@/shared/utils/auth-guard";
import { fetchTweakCategories } from "@/features/tweaks/utils/tweaks-server";
import TweaksPageClient from "@/features/tweaks/components/tweaks-page-client";

export default async function TweaksPage() {
  // Ensure user is authenticated (redirects if not)
  await requireAuth();

  // Fetch data on the server
  const categories = await fetchTweakCategories();

  return (
    <Suspense>
      <TweaksPageClient categories={categories} />
    </Suspense>
  );
}



