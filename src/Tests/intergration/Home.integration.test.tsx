import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../../pages/Home.tsx";
import { MediaContext, PlayerContext } from "../../context/MediaContext.tsx";
import type { StoredFile } from "../../type/media.ts";

function makeAudioFile(id: string, name: string): StoredFile {
  return {
    id,
    name,
    type: "audio/mpeg",
    lastModified: 1_700_000_000_000,
    uploadedAt: "2023-11-14T22:13:20.000Z",
    size: 1024,
    data: new Blob(),
    duration: 180,
  };
}

describe("Home integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows an empty state when there are no recent items", () => {
    render(
      <MediaContext.Provider value={{
        files: [], setFiles: vi.fn(), saveFile: vi.fn(), loadFileData: vi.fn(),
        loadThumbnails: vi.fn(), saveThumbnail: vi.fn(),
      }}>
        <PlayerContext.Provider value={{
          currentMediaId: null, setCurrentMediaId: vi.fn(), currentMediaType: null,
          setCurrentMediaType: vi.fn(), isPlaying: false, setIsPlaying: vi.fn(),
          videoRef: { current: null }, recentIds: [], addToRecent: vi.fn(), queue: [],
          setQueue: vi.fn(), isShuffle: false, setIsShuffle: vi.fn(), isRepeat: false,
          setIsRepeat: vi.fn(),
        }}>
          <Home />
        </PlayerContext.Provider>
      </MediaContext.Provider>
    );

    expect(screen.getByText("No recently played songs yet")).toBeInTheDocument();
  });

  it("shows available recent songs and plays the selected item", () => {
    const files = [makeAudioFile("recent-song", "Artist One - Song One.mp3")];
    const setCurrentMediaId = vi.fn();
    const setCurrentMediaType = vi.fn();
    const setIsPlaying = vi.fn();

    render(
      <MediaContext.Provider value={{
        files, setFiles: vi.fn(), saveFile: vi.fn(), loadFileData: vi.fn(),
        loadThumbnails: vi.fn(), saveThumbnail: vi.fn(),
      }}>
        <PlayerContext.Provider value={{
          currentMediaId: null, setCurrentMediaId, currentMediaType: null,
          setCurrentMediaType, isPlaying: false, setIsPlaying, videoRef: { current: null },
          recentIds: ["missing-song", "recent-song"], addToRecent: vi.fn(), queue: [],
          setQueue: vi.fn(), isShuffle: false, setIsShuffle: vi.fn(), isRepeat: false,
          setIsRepeat: vi.fn(),
        }}>
          <Home />
        </PlayerContext.Provider>
      </MediaContext.Provider>
    );

    expect(screen.getByText("Song One")).toBeInTheDocument();
    expect(screen.getByText("Artist One")).toBeInTheDocument();
    expect(screen.queryByText("No recently played songs yet")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(setCurrentMediaId).toHaveBeenCalledWith("recent-song");
    expect(setCurrentMediaType).toHaveBeenCalledWith("audio");
    expect(setIsPlaying).toHaveBeenCalledWith(true);
  });
});