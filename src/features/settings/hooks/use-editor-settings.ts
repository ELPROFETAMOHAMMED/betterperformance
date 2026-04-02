import { useState, useEffect, useCallback } from "react";

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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: EditorSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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

  return {
    settings,
    setEnableTextColors,
    setEncodingUtf8,
    setHideSensitive,
    setDownloadEachTweak,
    setAlwaysShowWarning,
    setAutoCreateRestorePoint,
  };
}
