import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MediaContext, PlayerContext, useMedia, usePlayer } from "../../../context/MediaContext.tsx";
import type { StoredFile } from "../../../type/media.ts";

describe("useMedia", () => {
  it("returns the context value when inside MediaContext.Provider", () => {
    const mediaValue = {
      files: [] as StoredFile[],
      setFiles: vi.fn(),
      saveFile: vi.fn(),
      loadFileData: vi.fn(),
      loadThumbnails: vi.fn(),
      saveThumbnail: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MediaContext.Provider value={mediaValue}>
        {children}
      </MediaContext.Provider>
    );

    const { result } = renderHook(() => useMedia(), { wrapper });

    expect(result.current).toBe(mediaValue);
  });

  it("throws an error when used outside MediaContext.Provider", () => {
    expect(() => renderHook(() => useMedia())).toThrow(
      "useMedia must be used inside MediaProvider"
    );
  });
});

describe("usePlayer", () => {
  it("returns the context value when inside PlayerContext.Provider", () => {
    const playerValue = {
      currentMediaId: null,
      setCurrentMediaId: vi.fn(),
      currentMediaType: null,
      setCurrentMediaType: vi.fn(),
      isPlaying: false,
      setIsPlaying: vi.fn(),
      videoRef: { current: null },
      recentIds: [],
      addToRecent: vi.fn(),
      queue: [],
      setQueue: vi.fn(),
      isShuffle: false,
      setIsShuffle: vi.fn(),
      isRepeat: false,
      setIsRepeat: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <PlayerContext.Provider value={playerValue}>
        {children}
      </PlayerContext.Provider>
    );

    const { result } = renderHook(() => usePlayer(), { wrapper });

    expect(result.current).toBe(playerValue);
  });

  it("throws an error when used outside PlayerContext.Provider", () => {
    expect(() => renderHook(() => usePlayer())).toThrow(
      "usePlayer must be used inside PlayerProvider"
    );
  });
});