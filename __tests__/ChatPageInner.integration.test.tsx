import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import React from "react";

// Mock next/navigation hooks used inside component
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock socket client so it does nothing in tests
vi.mock("@/lib/socketClient", () => ({
  getSocketClient: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

// Mock hooks to return a simple profile and noop unread counter
vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({ profile: { email: "me@example.com" } }),
}));
vi.mock("@/hooks/useUnreadMessages", () => ({
  useUnreadMessages: () => ({ refreshUnreadCount: vi.fn() }),
}));

// Provide minimal shadcn/ui component mocks to avoid style/render issues
vi.mock("@/components/ui/scroll-area", () => ({ ScrollArea: (p: any) => <div {...p} /> }));
vi.mock("@/components/ui/input", () => ({ Input: (p: any) => <input {...p} /> }));
vi.mock("@/components/ui/button", () => ({ Button: (p: any) => <button {...p} /> }));
vi.mock("@/components/ui/badge", () => ({ Badge: (p: any) => <span {...p} /> }));
vi.mock("@/components/ui/card", () => ({ Card: (p: any) => <div {...p} />, CardContent: (p: any) => <div {...p} /> }));
vi.mock("@/components/ui/avatar", () => ({
  Avatar: (p: any) => <div {...p} />,
  AvatarImage: (p: any) => <img alt="avatar" {...p} />,
  AvatarFallback: (p: any) => <div {...p} />,
}));

import ChatPageInner from "@/app/chat/ChatPageInner";

// Helper to mock global fetch
function mockFetchSequence(sequence: Array<{ ok?: boolean; json: any }>) {
  let i = 0;
  globalThis.fetch = vi.fn(async () => {
    const entry = sequence[Math.min(i, sequence.length - 1)];
    i++;
    return {
      ok: entry.ok ?? true,
      json: async () => (typeof entry.json === "function" ? entry.json() : entry.json),
    } as any;
  }) as any;
}

describe("ChatPageInner integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading, then renders matches, and selecting a user loads messages", async () => {
    // 1st call: /api/chat/matches
    // 2nd call: /api/messages/list?mode=conversation&other=first@example.com
    mockFetchSequence([
      {
        json: {
          success: true,
          matches: [
            {
              _id: "1",
              email: "first@example.com",
              name: "First",
              profileImage: "",
              lastMessage: "hey",
              lastTime: new Date().toISOString(),
              unread: 2,
              time: new Date().toLocaleString(),
            },
            {
              _id: "2",
              email: "second@example.com",
              name: "Second",
              profileImage: "",
              lastMessage: "yo",
              lastTime: new Date().toISOString(),
              unread: 0,
              time: new Date().toLocaleString(),
            },
          ],
        },
      },
      {
        json: {
          success: true,
          messages: [
            {
              _id: "m1",
              from: "first@example.com",
              to: "me@example.com",
              text: "Hello there",
              timestamp: new Date().toISOString(),
              read: false,
            },
          ],
        },
      },
    ]);

    render(<ChatPageInner />);

    // Loading state
    expect(screen.getByText(/Loading your matches/i)).toBeInTheDocument();

    // Matches list appears after fetch
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /First/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Second/ })).toBeInTheDocument();
    });

    // Select second user -> should trigger fetch messages for that user
    // Push another mocked response for the selection
  (globalThis.fetch as unknown as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        messages: [
          {
            _id: "m2",
            from: "me@example.com",
            to: "second@example.com",
            text: "Hi Second",
            timestamp: new Date().toISOString(),
            read: true,
          },
        ],
      }),
    } as any);

    fireEvent.click(screen.getByRole('button', { name: /Second/ }));

    await waitFor(() => {
      expect(screen.getByText("Hi Second")).toBeInTheDocument();
    });
  });
});



