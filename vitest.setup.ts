import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup JSDOM between tests
afterEach(() => {
  cleanup();
});

// Polyfills if needed
// globalThis.fetch will be mocked per test
