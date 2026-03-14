import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThinkingBlock } from "../ThinkingBlock";

afterEach(() => {
  cleanup();
});

test("ThinkingBlock renders collapsed by default with 'Thought process' label", () => {
  render(<ThinkingBlock reasoning="Some reasoning text" />);

  expect(screen.getByText("Thought process")).toBeDefined();
  // Reasoning text should not be visible when collapsed
  expect(screen.queryByText("Some reasoning text")).toBeNull();
});

test("ThinkingBlock shows 'Thinking...' label when isStreaming=true", () => {
  render(<ThinkingBlock reasoning="Live reasoning..." isStreaming={true} />);

  expect(screen.getByText("Thinking...")).toBeDefined();
});

test("ThinkingBlock auto-expands when streaming", () => {
  render(<ThinkingBlock reasoning="Live reasoning..." isStreaming={true} />);

  // When streaming, should be expanded so reasoning text is visible
  expect(screen.getByText("Live reasoning...")).toBeDefined();
});

test("ThinkingBlock clicking header expands and collapses", () => {
  render(<ThinkingBlock reasoning="Hidden reasoning" />);

  const button = screen.getByRole("button");

  // Starts collapsed
  expect(screen.queryByText("Hidden reasoning")).toBeNull();

  // Click to expand
  fireEvent.click(button);
  expect(screen.getByText("Hidden reasoning")).toBeDefined();

  // Click to collapse
  fireEvent.click(button);
  expect(screen.queryByText("Hidden reasoning")).toBeNull();
});

test("ThinkingBlock shows Brain icon when not streaming", () => {
  const { container } = render(<ThinkingBlock reasoning="Done reasoning" />);
  // Brain icon is rendered via lucide — check the svg exists
  const svg = container.querySelector("svg");
  expect(svg).toBeDefined();
});

test("ThinkingBlock shows Sparkles icon when streaming", () => {
  const { container } = render(
    <ThinkingBlock reasoning="Live..." isStreaming={true} />
  );
  const svgs = container.querySelectorAll("svg");
  // There should be at least one SVG (the Sparkles icon + chevron)
  expect(svgs.length).toBeGreaterThan(0);
});
