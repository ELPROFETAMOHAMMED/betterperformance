"use client";

import { useEditorSettings } from "@/hooks/useEditorSettings";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { ScrollArea } from "@/components/ui/scroll-area";

export default function SettingsPage() {
  const {
    settings,
    setShowLineNumbers,
    setEnableTextColors,
    setEncodingUtf8,
    setHideSensitive,
    setDownloadEachTweak,
    setAlwaysShowWarning,
    setWrapCode,
    setShowComments,
  } = useEditorSettings();

  return (
    <ScrollArea className="h-full w-full">
      <main className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center px-4 py-8">
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[1.4fr_minmax(0,1fr)]">
        <section className="space-y-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Editor & theme settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Fine-tune how tweak scripts are displayed and exported. Changes
              are stored locally on this device.
            </p>
          </div>

          <Card className="space-y-3 border-border/60 bg-card/80 p-5">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Toggle between system, light and dark modes. System is used by
                default.
              </p>
            </div>
            <ThemeToggle />
          </Card>

          <Card className="space-y-4 border-border/60 bg-card/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Show line numbers</p>
                <p className="text-xs text-muted-foreground">
                  Display a compact gutter with line numbers in the script
                  preview.
                </p>
              </div>
              <Switch
                checked={settings.showLineNumbers}
                onCheckedChange={setShowLineNumbers}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Enable syntax colors</p>
                <p className="text-xs text-muted-foreground">
                  Use semantic colors for PowerShell keywords, strings and
                  comments.
                </p>
              </div>
              <Switch
                checked={settings.enableTextColors}
                onCheckedChange={setEnableTextColors}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Show tweak comments</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, each tweak&apos;s description and metadata will
                  be added as commented lines above its code block.
                </p>
              </div>
              <Switch
                checked={settings.showComments}
                onCheckedChange={setShowComments}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Enable word wrap</p>
                <p className="text-xs text-muted-foreground">
                  Wrap long lines in the code editor instead of requiring
                  horizontal scrolling.
                </p>
              </div>
              <Switch
                checked={settings.wrapCode}
                onCheckedChange={setWrapCode}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Hide sensitive values</p>
                <p className="text-xs text-muted-foreground">
                  Obfuscate values that may contain personal or system-specific
                  information.
                </p>
              </div>
              <Switch
                checked={settings.hideSensitive}
                onCheckedChange={setHideSensitive}
              />
            </div>
          </Card>

          <Card className="space-y-4 border-border/60 bg-card/80 p-5">
            <h2 className="text-sm font-semibold tracking-tight">
              Download behaviour
            </h2>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Use UTF-8 encoding</p>
                <p className="text-xs text-muted-foreground">
                  Save scripts using UTF-8 instead of UTF-16 for better
                  compatibility.
                </p>
              </div>
              <Switch
                checked={settings.encodingUtf8}
                onCheckedChange={setEncodingUtf8}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  Download each tweak separately
                </p>
                <p className="text-xs text-muted-foreground">
                  Export one file per tweak instead of a single combined
                  PowerShell script.
                </p>
              </div>
              <Switch
                checked={settings.downloadEachTweak}
                onCheckedChange={setDownloadEachTweak}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  Always show warning message
                </p>
                <p className="text-xs text-muted-foreground">
                  Before downloading, remind users to review and understand each
                  tweak.
                </p>
              </div>
              <Switch
                checked={settings.alwaysShowWarning}
                onCheckedChange={setAlwaysShowWarning}
              />
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="space-y-3 border-border/60 bg-card/80 p-5 text-sm">
            <h2 className="text-sm font-semibold tracking-tight">
              How settings are applied
            </h2>
            <p className="text-xs text-muted-foreground">
              These options shape how BetterPerformance builds and downloads
              your tweak scripts. They apply across the Tweaks page, history
              replays and future tooling.
            </p>
            <p className="text-xs text-muted-foreground">
              Settings are saved in your browser using local storage, so they do
              not sync across devices yet.
            </p>
          </Card>
        </aside>
        </div>
      </main>
    </ScrollArea>
  );
}


