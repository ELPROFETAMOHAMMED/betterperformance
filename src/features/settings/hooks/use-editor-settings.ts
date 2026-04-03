"use client";

import {
  createElement,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";

export type EditorSettings = {
  enableTextColors: boolean;
  encodingUtf8: boolean;
  hideSensitive: boolean;
  downloadEachTweak: boolean;
  alwaysShowWarning: boolean;
  autoCreateRestorePoint: boolean;
};

const STORAGE_KEY = "editorSettings";
const DEFAULT_SETTINGS: EditorSettings = {
  enableTextColors: true,
  encodingUtf8: true,
  hideSensitive: false,
  downloadEachTweak: false,
  alwaysShowWarning: true,
  autoCreateRestorePoint: true,
};

function loadSettings(): EditorSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: EditorSettings) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

type EditorSettingsContextValue = {
  settings: EditorSettings;
  setEnableTextColors: (value: boolean) => void;
  setEncodingUtf8: (value: boolean) => void;
  setHideSensitive: (value: boolean) => void;
  setDownloadEachTweak: (value: boolean) => void;
  setAlwaysShowWarning: (value: boolean) => void;
  setAutoCreateRestorePoint: (value: boolean) => void;
};

const EditorSettingsContext = createContext<EditorSettingsContextValue | undefined>(
  undefined
);

export function EditorSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<EditorSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const nextSettings = {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(event.newValue),
        } as EditorSettings;

        setSettings(nextSettings);
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setEnableTextColors = useCallback((v: boolean) => {
    setSettings((prev) => ({ ...prev, enableTextColors: v }));
  }, []);

  const setEncodingUtf8 = useCallback((v: boolean) => {
    setSettings((prev) => ({ ...prev, encodingUtf8: v }));
  }, []);

  const setHideSensitive = useCallback((v: boolean) => {
    setSettings((prev) => ({ ...prev, hideSensitive: v }));
  }, []);

  const setDownloadEachTweak = useCallback((v: boolean) => {
    setSettings((prev) => ({ ...prev, downloadEachTweak: v }));
  }, []);

  const setAlwaysShowWarning = useCallback((v: boolean) => {
    setSettings((prev) => ({ ...prev, alwaysShowWarning: v }));
  }, []);

  const setAutoCreateRestorePoint = useCallback((v: boolean) => {
    setSettings((prev) => ({ ...prev, autoCreateRestorePoint: v }));
  }, []);

  const value = useMemo<EditorSettingsContextValue>(
    () => ({
      settings,
      setEnableTextColors,
      setEncodingUtf8,
      setHideSensitive,
      setDownloadEachTweak,
      setAlwaysShowWarning,
      setAutoCreateRestorePoint,
    }),
    [
      settings,
      setEnableTextColors,
      setEncodingUtf8,
      setHideSensitive,
      setDownloadEachTweak,
      setAlwaysShowWarning,
      setAutoCreateRestorePoint,
    ]
  );

  return createElement(EditorSettingsContext.Provider, { value }, children);
}

export function useEditorSettings() {
  const context = useContext(EditorSettingsContext);

  if (!context) {
    throw new Error(
      "useEditorSettings must be used within an EditorSettingsProvider"
    );
  }

  return context;
}
