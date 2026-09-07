import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Video from "../../features/Video.tsx";
import {
  MediaContext,
  PlayerContext,
} from "../../context/MediaContext.tsx";
import type { StoredFile } from "../../type/media.ts";

function renderVideo(
  files: StoredFile[] = [],
  thumbnails: Record<string, string> = {},
  playerOptions: {
    currentMediaId?: string | null;
    loadFileData?: () => Promise<ArrayBuffer>;
  } = {}
) {
  return render(
    <MediaContext.Provider
      value={{
          files,
        setFiles: vi.fn(),
        saveFile: vi.fn(),
        loadFileData: playerOptions.loadFileData ?? vi.fn(),
        loadThumbnails: vi.fn(),
        saveThumbnail: vi.fn(),
      }}
    >
      <PlayerContext.Provider
        value={{
          currentMediaId: playerOptions.currentMediaId ?? null,
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

  it("shows a message when no files are chosen", () => {
    renderVideo();

    expect(screen.getByText("No files chosen yet")).toBeInTheDocument();
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

  it("uses the provided thumbnail URL", () => {
    const video: StoredFile = {
      id: "video-1",
      name: "Vacation.mp4",
      type: "video/mp4",
      lastModified: 1_700_000_000_000,
      size: 1024,
      data: new ArrayBuffer(8),
      uploadedAt: new Date(1_700_000_000_000).toISOString(),
    };

    renderVideo([video], {
      "video-1": "https://example.com/vacation-thumbnail.jpg",
    });

    expect(screen.getByAltText("Vacation.mp4")).toHaveAttribute(
      "src",
      "https://example.com/vacation-thumbnail.jpg"
    );
  });

  it("shows the video player when a video is active", async () => {
    const video: StoredFile = {
      id: "video-1",
      name: "Vacation.mp4",
      type: "video/mp4",
      lastModified: 1_700_000_000_000,
      size: 1024,
      data: new ArrayBuffer(8),
      uploadedAt: new Date(1_700_000_000_000).toISOString(),
    };
    const loadFileData = vi.fn().mockResolvedValue(new ArrayBuffer(8));

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:video-url"),
    });

    const { container } = renderVideo(
      [video],
      { "video-1": "vacation-thumbnail" },
      { loadFileData }
    );
    fireEvent.click(screen.getByRole("button", { name: "▶" }));

    await waitFor(() => {
      expect(container.querySelector("video")).toBeInTheDocument();
    });
  });

  it("shows the player close button and active video name", async () => {
    const video: StoredFile = {
      id: "video-1",
      name: "Vacation.mp4",
      type: "video/mp4",
      lastModified: 1_700_000_000_000,
      size: 1024,
      data: new ArrayBuffer(8),
      uploadedAt: new Date(1_700_000_000_000).toISOString(),
    };
    const loadFileData = vi.fn().mockResolvedValue(new ArrayBuffer(8));

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:video-url"),
    });

    const { container } = renderVideo(
      [video],
      { "video-1": "vacation-thumbnail" },
      { loadFileData }
    );
    fireEvent.click(screen.getByRole("button", { name: "▶" }));

    await waitFor(() => {
      expect(container.querySelector(".video-overlay-title")).toHaveTextContent(
        "Vacation.mp4"
      );
      expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
    });
  });

  it("marks the currently playing card as active", () => {
    const video: StoredFile = {
      id: "video-1",
      name: "Vacation.mp4",
      type: "video/mp4",
      lastModified: 1_700_000_000_000,
      size: 1024,
      data: new ArrayBuffer(8),
      uploadedAt: new Date(1_700_000_000_000).toISOString(),
    };

    renderVideo(
      [video],
      { "video-1": "vacation-thumbnail" },
      { currentMediaId: "video-1" }
    );

    expect(screen.getByText("Vacation.mp4").closest(".cart-div")).toHaveClass(
      "video-active"
    );
  });

  it("renders only video files, not audio files", () => {
    const files: StoredFile[] = [
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
        id: "audio-1",
        name: "Song.mp3",
        type: "audio/mpeg",
        lastModified: 1_700_000_000_000,
        size: 1024,
        data: new ArrayBuffer(8),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      },
    ];

    renderVideo(files);

    expect(screen.getByText("Vacation.mp4")).toBeInTheDocument();
    expect(screen.queryByText("Song.mp3")).not.toBeInTheDocument();
  });


});


