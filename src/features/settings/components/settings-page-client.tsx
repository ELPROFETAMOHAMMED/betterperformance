"use client";

import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import { SettingCard } from "@/features/settings/components/setting-card";
import { SettingSwitch } from "@/features/settings/components/setting-switch";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SETTINGS_GROUPS } from "@/features/settings/config/settings-config";
import type { EditorSettings } from "@/features/settings/hooks/use-editor-settings";

export default function SettingsPageClient() {
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
    setEnableCodeEditing,
    setAutoCreateRestorePoint,
  } = useEditorSettings();

  // Map setting IDs to their setter functions
  const setters: Record<keyof EditorSettings, (value: boolean) => void> = {
    showLineNumbers: setShowLineNumbers,
    enableTextColors: setEnableTextColors,
    encodingUtf8: setEncodingUtf8,
    hideSensitive: setHideSensitive,
    downloadEachTweak: setDownloadEachTweak,
    alwaysShowWarning: setAlwaysShowWarning,
    wrapCode: setWrapCode,
    showComments: setShowComments,
    enableCodeEditing: setEnableCodeEditing,
    autoCreateRestorePoint: setAutoCreateRestorePoint,
  };

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

            {SETTINGS_GROUPS.map((group) => {
              if (group.type === "theme") {
                return <div key={group.id}>{group.customContent}</div>;
              }

              if (group.type === "card" && group.items) {
                return (
                  <SettingCard
                    key={group.id}
                    title={group.title}
                    description={group.description}
                  >
                    <div className="space-y-4">
                      {group.items.map((item) => {
                        if (item.type === "switch") {
                          // If enableCodeEditing is enabled, showLineNumbers must be enabled
                          const isDisabled = item.id === "showLineNumbers" && settings.enableCodeEditing;
                          const checked = item.id === "showLineNumbers" && settings.enableCodeEditing 
                            ? true 
                            : (settings[item.id] as boolean);
                          
                          return (
                            <SettingSwitch
                              key={item.id}
                              title={item.title}
                              description={item.description}
                              checked={checked}
                              onCheckedChange={setters[item.id]}
                              experimental={item.experimental}
                              warning={item.warning}
                              disabled={isDisabled || item.disabled}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </SettingCard>
                );
              }

              return null;
            })}
          </section>

          <aside className="space-y-4">
            <SettingCard>
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
            </SettingCard>
          </aside>
        </div>
      </main>
    </ScrollArea>
  );
}




