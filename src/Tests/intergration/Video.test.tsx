import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
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
    loadFileData?: () => Promise<Blob>;
  } = {}
) {
  function VideoHarness() {
    const [currentMediaId, setCurrentMediaId] = useState(playerOptions.currentMediaId ?? null);
    const [currentMediaType, setCurrentMediaType] = useState<"audio" | "video" | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
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
          currentMediaId,
          setCurrentMediaId,
          currentMediaType,
          setCurrentMediaType,
          isPlaying,
          setIsPlaying,
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
  return render(<VideoHarness />);
}

describe("Video", () => {
  describe("Rendering", () => {
    describe("page controls", () => {
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
    });

    describe("video library", () => {
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
        data: new Blob(),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      },
      {
        id: "video-2",
        name: "Concert.webm",
        type: "video/webm",
        lastModified: 1_800_000_000_000,
        size: 2048,
        data: new Blob(),
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
      data: new Blob(),
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

  it("renders only video files, not audio files", () => {
    const files: StoredFile[] = [
      {
        id: "video-1",
        name: "Vacation.mp4",
        type: "video/mp4",
        lastModified: 1_700_000_000_000,
        size: 1024,
        data: new Blob(),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      },
      {
        id: "audio-1",
        name: "Song.mp3",
        type: "audio/mpeg",
        lastModified: 1_700_000_000_000,
        size: 1024,
        data: new Blob(),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      },
    ];

    renderVideo(files);

    expect(screen.getByText("Vacation.mp4")).toBeInTheDocument();
    expect(screen.queryByText("Song.mp3")).not.toBeInTheDocument();
  });
    });

    describe("player display", () => {
  it("shows the video player when a video is active", async () => {
    const video: StoredFile = {
      id: "video-1",
      name: "Vacation.mp4",
      type: "video/mp4",
      lastModified: 1_700_000_000_000,
      size: 1024,
      data: new Blob(),
      uploadedAt: new Date(1_700_000_000_000).toISOString(),
    };
    const loadFileData = vi.fn().mockResolvedValue(new Blob(["video-content"], { type: "video/mp4" }));

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
      data: new Blob(),
      uploadedAt: new Date(1_700_000_000_000).toISOString(),
    };
    const loadFileData = vi.fn().mockResolvedValue(new Blob(["video-content"], { type: "video/mp4" }));

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
      data: new Blob(),
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
    });
  });

  describe("Interaction", () => {
    describe("video file selection", () => {
  it("saves uploaded video metadata to the media context", async () => {
    const saveFile = vi.fn();
    const file = new File(["video-content"], "clip.mp4", { type: "video/mp4" });

    render(
      <MediaContext.Provider
        value={{
          files: [],
          setFiles: vi.fn(),
          saveFile,
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
          <Video thumbnails={{}} setThumbnails={vi.fn()} />
        </PlayerContext.Provider>
      </MediaContext.Provider>
    );

    fireEvent.change(screen.getByLabelText("+ Add Videos"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(saveFile).toHaveBeenCalledTimes(1);
    });

    const savedFile = saveFile.mock.calls[0]?.[0];
    expect(savedFile).toBeDefined();
    expect(savedFile).toMatchObject({
      name: "clip.mp4",
      type: "video/mp4",
    });
    expect(savedFile.data).toBe(file);
  });

  it("does not show a read error for direct Blob-backed uploads", async () => {
    const file = new File(["video-content"], "clip.mp4", { type: "video/mp4" });
    const saveFile = vi.fn();

    render(
      <MediaContext.Provider
        value={{
          files: [],
          setFiles: vi.fn(),
          saveFile,
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
          <Video thumbnails={{}} setThumbnails={vi.fn()} />
        </PlayerContext.Provider>
      </MediaContext.Provider>
    );

    fireEvent.change(screen.getByLabelText("+ Add Videos"), {
      target: { files: [file] },
    });

    expect(saveFile).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it('Changing the sort option and verifying the video order changes.', async () => {
    const user = userEvent.setup();
    const videos: StoredFile[] = [
      {
        id:  "video-z",
        name: "Artist - Zebra.mp4",
        type: "video/mp4",
        lastModified: 1_800_000_000_000,
        size: 1024,
        data: new Blob(),
        uploadedAt: new Date(1_800_000_000_000).toISOString(),
      },
      {
        id: "video-a",
        name: "Artist - Alpha.mp4",
        type: "video/mp4",
        lastModified: 1_700_000_000_000,
        size: 1024,
        data: new Blob(),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      },
    ];

    renderVideo(videos);

    const selectElement = screen.getByRole("combobox");
    await user.selectOptions(selectElement, "az");

    expect(selectElement).toHaveValue("az");
    expect(screen.getAllByRole("img").map((image) => image.getAttribute("alt")))
      .toEqual(["Artist - Alpha.mp4", "Artist - Zebra.mp4"]);
  });

   it("Click close and verify playback resets", async () => {
    const video: StoredFile = {
      id: "video-1",
      name: "Vacation.mp4",
      type: "video/mp4",
      lastModified: 1_700_000_000_000,
      size: 1024,
      data: new Blob(),
      uploadedAt: new Date(1_700_000_000_000).toISOString(),
    };

    const loadFileData = vi.fn().mockResolvedValue(new Blob());
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:video-url"),
    });

    function StatefulVideo() {
      const [currentMediaId, setCurrentMediaId] = useState<string | null>("video-1");
      const [isPlaying, setIsPlaying] = useState(true);

      return (
        <MediaContext.Provider
          value={{
            files: [video],
            setFiles: vi.fn(),
            saveFile: vi.fn(),
            loadFileData,
            loadThumbnails: vi.fn(),
            saveThumbnail: vi.fn(),
          }}
        >
          <PlayerContext.Provider
            value={{
              currentMediaId,
              setCurrentMediaId,
              currentMediaType: "video",
              setCurrentMediaType: vi.fn(),
              isPlaying,
              setIsPlaying,
              videoRef: { current: null },
              recentIds: [],
              addToRecent: vi.fn(),
              queue: ["video-1"],
              setQueue: vi.fn(),
              isShuffle: false,
              setIsShuffle: vi.fn(),
              isRepeat: false,
              setIsRepeat: vi.fn(),
            }}
          >
            <>
              <div data-testid="playback-state">
                {currentMediaId ? `active:${currentMediaId}` : "active:none"}
                {isPlaying ? " playing" : " paused"}
              </div>
              <Video thumbnails={{}} setThumbnails={vi.fn()} />
            </>
          </PlayerContext.Provider>
        </MediaContext.Provider>
      );
    }

    render(<StatefulVideo />);

    fireEvent.click(screen.getByRole("button", { name: "▶" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "✕" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "✕" })).not.toBeInTheDocument();
      expect(screen.getByTestId("playback-state")).toHaveTextContent("active:none paused");
    });
  });

    it("shows the overlay on hover and hides it after leaving the player", async () => {
      const video: StoredFile = {
        id: "video-1",
        name: "Vacation.mp4",
        type: "video/mp4",
        lastModified: 1_700_000_000_000,
        size: 1024,
        data: new Blob(),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      };

      const loadFileData = vi.fn().mockResolvedValue(new Blob());

      Object.defineProperty(URL, "createObjectURL", {
        writable: true,
        value: vi.fn(() => "blob:video-url"),
      });

      renderVideo([video], { "video-1": "vacation-thumbnail" }, { loadFileData });

      fireEvent.click(screen.getByRole("button", { name: "▶" }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
      });

      const playerPanel = document.querySelector(".video-player-panel");
      const overlay = document.querySelector(".video-overlay");

      expect(playerPanel).toBeInTheDocument();
      expect(overlay).not.toHaveClass("video-overlay--visible");

      fireEvent.mouseMove(playerPanel!);
      expect(overlay).toHaveClass("video-overlay--visible");

      fireEvent.mouseLeave(playerPanel!);

      await waitFor(() => {
        expect(overlay).not.toHaveClass("video-overlay--visible");
      }, { timeout: 2000 });
    });


    });
  });

  describe("Dataflow", () => {
   describe("playback state", () => {
    it("sets the queue and starts playback when a video is played", async () => {
      const video: StoredFile = {
        id: "video-1",
        name: "Vacation.mp4",
        type: "video/mp4",
        lastModified: 1_700_000_000_000,
        size: 1024,
        data: new Blob(),
        uploadedAt: new Date(1_700_000_000_000).toISOString(),
      };

      const setQueue = vi.fn();
      const setCurrentMediaId = vi.fn();
      const setCurrentMediaType = vi.fn();
      const setIsPlaying = vi.fn();
      const loadFileData = vi.fn().mockResolvedValue(new Blob());

      Object.defineProperty(URL, "createObjectURL", {
        writable: true,
        value: vi.fn(() => "blob:video-url"),
      });

      render(
        <MediaContext.Provider
          value={{
            files: [video],
            setFiles: vi.fn(),
            saveFile: vi.fn(),
            loadFileData,
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
              addToRecent: vi.fn(),
              queue: [],
              setQueue,
              isShuffle: false,
              setIsShuffle: vi.fn(),
              isRepeat: false,
              setIsRepeat: vi.fn(),
            }}
          >
            <Video thumbnails={{}} setThumbnails={vi.fn()} />
          </PlayerContext.Provider>
        </MediaContext.Provider>
      );

      fireEvent.click(screen.getByRole("button", { name: "▶" }));

      await waitFor(() => {
        expect(setQueue).toHaveBeenCalledWith(["video-1"]);
        expect(setCurrentMediaId).toHaveBeenCalledWith("video-1");
        expect(setCurrentMediaType).toHaveBeenCalledWith("video");
        expect(setIsPlaying).toHaveBeenCalledWith(true);
      });
    });

    
 

    });
  });
});


