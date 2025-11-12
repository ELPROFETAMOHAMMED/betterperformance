import HomeContent from "@/components/main/home";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  // Obtener el usuario autenticado
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return redirect("/login");
  }

  return (
    <main className="flex-1 flex items-center justify-center w-full">
      <HomeContent />
    </main>
  );
}
