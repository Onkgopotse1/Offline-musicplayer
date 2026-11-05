import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlaylistMusic from "../../features/PlaylistMusic.tsx";
import { MediaContext, PlayerContext } from "../../context/MediaContext.tsx";
import type { StoredFile } from "../../type/media.ts";

function makeAudioFile(id: string, name: string, lastModified: number): StoredFile {
  return {
    id,
    name,
    type: "audio/mpeg",
    lastModified,
    size: 1024,
    data: new Blob(),
    uploadedAt: new Date(lastModified).toISOString(),
    duration: 180,
  };
}

describe("Playlist music integration", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:playlist-test"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });

  describe("Rendering", () => {
    it("renders saved playlist songs and excludes unavailable IDs", () => {
      const files = [
        makeAudioFile("saved-song", "Artist One - Saved Song.mp3", 1_700_000_000_000),
      ];
      localStorage.setItem("playlist_songs_Favorites", JSON.stringify(["saved-song", "missing-song"]));

      render(
        <MemoryRouter initialEntries={["/playlist/Favorites"]}>
          <MediaContext.Provider value={{
            files, setFiles: vi.fn(), saveFile: vi.fn(),
            loadFileData: vi.fn().mockResolvedValue(new Blob()),
            loadThumbnails: vi.fn().mockResolvedValue({}), saveThumbnail: vi.fn(),
          }}>
            <PlayerContext.Provider value={{
              currentMediaId: null, setCurrentMediaId: vi.fn(), currentMediaType: null,
              setCurrentMediaType: vi.fn(), isPlaying: false, setIsPlaying: vi.fn(),
              videoRef: { current: null }, recentIds: [], addToRecent: vi.fn(), queue: [],
              setQueue: vi.fn(), isShuffle: false, setIsShuffle: vi.fn(), isRepeat: false,
              setIsRepeat: vi.fn(),
            }}>
              <Routes>
                <Route path="/playlist/:name" element={<PlaylistMusic />} />
              </Routes>
            </PlayerContext.Provider>
          </MediaContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText("Saved Song")).toBeInTheDocument();
      expect(screen.queryByText("missing-song")).not.toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("opens the add-songs picker", () => {
      render(
        <MemoryRouter initialEntries={["/playlist/Favorites"]}>
          <MediaContext.Provider value={{
            files: [makeAudioFile("new-song", "Artist Two - New Song.mp3", 1_800_000_000_000)],
            setFiles: vi.fn(), saveFile: vi.fn(),
            loadFileData: vi.fn().mockResolvedValue(new Blob()),
            loadThumbnails: vi.fn().mockResolvedValue({}), saveThumbnail: vi.fn(),
          }}>
            <PlayerContext.Provider value={{
              currentMediaId: null, setCurrentMediaId: vi.fn(), currentMediaType: null,
              setCurrentMediaType: vi.fn(), isPlaying: false, setIsPlaying: vi.fn(),
              videoRef: { current: null }, recentIds: [], addToRecent: vi.fn(), queue: [],
              setQueue: vi.fn(), isShuffle: false, setIsShuffle: vi.fn(), isRepeat: false,
              setIsRepeat: vi.fn(),
            }}>
              <Routes>
                <Route path="/playlist/:name" element={<PlaylistMusic />} />
              </Routes>
            </PlayerContext.Provider>
          </MediaContext.Provider>
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole("button", { name: /add songs/i }));

      expect(screen.getByRole("heading", { name: "Add Songs" })).toBeInTheDocument();
      expect(screen.getByText("New Song")).toBeInTheDocument();
    });
  });

  describe("Dataflow", () => {
    it("loads saved songs, adds an available song, and starts playback", () => {
    const files = [
      makeAudioFile("saved-song", "Artist One - Saved Song.mp3", 1_700_000_000_000),
      makeAudioFile("new-song", "Artist Two - New Song.mp3", 1_800_000_000_000),
      { ...makeAudioFile("video", "Clip.mp4", 1_900_000_000_000), type: "video/mp4" },
    ];
    localStorage.setItem("playlist_songs_Favorites", JSON.stringify(["saved-song"]));

    const setCurrentMediaId = vi.fn();
    const setCurrentMediaType = vi.fn();
    const setIsPlaying = vi.fn();
    const addToRecent = vi.fn();
    const setQueue = vi.fn();

    render(
      <MemoryRouter initialEntries={["/playlist/Favorites"]}>
        <MediaContext.Provider value={{
          files,
          setFiles: vi.fn(),
          saveFile: vi.fn(),
          loadFileData: vi.fn().mockResolvedValue(new Blob()),
          loadThumbnails: vi.fn().mockResolvedValue({}),
          saveThumbnail: vi.fn(),
        }}>
          <PlayerContext.Provider value={{
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
            setIsShuffle: vi.fn(),
            isRepeat: false,
            setIsRepeat: vi.fn(),
          }}>
            <Routes>
              <Route path="/playlist/:name" element={<PlaylistMusic />} />
            </Routes>
          </PlayerContext.Provider>
        </MediaContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Saved Song")).toBeInTheDocument();
    expect(screen.queryByText("New Song")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add songs/i }));
    expect(screen.getByText("New Song")).toBeInTheDocument();
    expect(screen.queryByText("Clip.mp4")).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    fireEvent.click(screen.getByRole("button", { name: "Add Songs (1)" }));

    expect(JSON.parse(localStorage.getItem("playlist_songs_Favorites") ?? "[]")).toEqual([
      "saved-song",
      "new-song",
    ]);
    expect(screen.getByText("New Song")).toBeInTheDocument();

    fireEvent.click(screen.getByText("New Song").closest(".horizontal-divs")!.querySelector(".play-buttons")!);

    expect(setQueue).toHaveBeenCalledWith(["new-song", "saved-song"]);
    expect(setCurrentMediaId).toHaveBeenCalledWith("new-song");
    expect(setCurrentMediaType).toHaveBeenCalledWith("audio");
    expect(setIsPlaying).toHaveBeenCalledWith(true);
      expect(addToRecent).toHaveBeenCalledWith("new-song");
    });
  });
});