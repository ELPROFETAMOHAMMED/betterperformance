"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserCircle2Icon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LandingLoginButtonProps {
  className?: string;
}

export default function LandingLoginButton({
  className,
}: LandingLoginButtonProps) {
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
    <Button
      size="lg"
      onClick={handleLogin}
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-md)] px-6 py-6 text-base font-medium h-auto",
        className
      )}
    >
      <UserCircle2Icon className="h-5 w-5" />
      <Separator orientation="vertical" className="h-5" />
      <span>Get started with Google</span>
    </Button>
  );
}
