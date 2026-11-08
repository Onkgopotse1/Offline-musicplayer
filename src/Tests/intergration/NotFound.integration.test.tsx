import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFound from "../../pages/NotFound.tsx";

function CurrentPath() {
  return <p>{useLocation().pathname}</p>;
}

describe("Not found integration", () => {
  describe("Rendering", () => {
    it("shows the not-found page", () => {
      render(
        <MemoryRouter initialEntries={["/notfound"]}>
          <Routes>
            <Route path="/notfound" element={<NotFound />} />
            <Route path="/" element={<CurrentPath />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole("heading", { name: "Not Found" })).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("provides a link back to Home", () => {
      render(
        <MemoryRouter initialEntries={["/notfound"]}>
          <Routes>
            <Route path="/notfound" element={<NotFound />} />
            <Route path="/" element={<CurrentPath />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole("link", { name: "Go to Home" })).toHaveAttribute("href", "/");
    });
  });

  describe("Dataflow", () => {
    it("navigates to Home when its link is selected", () => {
      render(
        <MemoryRouter initialEntries={["/notfound"]}>
          <Routes>
            <Route path="/notfound" element={<NotFound />} />
            <Route path="/" element={<CurrentPath />} />
          </Routes>
        </MemoryRouter>
      );

    fireEvent.click(screen.getByRole("link", { name: "Go to Home" }));
    expect(screen.getByText("/")).toBeInTheDocument();
    });
  });
});