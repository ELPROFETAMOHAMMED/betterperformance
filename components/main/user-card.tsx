"use client";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, Settings, CreditCard, Crown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";

export default function UserCard() {
  const { user, loading } = useUser();
  const supabase = createClient();
  const router = useRouter();
  const isAdmin = user?.user_metadata?.role === "admin";

  if (loading) {
    return (
      <Card className="flex items-center gap-4 p-4 bg-background shadow-none border-none">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card className="flex items-center gap-4 p-4 bg-background shadow-none border-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 focus:outline-none border p-2 rounded-lg relative">
            <div className="relative">
              <Avatar>
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.name || "User"}
                />
                <AvatarFallback>
                  {user?.user_metadata?.name
                    ? user.user_metadata.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {isAdmin && (
                <span
                  className="absolute -top-2 -right-2 bg-transparent"
                  title="Admin"
                >
                  <Crown className="h-5 w-5 text-yellow-400 drop-shadow-lg" />
                </span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold">
                {user?.user_metadata?.name || "User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email || ""}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Change plan
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={async () => {
              try {
                await supabase.auth.signOut().then(() => {
                  router.push("/");
                });
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Unknown Error"
                );
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}
