import { useRef, useEffect } from "react";
import type { StoredFile } from "../type/media.ts";

// ─── 1. parseFileName ─────────────────────────────────────────────────────────
// Duplicated in: Music.tsx, Video.tsx, PlaylistMusic.tsx, Home.tsx

//Artist and song names come from parseFileName, which splits the filename on the first dash to extract those two parts.

export function parseFileName(file: { name: string; album?: string; year?: number }) {
  const parts = file.name.split("-");
  if (parts.length < 2) return { artist: "Unknown Artist", song: file.name };

  const firstPart = parts[0]?.trim() ?? "";

  // Join everything after the first dash back into one string,
  // then remove the file extension and trim.
  const rest = parts.slice(1).join("-").replace(/\.[^/.]+$/, "").trim();

  if (/^[A-Za-z]/.test(firstPart)) {
    return { artist: firstPart, song: rest };
  }
  return { song: firstPart, artist: rest };
}

// ─── 2. sortFiles ─────────────────────────────────────────────────────────────
// Duplicated in: Music.tsx, Video.tsx, PlaylistMusic.tsx

export function sortFiles(files: StoredFile[], sortBy: string): StoredFile[] {
  const sorted = [...files];
  return sorted.sort((a, b) => {
    const { artist: artistA, song: songA } = parseFileName(a);
    const { artist: artistB, song: songB } = parseFileName(b);
    switch (sortBy) {
      case "az":     return songA.localeCompare(songB);
      case "artist": return artistA.localeCompare(artistB);
      case "album":  return (a.album ?? "").localeCompare(b.album ?? "");
      case "year":   return (b.year ?? 0) - (a.year ?? 0);
      case "date": {
        const uploadedA = a.uploadedAt ?? new Date(a.lastModified).toISOString();
        const uploadedB = b.uploadedAt ?? new Date(b.lastModified).toISOString();
        return uploadedB.localeCompare(uploadedA);
      }
      default:       return b.lastModified - a.lastModified;
    }
  });
}

// ─── 3. useUrlCache ───────────────────────────────────────────────────────────
// Duplicated in: Music.tsx, Video.tsx, PlaylistMusic.tsx

export function useUrlCache() {
  const urlCache = useRef<Record<string, string>>({});

  useEffect(() => {
    return () => {
      Object.values(urlCache.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const getUrl = (item: StoredFile): string => {
    if (!urlCache.current[item.id]) {
      const blob = new Blob([item.data], { type: item.type });
      urlCache.current[item.id] = URL.createObjectURL(blob);
    }
    return urlCache.current[item.id]!;
  };

  return getUrl;
}

// ─── 4. getGradient ───────────────────────────────────────────────────────────
// Duplicated in: Home.tsx, Playlist.tsx

export function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 60%, 25%), hsl(${h2}, 70%, 15%))`;
}

// ─── 5. loadPlaylists ─────────────────────────────────────────────────────────
// Duplicated in: Music.tsx, Playlist.tsx

export function loadPlaylists(): string[] {
  const saved = localStorage.getItem("playlists");
  return saved ? JSON.parse(saved) : [];
}

// ─── 6. formatDuration ────────────────────────────────────────────────────────
// Duplicated in: DurationCell in Music.tsx, DurationCell in PlaylistMusic.tsx

export function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "--:--";
  const mins = Math.trunc(seconds / 60);
  const secs = Math.abs(Math.floor(seconds % 60)).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

// ─── 7. createStoredFile ──────────────────────────────────────────────────────
// Duplicated in: Music.tsx (handleFileChange), Video.tsx (handleFileChange)

export function createStoredFile(
  file: File,
  data: ArrayBuffer,
  extras?: Partial<StoredFile>
): StoredFile {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    data,
    ...extras,
  };
}


