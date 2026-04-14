import { NextResponse } from "next/server";

import { buildWallpaperPowerShellScript } from "@/features/wallpapers/services/build-wallpaper-powershell-script";
import type {
  WallpaperDownloadRequest,
  WallpaperScriptItem,
} from "@/features/wallpapers/types/wallpaper.types";
import { createClient } from "@/shared/utils/supabase/server";

function normalizeWallpaperIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export async function POST(request: Request) {
  let body: WallpaperDownloadRequest;

  try {
    body = (await request.json()) as WallpaperDownloadRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const wallpaperIds = normalizeWallpaperIds(body.wallpaperIds);
  const lastSelectedId = typeof body.lastSelectedId === "string" ? body.lastSelectedId : null;

  if (wallpaperIds.length === 0) {
    return NextResponse.json(
      { error: "At least one wallpaper id is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wallpapers")
    .select("id, title, public_url, storage_path")
    .in("id", wallpaperIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const wallpapersById = new Map(
    ((data ?? []) as Array<{
      id: string;
      title: string;
      public_url: string;
      storage_path: string;
    }>).map((wallpaper) => [wallpaper.id, wallpaper])
  );
  const wallpapers = wallpaperIds
    .map((wallpaperId) => wallpapersById.get(wallpaperId))
    .filter(
      (
        wallpaper
      ): wallpaper is {
        id: string;
        title: string;
        public_url: string;
        storage_path: string;
      } => Boolean(wallpaper)
    )
    .map((wallpaper) => {
      return {
        id: wallpaper.id,
        title: wallpaper.title,
        publicUrl: wallpaper.public_url,
        storagePath: wallpaper.storage_path,
      } satisfies WallpaperScriptItem;
    });

  if (wallpapers.length === 0) {
    return NextResponse.json({ error: "No wallpapers found" }, { status: 404 });
  }

  const scriptContent = buildWallpaperPowerShellScript(wallpapers, lastSelectedId);
  const fileName = wallpapers.length === 1 ? "download-wallpaper.ps1" : "download-selected-wallpapers.ps1";

  return new Response(scriptContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
