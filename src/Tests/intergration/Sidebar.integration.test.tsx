import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

vi.mock("@fortawesome/free-solid-svg-icons", () => ({
  faArrowLeft: {},
  faCirclePlay: {},
  faHouse: {},
  faMusic: {},
  faVideo: {},
  faList: {},
  faCompactDisc: {},
  faGear: {},
  faMagnifyingGlass: {},
}));

import Sidebar from "../../components/Layout/Sidebar.tsx";
import { MediaContext, PlayerContext } from "../../context/MediaContext.tsx";
import type { StoredFile } from "../../type/media.ts";
import type { Dispatch, SetStateAction } from "react";

function CurrentPath() {
  return <p>{useLocation().pathname}</p>;
}

function renderSidebar(files: StoredFile[], overrides: {
  setCurrentMediaId?: Dispatch<SetStateAction<string | null>>;
  setCurrentMediaType?: Dispatch<SetStateAction<"audio" | "video" | null>>;
  setIsPlaying?: Dispatch<SetStateAction<boolean>>;
  setQueue?: Dispatch<SetStateAction<string[]>>;
  addToRecent?: (id: string) => void;
  onAudioSearchSelection?: () => void;
} = {}) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <MediaContext.Provider value={{
        files, setFiles: vi.fn(), saveFile: vi.fn(), loadFileData: vi.fn(),
        loadThumbnails: vi.fn(), saveThumbnail: vi.fn(),
      }}>
        <PlayerContext.Provider value={{
          currentMediaId: null,
          setCurrentMediaId: overrides.setCurrentMediaId ?? vi.fn<Dispatch<SetStateAction<string | null>>>(),
          currentMediaType: null,
          setCurrentMediaType: overrides.setCurrentMediaType ?? vi.fn<Dispatch<SetStateAction<"audio" | "video" | null>>>(),
          isPlaying: false,
          setIsPlaying: overrides.setIsPlaying ?? vi.fn<Dispatch<SetStateAction<boolean>>>(),
          videoRef: { current: null }, recentIds: [],
          addToRecent: overrides.addToRecent ?? vi.fn<(id: string) => void>(), queue: [],
          setQueue: overrides.setQueue ?? vi.fn<Dispatch<SetStateAction<string[]>>>(), isShuffle: false,
          setIsShuffle: vi.fn(), isRepeat: false, setIsRepeat: vi.fn(),
        }}>
          <Sidebar {...(overrides.onAudioSearchSelection ? { onAudioSearchSelection: overrides.onAudioSearchSelection } : {})} />
          <Routes>
            <Route path="*" element={<CurrentPath />} />
          </Routes>
        </PlayerContext.Provider>
      </MediaContext.Provider>
    </MemoryRouter>
  );
}

function makeFile(id: string, name: string, type: string): StoredFile {
  return {
    id, name, type, lastModified: 1_700_000_000_000,
    uploadedAt: "2023-11-14T22:13:20.000Z",
    size: 1024, data: new Blob(),
  };
}

describe("Sidebar integration", () => {
  describe("Rendering", () => {
    it("renders the search field and section navigation", () => {
      renderSidebar([]);

      expect(screen.getByRole("searchbox", { name: "Search media" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /music/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("navigates to app sections", () => {
      renderSidebar([]);

      fireEvent.click(screen.getByRole("button", { name: /music/i }));
      expect(screen.getByText("/music")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /settings/i }));
      expect(screen.getByText("/settings")).toBeInTheDocument();
    });

    it("shows an empty state when a search has no matches", () => {
      renderSidebar([makeFile("audio-1", "Artist - Song.mp3", "audio/mpeg")]);

      const search = screen.getByRole("searchbox", { name: "Search media" });
      fireEvent.focus(search);
      fireEvent.change(search, { target: { value: "missing" } });

      expect(screen.getByText("No matching media")).toBeInTheDocument();
    });
  });

  describe("Dataflow", () => {
    it("searches media case-insensitively and starts the chosen audio", () => {
    const setCurrentMediaId = vi.fn();
    const setCurrentMediaType = vi.fn();
    const setIsPlaying = vi.fn();
    const setQueue = vi.fn();
    const addToRecent = vi.fn();
    const onAudioSearchSelection = vi.fn();
    const files = [
      makeFile("audio-1", "Artist One - Song.mp3", "audio/mpeg"),
      makeFile("audio-2", "Other Artist - Track.mp3", "audio/mpeg"),
      makeFile("video-1", "Song Video.mp4", "video/mp4"),
    ];

    renderSidebar(files, {
      setCurrentMediaId, setCurrentMediaType, setIsPlaying,
      setQueue, addToRecent, onAudioSearchSelection,
    });

    const search = screen.getByRole("searchbox", { name: "Search media" });
    fireEvent.focus(search);
    fireEvent.change(search, { target: { value: "ARTIST ONE" } });
    expect(screen.getByRole("option", { name: /Artist One - Song.mp3/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: /Artist One - Song.mp3/i }));

    expect(setQueue).toHaveBeenCalledWith(["audio-1", "audio-2"]);
    expect(setCurrentMediaId).toHaveBeenCalledWith("audio-1");
    expect(setCurrentMediaType).toHaveBeenCalledWith("audio");
    expect(setIsPlaying).toHaveBeenCalledWith(true);
    expect(addToRecent).toHaveBeenCalledWith("audio-1");
    expect(onAudioSearchSelection).toHaveBeenCalledOnce();
      expect(search).toHaveValue("");
    });
  });
});