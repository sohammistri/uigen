// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

const mockSet = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: () => ({ set: mockSet }),
}));

const { createSession } = await import("@/lib/auth");

beforeEach(() => {
  mockSet.mockClear();
});

test("sets cookie with the correct name", async () => {
  await createSession("user-1", "user@example.com");
  expect(mockSet).toHaveBeenCalledOnce();
  expect(mockSet.mock.calls[0][0]).toBe("auth-token");
});

test("sets correct cookie options", async () => {
  await createSession("user-1", "user@example.com");
  const options = mockSet.mock.calls[0][2];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
  expect(options.secure).toBe(false); // NODE_ENV is "test", not "production"
});

test("sets expiry approximately 7 days from now", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const expires: Date = mockSet.mock.calls[0][2].expires;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 5000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 5000);
});

test("token is a valid JWT containing userId and email", async () => {
  await createSession("user-42", "hello@example.com");
  const token: string = mockSet.mock.calls[0][1];

  const secret = new TextEncoder().encode("development-secret-key");
  const { payload } = await jwtVerify(token, secret);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@example.com");
});
