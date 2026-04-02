"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { AnimatedCounter } from "@/features/tweaks/components/animated-counter";
import { cn } from "@/shared/lib/utils";
import { useUser } from "@/shared/hooks/use-user";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatDistanceToNow } from "date-fns";
import { deleteTweakReport } from "../actions/delete-report";
import { useQueryClient } from "@tanstack/react-query";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";

// UI Components
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

// Icons
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  InformationCircleIcon,
  CommandLineIcon,
  FlagIcon,
  TrashIcon,
  UsersIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface TweakDetailsPanelProps {
  selectedTweaks: Tweak[];
  activeTweakId: string | null;
  categories: TweakCategory[];
  userReports?: TweakReport[];
  allReports?: TweakReport[];
}

export function TweakDetailsPanel({
  selectedTweaks,
  activeTweakId,
  isAdmin,
  userReports = [],
  allReports = [],
}: TweakDetailsPanelProps & { isAdmin?: boolean }) {
  const [activeTab, setActiveTab] = useState("details");
  const { resolvedTheme } = useTheme();

  const activeTweak = useMemo(
    () => selectedTweaks.find((t) => t.id === activeTweakId) || selectedTweaks[0] || null,
    [selectedTweaks, activeTweakId]
  );

  const displayDownloadCount = activeTweak?.download_count ?? 0;
  const displayFavoriteCount = activeTweak?.favorite_count ?? 0;

  if (!selectedTweaks.length) {
    return (
      <motion.div
        className="flex h-full flex-col items-center justify-center gap-5 border border-dashed border-border/40 bg-background/30 p-8 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative flex items-center justify-center rounded-2xl border border-border/50 bg-background/80 p-4"
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/assets/Aplication-logo.png"
              alt="BetterPerformance logo"
              width={80}
              height={80}
              className="rounded-[var(--radius-lg)] shadow-lg"
            />
          </motion.div>
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="font-medium text-foreground">No tweaks selected</h3>
          <p className="text-sm text-muted-foreground">
            Choose one or more tweaks from the explorer on the left to preview the PowerShell script,
            read the description, and manage reports.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!activeTweak) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-6 xl:px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {activeTweak.title}
                </h2>
                {!activeTweak.is_visible && !isAdmin && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                    Disabled
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowDownTrayIcon className="h-3 w-3" />
                  <AnimatedCounter value={displayDownloadCount} />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookmarkIcon className="h-3 w-3" />
                  <AnimatedCounter value={displayFavoriteCount} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-6 xl:px-8 shrink-0">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border/20 rounded-none gap-8">
              <TabTrigger value="details" icon={<InformationCircleIcon className="h-4 w-4" />}>
                Details
              </TabTrigger>
              <TabTrigger value="reports" icon={<FlagIcon className="h-4 w-4" />}>
                Reports
              </TabTrigger>
              <TabTrigger value="comments" icon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}>
                Comments
              </TabTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden min-h-0 bg-background/50">
            <TabsContent value="details" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="px-6 xl:px-8 py-6 max-w-4xl mx-auto space-y-10 pb-16">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground uppercase tracking-wider">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeTweak.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2 uppercase tracking-wider">
                      <CommandLineIcon className="h-4 w-4 text-muted-foreground" />
                      PowerShell Script
                    </h4>
                    <div className="rounded-md overflow-hidden bg-black/5 dark:bg-black/40 border border-border/20 text-xs">
                      {activeTweak.code ? (
                        <SyntaxHighlighter
                          language="powershell"
                          style={resolvedTheme === "dark" ? vscDarkPlus : vs}
                          customStyle={{
                            margin: 0,
                            padding: "1.5rem",
                            background: "transparent",
                            fontSize: "0.85rem",
                            lineHeight: "1.6",
                          }}
                          wrapLongLines={true}
                        >
                          {activeTweak.code}
                        </SyntaxHighlighter>
                      ) : (
                        <p className="text-muted-foreground italic p-4"># No code provided for this tweak.</p>
                      )}
                    </div>
                  </div>

                  {activeTweak.tweak_comment && (
                    <div className="space-y-2 mt-6">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2 uppercase tracking-wider">
                        <DocumentTextIcon className="h-4 w-4 text-primary" />
                        Author Notes
                      </h4>
                      <div className="pl-4 border-l-2 border-primary/30 py-1">
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {activeTweak.tweak_comment}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center gap-6 border-t border-border/40 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tweak ID</span>
                      <p className="text-[11px] font-mono text-muted-foreground break-all">{activeTweak.id}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Category ID</span>
                      <p className="text-[11px] font-mono text-muted-foreground break-all">{activeTweak.category_id}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="reports" className="h-full m-0">
               <ReportsView 
                 activeTweakId={activeTweak.id} 
                 userReports={userReports} 
                 allReports={allReports} 
               />
            </TabsContent>

            <TabsContent value="comments" className="h-full m-0">
              <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background/5">
                <div className="rounded-full bg-muted/30 p-4 mb-3">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <h3 className="font-medium text-foreground">Comments coming soon</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Join the discussion and share your experience with this tweak in a future update.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function ReportsView({ 
    activeTweakId, 
    userReports, 
    allReports 
}: { 
    activeTweakId: string; 
    userReports: TweakReport[]; 
    allReports: TweakReport[]; 
}) {
    const [scope, setScope] = useState<"user" | "global">("global");
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Filter reports for the active tweak
    const filteredReports = useMemo(() => {
        const base = scope === "user" ? userReports : allReports;
        return base.filter(r => r.tweak_id === activeTweakId);
    }, [scope, userReports, allReports, activeTweakId]);

    const handleDelete = async (reportId: string) => {
        if (!window.confirm("Are you sure you want to retract your report?")) return;
        
        setIsDeleting(reportId);
        try {
          const result = await deleteTweakReport(reportId);
          if (result.success) {
            queryClient.invalidateQueries({ queryKey: ["all-reports-with-descriptions"] });
            queryClient.invalidateQueries({ queryKey: ["user-reports"] });
          } else {
            alert(result.error || "Failed to delete report");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsDeleting(null);
        }
    };

    return (
        <ScrollArea className="h-full">
            <div className="px-6 xl:px-8 py-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Reports Management</h4>
                        <p className="text-xs text-muted-foreground">Community feedback for this tweak</p>
                    </div>
                    <div className="flex items-center p-1 bg-muted rounded-lg border border-border/20">
                        <Button
                            variant={scope === "global" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-3 rounded-md gap-1.5"
                            onClick={() => setScope("global")}
                        >
                            <UsersIcon className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Global</span>
                            <Badge variant="outline" className="h-4 px-1 text-[9px]">{allReports.filter(r => r.tweak_id === activeTweakId).length}</Badge>
                        </Button>
                        <Button
                            variant={scope === "user" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-3 rounded-md gap-1.5"
                            onClick={() => setScope("user")}
                            disabled={!user}
                        >
                            <UserIcon className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Mine</span>
                            <Badge variant="outline" className="h-4 px-1 text-[9px]">{userReports.filter(r => r.tweak_id === activeTweakId).length}</Badge>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3">
                    {filteredReports.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/5">
                            <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                            <h5 className="font-medium text-foreground">No reports found</h5>
                            <p className="text-xs text-muted-foreground mt-1">
                                {scope === "user" ? "You haven't reported this tweak yet." : "No community reports for this tweak."}
                            </p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className="group relative flex flex-col gap-3 p-4 rounded-xl bg-card border border-border/40 hover:border-primary/40 transition-all shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] h-4 font-bold uppercase tracking-tighter px-1.5",
                                                report.status === "resolved" ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20"
                                            )}>
                                                {report.status}
                                            </Badge>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider",
                                                report.risk_level === "high" ? "text-red-500" :
                                                report.risk_level === "medium" ? "text-amber-500" : "text-emerald-500"
                                            )}>
                                                {report.risk_level} risk
                                            </span>
                                        </div>
                                        <h5 className="text-sm font-semibold text-foreground line-clamp-1">
                                            {report.title}
                                        </h5>
                                    </div>
                                    
                                    {user?.id === report.user_id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDelete(report.id)}
                                            disabled={isDeleting === report.id}
                                        >
                                            {isDeleting === report.id ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                                <TrashIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/20 p-3 rounded-lg border border-border/10">
                                    &quot;{report.description}&quot;
                                </p>

                                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                                    <span>{report.user_id === user?.id ? "Your report" : "Community report"}</span>
                                    <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ScrollArea>
    );
}

function TabTrigger({ value, icon, children }: { value: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground"
    >
      <div className="flex items-center gap-2">
        {icon}
        {children}
      </div>
    </TabsTrigger>
  );
}
