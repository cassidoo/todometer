import "@testing-library/jest-dom";

// Polyfill ResizeObserver for jsdom (required by @dnd-kit/dom)
if (typeof globalThis.ResizeObserver === "undefined") {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
