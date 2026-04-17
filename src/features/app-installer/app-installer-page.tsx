"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, Copy, Download, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { generateChocoScript } from "@/features/app-installer/generate-installer-script/generate-choco-script";
import { generateInstallerScript } from "@/features/app-installer/generate-installer-script/generate-installer-script";
import { SearchPackagesInput } from "@/features/app-installer/search-packages/search-packages-input";
import { SearchPackagesResults } from "@/features/app-installer/search-packages/search-packages-results";
import { useSearchChocoPackages } from "@/features/app-installer/search-packages/use-search-choco-packages";
import { useSearchPackages } from "@/features/app-installer/search-packages/use-search-packages";
import type { ChocoPackage } from "@/features/app-installer/types/choco-package";
import type { WingetPackage } from "@/features/app-installer/types/winget-package";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/shared/components/ui/empty";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

type SourceTab = "winget" | "choco";

type SelectedPackageDetails = {
  id: string;
  name: string;
  publisher: string;
  description: string;
  iconUrl: string | null;
};

export default function AppInstallerPage() {
  const [sourceTab, setSourceTab] = useState<SourceTab>("winget");
  const [query, setQuery] = useState("");
  const [selectedWingetPackages, setSelectedWingetPackages] = useState<WingetPackage[]>([]);
  const [selectedChocoPackages, setSelectedChocoPackages] = useState<ChocoPackage[]>([]);
  const [hasCopied, setHasCopied] = useState(false);

  const { packages: wingetPackages, isLoading: isWingetLoading, error: wingetError } = useSearchPackages(
    sourceTab === "winget" ? query : ""
  );
  const { packages: chocoPackages, isLoading: isChocoLoading, error: chocoError } = useSearchChocoPackages(
    sourceTab === "choco" ? query : ""
  );

  const selectedWingetIds = useMemo(
    () => selectedWingetPackages.map((pkg) => pkg.Id),
    [selectedWingetPackages]
  );

  const selectedChocoIds = useMemo(
    () => selectedChocoPackages.map((pkg) => pkg.id),
    [selectedChocoPackages]
  );

  const selectedCount = sourceTab === "winget" ? selectedWingetPackages.length : selectedChocoPackages.length;

  const details = useMemo<SelectedPackageDetails | null>(() => {
    if (sourceTab === "winget") {
      const lastSelected = selectedWingetPackages[selectedWingetPackages.length - 1];
      if (!lastSelected) {
        return null;
      }

      return {
        id: lastSelected.Id,
        name: lastSelected.Latest.Name,
        publisher: lastSelected.Latest.Publisher,
        description: lastSelected.Latest.Description || "No description available.",
        iconUrl: lastSelected.IconUrl,
      };
    }

    const lastSelected = selectedChocoPackages[selectedChocoPackages.length - 1];
    if (!lastSelected) {
      return null;
    }

    return {
      id: lastSelected.id,
      name: lastSelected.title,
      publisher: lastSelected.publisher,
      description: lastSelected.description || "No description available.",
      iconUrl: null,
    };
  }, [sourceTab, selectedWingetPackages, selectedChocoPackages]);

  const generatedScript = useMemo(() => {
    if (sourceTab === "winget") {
      return generateInstallerScript(selectedWingetPackages.map((pkg) => pkg.Id));
    }

    return generateChocoScript(selectedChocoPackages.map((pkg) => pkg.id));
  }, [sourceTab, selectedWingetPackages, selectedChocoPackages]);

  const toggleWingetPackage = (id: string) => {
    setSelectedWingetPackages((previous) => {
      const isSelected = previous.some((pkg) => pkg.Id === id);
      if (isSelected) {
        return previous.filter((pkg) => pkg.Id !== id);
      }
      const pkg = wingetPackages.find((item) => item.Id === id);
      return pkg ? [...previous, pkg] : previous;
    });
  };

  const toggleChocoPackage = (id: string) => {
    setSelectedChocoPackages((previous) => {
      const isSelected = previous.some((pkg) => pkg.id === id);
      if (isSelected) {
        return previous.filter((pkg) => pkg.id !== id);
      }
      const pkg = chocoPackages.find((item) => item.id === id);
      return pkg ? [...previous, pkg] : previous;
    });
  };

  const clearCurrentSelection = () => {
    if (sourceTab === "winget") {
      setSelectedWingetPackages([]);
    } else {
      setSelectedChocoPackages([]);
    }
    toast.success("Selection cleared");
  };

  const copyScript = () => {
    if (!generatedScript) {
      toast.error("Select at least one package first");
      return;
    }

    navigator.clipboard.writeText(generatedScript);
    setHasCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const downloadScript = () => {
    if (!generatedScript) {
      toast.error("Select at least one package first");
      return;
    }

    const scriptContent = `function Invoke-BatchAppInstaller {
    [CmdletBinding()]
    param ()

    try {
${generatedScript
  .split("\n")
  .map((line) => `        ${line}`)
  .join("\n")}
    } catch {
        throw
    }
}

Invoke-BatchAppInstaller
`;

    const blob = new Blob([scriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = sourceTab === "winget" ? "install-winget-apps.ps1" : "install-choco-apps.ps1";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Script downloaded");
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-4 py-6 md:px-6">
      <Tabs
        value={sourceTab}
        onValueChange={(value) => {
          setSourceTab(value as SourceTab);
          setQuery("");
          setHasCopied(false);
        }}
        className="flex h-full flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">App Installer</h1>
            <p className="text-sm text-muted-foreground">
              Search packages, select what you need, and export an installation script.
            </p>
          </div>
          <TabsList className="grid h-9 w-52 grid-cols-2 rounded-[var(--radius-md)]">
            <TabsTrigger value="winget" className="h-8 rounded-[var(--radius-md)]">
              Winget
            </TabsTrigger>
            <TabsTrigger value="choco" className="h-8 rounded-[var(--radius-md)]">
              Chocolatey
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex min-h-0 h-full flex-col rounded-[var(--radius-md)] border border-border/20 bg-background/50 backdrop-blur-xl lg:col-span-8">
            <div className="border-b border-border/20 p-3">
              <SearchPackagesInput value={query} onChange={setQuery} />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {sourceTab === "winget"
                    ? isWingetLoading
                      ? "Searching Winget index..."
                      : wingetError || "Winget index ready"
                    : isChocoLoading
                      ? "Searching Chocolatey index..."
                      : chocoError || "Chocolatey index ready"}
                </p>
                {selectedCount > 0 ? (
                  <Button variant="ghost" size="sm" className="h-8" onClick={clearCurrentSelection}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="p-3">
                {sourceTab === "winget" ? (
                  <SearchPackagesResults
                    packages={wingetPackages}
                    isLoading={isWingetLoading}
                    selectedIds={selectedWingetIds}
                    onToggle={toggleWingetPackage}
                    query={query}
                  />
                ) : query.trim().length < 2 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    Type at least 2 characters to search Chocolatey packages.
                  </div>
                ) : isChocoLoading ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">Searching Chocolatey packages...</div>
                ) : chocoPackages.length === 0 ? (
                  <Empty className="border-none bg-transparent shadow-none">
                    <EmptyTitle>No packages found</EmptyTitle>
                    <EmptyDescription>
                      No Chocolatey package matches &quot;{query}&quot;.
                    </EmptyDescription>
                  </Empty>
                ) : (
                  <div className="space-y-2">
                    {chocoPackages.map((pkg) => {
                      const isSelected = selectedChocoIds.includes(pkg.id);

                      return (
                        <Card
                          key={pkg.id}
                          onClick={() => toggleChocoPackage(pkg.id)}
                          className={`cursor-pointer rounded-[var(--radius-md)] border border-border/20 bg-card/80 p-3 transition-colors hover:bg-secondary/40 ${
                            isSelected ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-border/30 bg-background/50 text-sm font-semibold text-primary">
                              {pkg.title.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">{pkg.title}</p>
                              <p className="truncate text-xs text-muted-foreground">{pkg.publisher}</p>
                              <div className="mt-1 inline-flex max-w-full rounded-[var(--radius-md)] border border-border/30 bg-background/60 px-2 py-0.5">
                                <span className="truncate font-mono text-xs text-muted-foreground">{pkg.id}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="min-h-0 rounded-[var(--radius-md)] border border-border/20 bg-background/50 backdrop-blur-xl lg:col-span-4">
            <div className="h-full p-4">
              <AnimatePresence mode="wait">
                {details ? (
                  <motion.div
                    key={details.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex h-full flex-col gap-4"
                  >
                    <div className="rounded-[var(--radius-md)] border border-border/20 bg-card/80 p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border/30 bg-background/50">
                          {details.iconUrl ? (
                            <Image
                              src={details.iconUrl}
                              alt={details.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-lg font-semibold text-primary">
                              {details.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-base font-semibold text-foreground">{details.name}</h2>
                          <p className="truncate text-xs text-muted-foreground">{details.publisher}</p>
                          <div className="mt-2 inline-flex max-w-full rounded-[var(--radius-md)] border border-border/30 bg-background/60 px-2 py-0.5">
                            <span className="truncate font-mono text-xs text-muted-foreground">{details.id}</span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{details.description}</p>
                    </div>

                    <div className="min-h-0 rounded-[var(--radius-md)] border border-border/20 bg-card/80 p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Script preview
                      </p>
                      <pre className="max-h-60 overflow-auto rounded-[var(--radius-md)] border border-border/20 bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
                        {generatedScript || "# Select one or more packages to build the script"}
                      </pre>
                    </div>

                    <div className="mt-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button className="h-9" onClick={downloadScript} disabled={!generatedScript}>
                        <Download className="mr-2 h-4 w-4" />
                        Download .ps1
                      </Button>
                      <Button variant="outline" className="h-9" onClick={copyScript} disabled={!generatedScript}>
                        {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {hasCopied ? "Copied" : "Copy script"}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-dashed border-border/40 bg-card/60 p-6 text-center"
                  >
                    <Image
                      src="/assets/Aplication-logo.png"
                      alt="BetterPerformance logo"
                      width={56}
                      height={56}
                      className="rounded-[var(--radius-md)]"
                    />
                    <h3 className="text-sm font-medium text-foreground">No package selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a package from the left to preview details and script output.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
