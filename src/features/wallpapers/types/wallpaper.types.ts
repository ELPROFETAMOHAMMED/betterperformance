export type Wallpaper = {
  id: string;
  title: string;
  storage_path: string;
  public_url: string;
  width: number;
  height: number;
  file_size_bytes: number | null;
  resolution: string;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type WallpapersPageData = {
  items: Wallpaper[];
  page: number;
  pageSize: number;
  total: number;
};

export type GetWallpapersInput = {
  page?: number;
  pageSize?: number;
};

export type CreateWallpaperInput = {
  title: string;
  storagePath: string;
  publicUrl: string;
  width: number;
  height: number;
  fileSizeBytes: number | null;
  tags: string[];
  createdBy: string;
};

export type UploadWallpaperInput = {
  file: File;
  userId: string;
};

export type WallpaperUploadResult = {
  publicUrl: string;
  storagePath: string;
};

export type WallpaperScriptItem = {
  id: string;
  title: string;
  publicUrl: string;
  storagePath: string;
};

export type WallpaperDownloadRequest = {
  wallpaperIds: string[];
  lastSelectedId: string | null;
};
