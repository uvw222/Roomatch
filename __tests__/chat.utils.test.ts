import { describe, it, expect } from "vitest";

// A small wrapper replicating updateUnreadCount logic from ChatPageInner
function updateUnreadCount(users: Array<{ email: string; unread: number }>, email: string, change: number) {
  const updated = users.map((u) =>
    u.email === email ? { ...u, unread: Math.max(0, (u.unread ?? 0) + change) } : u
  );
  return updated;
}

describe("updateUnreadCount", () => {
  it("increases unread count for a user", () => {
    const users = [{ email: "a@example.com", unread: 0 }];
    const res = updateUnreadCount(users, "a@example.com", 2);
    expect(res[0].unread).toBe(2);
  });

  it("decreases unread count but not below zero", () => {
    const users = [{ email: "a@example.com", unread: 1 }];
    const res = updateUnreadCount(users, "a@example.com", -5);
    expect(res[0].unread).toBe(0);
  });

  it("does not change unread for other users", () => {
    const users = [
      { email: "a@example.com", unread: 1 },
      { email: "b@example.com", unread: 3 },
    ];
    const res = updateUnreadCount(users, "a@example.com", 1);
    expect(res[0].unread).toBe(2);
    expect(res[1].unread).toBe(3);
  });
});
