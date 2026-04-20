import { createContext, useContext } from "react";
import type { StoredFile } from "../type/media.ts";

// ── MediaContext — DB and file data ──
interface MediaContextType {
  files: StoredFile[];
  setFiles: React.Dispatch<React.SetStateAction<StoredFile[]>>;
  saveFile: (file: StoredFile) => void;
  loadFileData: (id: string) => Promise<ArrayBuffer>;
  loadThumbnails: () => Promise<Record<string, string>>;
  saveThumbnail: (id: string, dataUrl: string) => void;
}

export const MediaContext = createContext<MediaContextType | null>(null);

export const useMedia = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used inside MediaProvider");
  return ctx;
};

// ── PlayerContext — playback state ──
interface PlayerContextType {
  currentMediaId: string | null;
  setCurrentMediaId: React.Dispatch<React.SetStateAction<string | null>>;
  currentMediaType: "audio" | "video" | null;
  setCurrentMediaType: React.Dispatch<React.SetStateAction<"audio" | "video" | null>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  recentIds: string[];
  addToRecent: (id: string) => void;
}

export const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
};