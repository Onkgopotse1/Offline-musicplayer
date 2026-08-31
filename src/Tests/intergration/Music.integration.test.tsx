import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Music from "../../features/Music.tsx";
import { MediaContext, PlayerContext } from "../../context/MediaContext.tsx";
import type { StoredFile } from "../../type/media.ts";

function makeAudioFile(
  id: string,
  name: string,
  lastModified: number,
  duration = 180
): StoredFile {
  return {
    id,
    name,
    type: "audio/mpeg",
    lastModified,
    size: 1024,
    data: new ArrayBuffer(8),
    uploadedAt: new Date(lastModified).toISOString(),
    duration,
  };
}

describe("Music integration", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:mock-url"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: vi.fn(),
    });
  });

  it("renders the uploaded audio tracks from the media context", () => {
    const files = [
      makeAudioFile("song-1", "Artist One - Song One.mp3", 1_700_000_000_000, 180),
      makeAudioFile("song-2", "Artist Two - Song Two.mp3", 1_800_000_000_000, 240),
    ];

    render(
      <MediaContext.Provider
        value={{
          files,
          setFiles: vi.fn(),
          saveFile: vi.fn(),
          loadFileData: vi.fn(),
          loadThumbnails: vi.fn(),
          saveThumbnail: vi.fn(),
        }}
      >
        <PlayerContext.Provider
          value={{
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
          }}
        >
          <Music />
        </PlayerContext.Provider>
      </MediaContext.Provider>
    );

    expect(screen.getByText("Song One")).toBeInTheDocument();
    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.getByText("Song Two")).toBeInTheDocument();
  });

  it("shuffles and starts playback for the audio queue", () => {
    const files = [
      makeAudioFile("song-1", "Artist One - Song One.mp3", 1_700_000_000_000, 180),
      makeAudioFile("song-2", "Artist Two - Song Two.mp3", 1_800_000_000_000, 240),
    ];

    const setCurrentMediaId = vi.fn();
    const setCurrentMediaType = vi.fn();
    const setIsPlaying = vi.fn();
    const addToRecent = vi.fn();
    const setQueue = vi.fn();
    const setIsShuffle = vi.fn();

    vi.spyOn(Math, "random").mockReturnValue(0);

    render(
      <MediaContext.Provider
        value={{
          files,
          setFiles: vi.fn(),
          saveFile: vi.fn(),
          loadFileData: vi.fn(),
          loadThumbnails: vi.fn(),
          saveThumbnail: vi.fn(),
        }}
      >
        <PlayerContext.Provider
          value={{
            currentMediaId: null,
            setCurrentMediaId,
            currentMediaType: null,
            setCurrentMediaType,
            isPlaying: false,
            setIsPlaying,
            videoRef: { current: null },
            recentIds: [],
            addToRecent,
            queue: [],
            setQueue,
            isShuffle: false,
            setIsShuffle,
            isRepeat: false,
            setIsRepeat: vi.fn(),
          }}
        >
          <Music />
        </PlayerContext.Provider>
      </MediaContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /shuffle and play/i }));

    expect(setQueue).toHaveBeenCalledWith(["song-2", "song-1"]);
    expect(setIsShuffle).toHaveBeenCalledWith(true);
    expect(setCurrentMediaId).toHaveBeenCalledWith("song-2");
    expect(setCurrentMediaType).toHaveBeenCalledWith("audio");
    expect(setIsPlaying).toHaveBeenCalledWith(true);
    expect(addToRecent).toHaveBeenCalledWith("song-2");
  });
});
