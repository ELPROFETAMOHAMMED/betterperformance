import HomeContent from "@/components/main/home";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="h-full w-full">
      <main className="flex min-h-screen w-full items-center justify-center">
        <HomeContent />
      </main>
    </ScrollArea>
  );
}
