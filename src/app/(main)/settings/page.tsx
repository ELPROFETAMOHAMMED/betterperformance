import { Suspense } from "react";
import { requireAuth } from "@/shared/utils/auth-guard";
import SettingsPageClient from "@/features/settings/components/settings-page-client";

export default async function SettingsPage() {
  // Ensure user is authenticated (redirects if not)
  await requireAuth();

  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}



