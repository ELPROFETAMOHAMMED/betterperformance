import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export type EditorSettings = {
  showLineNumbers: boolean;
  enableTextColors: boolean;
  encodingUtf8: boolean;
  hideSensitive: boolean;
  downloadEachTweak: boolean;
  alwaysShowWarning: boolean;
  wrapCode: boolean;
  showComments: boolean;
};

const STORAGE_KEY = "editorSettings";
const DEFAULT_SETTINGS: EditorSettings = {
  showLineNumbers: true,
  enableTextColors: true,
  encodingUtf8: true,
  hideSensitive: false,
  downloadEachTweak: false,
  alwaysShowWarning: false,
  wrapCode: true,
  showComments: false,
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
  const queryClient = useQueryClient();
  const { data: settings = DEFAULT_SETTINGS } = useQuery<EditorSettings>({
    queryKey: [STORAGE_KEY],
    queryFn: () => loadSettings(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: Partial<EditorSettings>) => {
      const merged = { ...settings, ...newSettings };
      saveSettings(merged);
      return Promise.resolve(merged);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([STORAGE_KEY], data);
    },
  });

  // Helper setters for each field
  const setShowLineNumbers = useCallback(
    (v: boolean) => mutation.mutate({ showLineNumbers: v }),
    [mutation]
  );
  const setEnableTextColors = useCallback(
    (v: boolean) => mutation.mutate({ enableTextColors: v }),
    [mutation]
  );
  const setEncodingUtf8 = useCallback(
    (v: boolean) => mutation.mutate({ encodingUtf8: v }),
    [mutation]
  );
  const setHideSensitive = useCallback(
    (v: boolean) => mutation.mutate({ hideSensitive: v }),
    [mutation]
  );
  const setDownloadEachTweak = useCallback(
    (v: boolean) => mutation.mutate({ downloadEachTweak: v }),
    [mutation]
  );
  const setAlwaysShowWarning = useCallback(
    (v: boolean) => mutation.mutate({ alwaysShowWarning: v }),
    [mutation]
  );
  const setWrapCode = useCallback(
    (v: boolean) => mutation.mutate({ wrapCode: v }),
    [mutation]
  );
  const setShowComments = useCallback(
    (v: boolean) => mutation.mutate({ showComments: v }),
    [mutation]
  );

  return {
    settings,
    setShowLineNumbers,
    setEnableTextColors,
    setEncodingUtf8,
    setHideSensitive,
    setDownloadEachTweak,
    setAlwaysShowWarning,
    setWrapCode,
    setShowComments,
  };
}



