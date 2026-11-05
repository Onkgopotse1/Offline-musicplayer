import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

vi.mock("@fortawesome/free-solid-svg-icons", () => ({
  faTrashCan: {},
}));

import Playlist from "../../features/Playlist.tsx";

describe("Playlist integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("shows an empty-state message when no playlists exist", () => {
      render(
        <MemoryRouter>
          <Playlist />
        </MemoryRouter>
      );

      expect(screen.getByText("You have no playlists")).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("keeps the creation dialog open for a blank name and closes on cancel", () => {
      render(
        <MemoryRouter>
          <Playlist />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole("button", { name: /add playlist/i }));
      fireEvent.click(screen.getByRole("button", { name: "Add" }));
      expect(screen.getByPlaceholderText("Enter playlist name...")).toBeInTheDocument();
      expect(localStorage.getItem("playlists")).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByPlaceholderText("Enter playlist name...")).not.toBeInTheDocument();
    });
  });

  describe("Dataflow", () => {
    it("creates a trimmed playlist and shows its saved song count", () => {
    localStorage.setItem("playlist_songs_Favorites", JSON.stringify(["song-1", "song-2"]));

    render(
      <MemoryRouter>
        <Playlist />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /add playlist/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter playlist name..."), {
      target: { value: "  Favorites  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Favorites Playlist")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("playlists") ?? "[]")).toEqual(["Favorites"]);
  });

    it("deletes a playlist and its saved song IDs", () => {
    localStorage.setItem("playlists", JSON.stringify(["Favorites"]));
    localStorage.setItem("playlist_songs_Favorites", JSON.stringify(["song-1"]));

    const { container } = render(
      <MemoryRouter>
        <Playlist />
      </MemoryRouter>
    );

    fireEvent.click(container.querySelector(".playlist-thumb button:last-child")!);

    expect(screen.queryByText("Favorites Playlist")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("playlists") ?? "[]")).toEqual([]);
      expect(localStorage.getItem("playlist_songs_Favorites")).toBeNull();
    });
  });
});