import { render, screen } from "@testing-library/react";
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

function renderBottom() {
  return render(
    <MediaContext.Provider
      value={{
        files: [],
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
});