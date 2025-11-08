import { createClient } from "@/utils/supabase/server";
import TweaksContent from "@/components/tweaks/tweaks-content";
import { mockTweaksData } from "@/data/mock-tweaks";

export default async function TweaksPage() {
  const supabase = await createClient();

  // Obtener el usuario autenticado
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return <div>No autenticado</div>;
  }

  return (
    <main className="flex-1 flex w-full h-full overflow-hidden">
      <TweaksContent categories={mockTweaksData} />
    </main>
  );
}

