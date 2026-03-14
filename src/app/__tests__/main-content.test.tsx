import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

const { mockPush, mockCreateProject } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockCreateProject: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: mockCreateProject,
}));

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame" />,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree" />,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions" />,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: any) => <div>{children}</div>,
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders New chat button", () => {
  render(<MainContent />);
  expect(screen.getByTitle("New chat")).toBeDefined();
});

test("anonymous user: clicking New chat does not call createProject or router.push", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByTitle("New chat"));

  expect(mockCreateProject).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
});

test("authenticated user: clicking New chat calls createProject and navigates", async () => {
  const newProject = { id: "proj-123", name: "Design #42" };
  mockCreateProject.mockResolvedValue(newProject);

  const user = userEvent.setup();
  render(
    <MainContent
      user={{ id: "user-1", email: "test@example.com" }}
    />
  );

  await user.click(screen.getByTitle("New chat"));

  expect(mockCreateProject).toHaveBeenCalledWith(
    expect.objectContaining({ messages: [], data: {} })
  );
  expect(mockPush).toHaveBeenCalledWith("/proj-123");
});
