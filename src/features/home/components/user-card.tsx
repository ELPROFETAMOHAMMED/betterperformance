"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { ArrowRightIcon, ArrowPathIcon, ExclamationCircleIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/shared/hooks/use-user";
import { useState } from "react";
import Link from "next/link";

export default function UserCard() {
  const { user, loading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isAdmin = user?.user_metadata?.role === "admin";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    (user?.user_metadata as Record<string, string | undefined>)?.avatarUrl ||
    (user?.user_metadata as Record<string, string | undefined>)?.picture ||
    (user?.user_metadata as Record<string, string | undefined>)?.avatar ||
    undefined;
  const userName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const handleUserSignOut = async () => {
    setIsLoading(true);
    try {
      await fetch(`${window.location.origin}/api/auth/logout`, {
        method: "POST",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Compact skeleton that preserves layout
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/80 px-3 py-1.5 backdrop-blur">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-2.5 w-24 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  // Fallback for guests or when user data fails to load
  if (!user) {
    return (
      <div className="flex items-center gap-3 rounded-sm border border-border/70 bg-background/80 px-3 py-1.5 backdrop-blur">
        <ExclamationCircleIcon className="w-4 h-4" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">
            Error trying to load user data
          </span>
          <Link
            href="/"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUserSignOut}
      disabled={isLoading}
      className="flex items-center gap-3 rounded-sm border-border/70 bg-background/90 px-3 py-6 text-left backdrop-blur hover:border-primary/60 hover:bg-accent/60 focus-visible:ring-offset-background transition-colors"
    >
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback>
            {userName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isAdmin && (
          <span
            className="absolute -right-1 -bottom-1 rounded-full bg-background/95 p-0.5"
            title="Admin"
          >
            <TrophyIcon className="h-3.5 w-3.5 text-yellow-400" />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col text-left">
        <span className="truncate text-xs font-semibold">{userName}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {user?.email || ""}
        </span>
      </div>
      {isLoading ? (
        <ArrowPathIcon className="ml-auto h-4 w-4 animate-spin" />
      ) : (
        <ArrowRightIcon className="ml-auto h-4 w-4" />
      )}
    </Button>
  );
}
