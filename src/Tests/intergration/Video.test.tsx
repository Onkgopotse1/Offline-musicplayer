import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Video from "../../features/Video.tsx";
import {
  MediaContext,
  PlayerContext,
} from "../../context/MediaContext.tsx";
import type { StoredFile } from "../../type/media.ts";

function renderVideo(
  files: StoredFile[] = [],
  thumbnails: Record<string, string> = {}
) {
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
          <Video thumbnails={thumbnails} setThumbnails={vi.fn()} />
      </PlayerContext.Provider>
    </MediaContext.Provider>
  );
}

describe("Video", () => {
  it("renders the page heading", () => {
    renderVideo();
   
    expect(
      screen.getByRole("heading", { name: "Video" })
    ).toBeInTheDocument();
  });

it("renders the + Add Videos button", () => {
    renderVideo();
  
    expect(screen.getByLabelText("+ Add Videos")).toHaveAttribute(
    "accept",
    "video/*"
    );
    
  });

  it("renders ⇄ Shuffle and play button", () => {
   renderVideo();
   expect(screen.getByRole("button", { name: "⇄ Shuffle and play" })).toBeInTheDocument();
  }
);

  it("renders the sort control", () => {
    renderVideo();

    const sortControl = screen.getByRole("combobox");

    expect(sortControl).toHaveValue("date");
    expect(screen.getByRole("option", { name: "Date Modified" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "A-Z" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Artist" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Album" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Release Year" })).toBeInTheDocument();
  });

  it("renders video cards", () => {
    const videos: StoredFile[] = [
      {
        id: "video-1",
        name: "Vacation.mp4",
        type: "video/mp4",
        lastModified: 1_700_000_000_000,
        size: 1024,
        data: new ArrayBuffer(8),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      },
      {
        id: "video-2",
        name: "Concert.webm",
        type: "video/webm",
        lastModified: 1_800_000_000_000,
        size: 2048,
        data: new ArrayBuffer(8),
        uploadedAt: new Date(1_800_000_000_000).toISOString(),
      },
    ];

    renderVideo(videos, {
      "video-1": "vacation-thumbnail",
      "video-2": "concert-thumbnail",
    });

    expect(screen.getByText("Vacation.mp4")).toBeInTheDocument();
    expect(screen.getByText("Concert.webm")).toBeInTheDocument();
    expect(screen.getByAltText("Vacation.mp4")).toBeInTheDocument();
    expect(screen.getByAltText("Concert.webm")).toBeInTheDocument();
  });

});


