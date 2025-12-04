"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserCircle2Icon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
export default function LoginButton() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error)
      return toast.error(
        error instanceof Error ? error.message : "Unknown error"
      );

    if (data) return toast.success("Welcome back");
  };

  return (
    <Button variant={"outline"} onClick={handleLogin}>
      <UserCircle2Icon className="h-5 w-5" />
      <Separator orientation={"vertical"} />
      <span>Login with google</span>
    </Button>
  );
}
