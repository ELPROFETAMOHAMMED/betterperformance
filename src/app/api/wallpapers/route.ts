import { NextResponse } from "next/server";

import { requireAdmin } from "@/shared/auth/require-admin";
import { createClient } from "@/shared/utils/supabase/server";
import { createWallpaper } from "@/features/wallpapers/services/create-wallpaper";
import { getWallpapers } from "@/features/wallpapers/services/get-wallpapers";
import { uploadWallpaper } from "@/features/wallpapers/services/upload-wallpaper";

const MAX_WALLPAPER_SIZE_BYTES = 25 * 1024 * 1024;

function parsePositiveInteger(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Number.parseInt(searchParams.get("limit") || "50", 10);
    const result = await getWallpapers({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 50,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch wallpapers",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminCheck = await requireAdmin(supabase);

    if (adminCheck.response) {
      return adminCheck.response;
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const width = parsePositiveInteger(formData.get("width"));
    const height = parsePositiveInteger(formData.get("height"));
    const fileSizeBytes = parsePositiveInteger(formData.get("file_size_bytes"));
    const tags = parseTags(formData.get("tags"));
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Wallpaper file is required" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!fileEntry.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (fileEntry.size > MAX_WALLPAPER_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Wallpaper file size must be 25MB or less" },
        { status: 400 }
      );
    }

    if (!width || !height) {
      return NextResponse.json(
        { error: "Wallpaper dimensions are required" },
        { status: 400 }
      );
    }

    const uploadResult = await uploadWallpaper(supabase, {
      file: fileEntry,
      userId: adminCheck.user.id,
    });

    const wallpaper = await createWallpaper(supabase, {
      title,
      storagePath: uploadResult.storagePath,
      publicUrl: uploadResult.publicUrl,
      width,
      height,
      fileSizeBytes: fileSizeBytes ?? fileEntry.size,
      tags,
      createdBy: adminCheck.user.id,
    });

    return NextResponse.json({ success: true, wallpaper }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create wallpaper",
      },
      { status: 500 }
    );
  }
}
