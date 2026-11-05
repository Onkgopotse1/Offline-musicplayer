import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Settings from "../../pages/Settings.tsx";

describe("Settings integration", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.style.removeProperty("--accent-color");
  });

  describe("Rendering", () => {
    it("renders the settings sections and theme choices", () => {
      render(<Settings />);

      expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
      expect(screen.getByText("Accent Color")).toBeInTheDocument();
      expect(screen.getByText("Theme Mode")).toBeInTheDocument();
      expect(screen.getByText("Light Mode")).toBeInTheDocument();
      expect(screen.getByText("Dark Mode")).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("marks the selected theme and accent as active", () => {
      const { container } = render(<Settings />);

      fireEvent.click(screen.getByText("Dark Mode"));
      fireEvent.click(container.querySelectorAll(".accent-btn")[2]!);

      expect(screen.getByText("Dark Mode").className).toContain("active");
      expect(container.querySelectorAll(".accent-btn")[2]?.className).toContain("active");
    });
  });

  describe("Dataflow", () => {
    it("persists theme and accent selections and applies them to the page", () => {
    const { container } = render(<Settings />);

    fireEvent.click(screen.getByText("Dark Mode"));
    fireEvent.click(container.querySelectorAll(".accent-btn")[2]!);

    expect(container.querySelector(".settings-page")?.className).toContain("dark");
    expect(document.documentElement.classList.contains("theme-dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--accent-color")).toBe("#22c55e");
    expect(localStorage.getItem("accent")).toBe("#22c55e");
  });

    it("initializes from saved preferences", () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("accent", "#ef4444");

    const { container } = render(<Settings />);

    expect(container.querySelector(".settings-page")?.className).toContain("dark");
    expect(container.querySelectorAll(".accent-btn")[3]?.className).toContain("active");
      expect(document.documentElement.style.getPropertyValue("--accent-color")).toBe("#ef4444");
    });
  });
});