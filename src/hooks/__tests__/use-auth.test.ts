import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../use-auth";

// --- mocks ---

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignInAction = vi.fn();
const mockSignUpAction = vi.fn();
vi.mock("@/actions", () => ({
  signIn: (...args: any[]) => mockSignInAction(...args),
  signUp: (...args: any[]) => mockSignUpAction(...args),
}));

const mockGetAnonWorkData = vi.fn();
const mockClearAnonWork = vi.fn();
vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: () => mockGetAnonWorkData(),
  clearAnonWork: () => mockClearAnonWork(),
}));

const mockGetProjects = vi.fn();
vi.mock("@/actions/get-projects", () => ({
  getProjects: () => mockGetProjects(),
}));

const mockCreateProject = vi.fn();
vi.mock("@/actions/create-project", () => ({
  createProject: (input: any) => mockCreateProject(input),
}));

// --- helpers ---

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no anonymous work, no existing projects, createProject returns a project
  mockGetAnonWorkData.mockReturnValue(null);
  mockGetProjects.mockResolvedValue([]);
  mockCreateProject.mockResolvedValue({ id: "new-project-id" });
});

// --- signIn ---

describe("signIn", () => {
  test("calls signInAction with the provided credentials", async () => {
    mockSignInAction.mockResolvedValue({ success: false, error: "Invalid credentials" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password123");
    });

    expect(mockSignInAction).toHaveBeenCalledWith("user@example.com", "password123");
  });

  test("returns the result from signInAction", async () => {
    const mockResult = { success: false, error: "Invalid credentials" };
    mockSignInAction.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAuth());

    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signIn("user@example.com", "wrong");
    });

    expect(returnValue).toEqual(mockResult);
  });

  test("sets isLoading to true during signIn and false after", async () => {
    let resolveFn!: (value: any) => void;
    mockSignInAction.mockReturnValue(
      new Promise((res) => {
        resolveFn = res;
      })
    );

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signIn("user@example.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveFn({ success: false, error: "err" });
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("sets isLoading to false even when signInAction throws", async () => {
    mockSignInAction.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.signIn("user@example.com", "password");
      })
    ).rejects.toThrow("network error");

    expect(result.current.isLoading).toBe(false);
  });

  test("does not navigate when signIn fails", async () => {
    mockSignInAction.mockResolvedValue({ success: false, error: "bad creds" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "wrong");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  describe("post sign-in navigation", () => {
    test("creates project from anon work and navigates when anon messages exist", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue({
        messages: [{ role: "user", content: "hello" }],
        fileSystemData: { "/app.tsx": "code" },
      });
      mockCreateProject.mockResolvedValue({ id: "anon-project-id" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password");
      });

      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: "user", content: "hello" }],
          data: { "/app.tsx": "code" },
        })
      );
      expect(mockClearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-project-id");
      expect(mockGetProjects).not.toHaveBeenCalled();
    });

    test("does not use anon work when messages array is empty", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue({ messages: [], fileSystemData: {} });
      mockGetProjects.mockResolvedValue([{ id: "existing-id" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password");
      });

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockClearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-id");
    });

    test("does not use anon work when getAnonWorkData returns null", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ id: "existing-id" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password");
      });

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-id");
    });

    test("navigates to most recent project when no anon work", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetProjects.mockResolvedValue([
        { id: "recent-project" },
        { id: "older-project" },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/recent-project");
      expect(mockCreateProject).not.toHaveBeenCalled();
    });

    test("creates new project and navigates when no anon work and no existing projects", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "brand-new-id" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password");
      });

      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ messages: [], data: {} })
      );
      expect(mockPush).toHaveBeenCalledWith("/brand-new-id");
    });

    test("new project name is a non-empty string", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "x" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password");
      });

      const name: string = mockCreateProject.mock.calls[0][0].name;
      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
    });
  });
});

// --- signUp ---

describe("signUp", () => {
  test("calls signUpAction with the provided credentials", async () => {
    mockSignUpAction.mockResolvedValue({ success: false, error: "exists" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "securepass");
    });

    expect(mockSignUpAction).toHaveBeenCalledWith("new@example.com", "securepass");
  });

  test("returns the result from signUpAction", async () => {
    const mockResult = { success: false, error: "Email already registered" };
    mockSignUpAction.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAuth());

    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signUp("exists@example.com", "pass");
    });

    expect(returnValue).toEqual(mockResult);
  });

  test("sets isLoading to true during signUp and false after", async () => {
    let resolveFn!: (value: any) => void;
    mockSignUpAction.mockReturnValue(
      new Promise((res) => {
        resolveFn = res;
      })
    );

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signUp("new@example.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveFn({ success: false });
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("sets isLoading to false even when signUpAction throws", async () => {
    mockSignUpAction.mockRejectedValue(new Error("server error"));

    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.signUp("new@example.com", "password");
      })
    ).rejects.toThrow("server error");

    expect(result.current.isLoading).toBe(false);
  });

  test("does not navigate when signUp fails", async () => {
    mockSignUpAction.mockResolvedValue({ success: false, error: "bad input" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "short");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("triggers handlePostSignIn (navigates) when signUp succeeds", async () => {
    mockSignUpAction.mockResolvedValue({ success: true });
    mockGetProjects.mockResolvedValue([{ id: "first-project" }]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "password123");
    });

    expect(mockPush).toHaveBeenCalledWith("/first-project");
  });
});

// --- initial state ---

describe("initial state", () => {
  test("isLoading is false initially", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);
  });

  test("exposes signIn, signUp, and isLoading", () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.signIn).toBe("function");
    expect(typeof result.current.signUp).toBe("function");
    expect(typeof result.current.isLoading).toBe("boolean");
  });
});
