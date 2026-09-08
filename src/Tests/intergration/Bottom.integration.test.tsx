import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

vi.mock("@fortawesome/free-solid-svg-icons", () => ({
  faShuffle: {},
  faBackward: {},
  faPlay: {},
  faPause: {},
  faForward: {},
  faRepeat: {},
  faVolumeHigh: {},
  faMaximize: {},
  faMinimize: {},
  faEllipsis: {},
}));

import Bottom from "../../components/Layout/Bottom.tsx";
import {
  MediaContext,
  PlayerContext,
} from "../../context/MediaContext.tsx";

function renderBottom(overrides: Partial<{
  files: any[];
  currentMediaId: string | null;
  currentMediaType: "audio" | "video" | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: string[];
  setCurrentMediaId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setIsShuffle: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRepeat: React.Dispatch<React.SetStateAction<boolean>>;
}> = {}) {
  const files = overrides.files ?? [];
  const currentMediaId = overrides.currentMediaId ?? null;
  const currentMediaType = overrides.currentMediaType ?? null;
  const isPlaying = overrides.isPlaying ?? false;
  const isShuffle = overrides.isShuffle ?? false;
  const isRepeat = overrides.isRepeat ?? false;
  const queue = overrides.queue ?? [];
  const noopSetCurrentMediaId = ((value: React.SetStateAction<string | null>) => value) as React.Dispatch<React.SetStateAction<string | null>>;
  const noopSetIsPlaying = ((value: React.SetStateAction<boolean>) => value) as React.Dispatch<React.SetStateAction<boolean>>;
  const noopSetIsShuffle = ((value: React.SetStateAction<boolean>) => value) as React.Dispatch<React.SetStateAction<boolean>>;
  const noopSetIsRepeat = ((value: React.SetStateAction<boolean>) => value) as React.Dispatch<React.SetStateAction<boolean>>;

  return render(
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
          currentMediaId,
          setCurrentMediaId: overrides.setCurrentMediaId ?? noopSetCurrentMediaId,
          currentMediaType,
          setCurrentMediaType: vi.fn(),
          isPlaying,
          setIsPlaying: overrides.setIsPlaying ?? noopSetIsPlaying,
          videoRef: { current: null },
          recentIds: [],
          addToRecent: vi.fn(),
          queue,
          setQueue: vi.fn(),
          isShuffle,
          setIsShuffle: overrides.setIsShuffle ?? noopSetIsShuffle,
          isRepeat,
          setIsRepeat: overrides.setIsRepeat ?? noopSetIsRepeat,
        }}
      >
        <Bottom />
      </PlayerContext.Provider>
    </MediaContext.Provider>
  );
}

describe("Bottom player", () => {
  it("renders the progress bar and player controls", () => {
    renderBottom();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(9);
  });

  it("shows the active shuffle and repeat states", () => {
    const { container } = renderBottom({ isShuffle: true, isRepeat: true });

    expect(container.querySelector(".shuffle-button")?.className).toContain("active");
    expect(container.querySelector(".repeat-button")?.className).toContain("active");
  });

  it("reveals and updates the volume slider when toggled", () => {
    renderBottom();

    const volumeButton = document.querySelector(".volume-button") as HTMLButtonElement;
    fireEvent.click(volumeButton);

    const slider = document.querySelector(".volume-slider") as HTMLInputElement;
    expect(slider).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "0.25" } });
    expect(slider.value).toBe("0.25");
  });

  it("calls the play toggle when the main player button is clicked", () => {
    const setIsPlaying = vi.fn();
    renderBottom({ currentMediaType: "audio", setIsPlaying });

    fireEvent.click(document.querySelector(".play-button") as HTMLButtonElement);

    expect(setIsPlaying).toHaveBeenCalled();
  });

  it("moves to the next queue item when the forward button is clicked", () => {
    const setCurrentMediaId = vi.fn();
    const setIsPlaying = vi.fn();

    renderBottom({
      currentMediaId: "track-1",
      currentMediaType: "audio",
      queue: ["track-1", "track-2"],
      setCurrentMediaId,
      setIsPlaying,
    });

    fireEvent.click(document.querySelector(".forward-fast-button") as HTMLButtonElement);

    expect(setCurrentMediaId).toHaveBeenCalledWith("track-2");
    expect(setIsPlaying).toHaveBeenCalledWith(true);
  });
});