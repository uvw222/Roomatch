import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup JSDOM between tests
afterEach(() => {
  cleanup();
});

// Polyfills if needed
// globalThis.fetch will be mocked per test

// jsdom polyfills for DOM methods used in components
import { vi } from "vitest";

if (!("scrollIntoView" in window.HTMLElement.prototype)) {
  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });
}
