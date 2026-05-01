import "@testing-library/jest-dom";

// Polyfill ResizeObserver for jsdom (required by @dnd-kit/dom)
if (typeof globalThis.ResizeObserver === "undefined") {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

// Polyfill Element.getAnimations and Document.getAnimations for jsdom
if (typeof Element.prototype.getAnimations === "undefined") {
	Element.prototype.getAnimations = function () {
		return [];
	};
}
if (typeof Document.prototype.getAnimations === "undefined") {
	Document.prototype.getAnimations = function () {
		return [];
	};
}

// Polyfill IntersectionObserver for jsdom (required by @dnd-kit/dom)
if (typeof globalThis.IntersectionObserver === "undefined") {
	globalThis.IntersectionObserver = class IntersectionObserver {
		constructor() {}
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

// Polyfill window.matchMedia for jsdom (required by @dnd-kit/dom)
if (typeof window.matchMedia === "undefined") {
	window.matchMedia = function () {
		return { matches: false, addListener() {}, removeListener() {} };
	};
}

// Mock window.todoAPI — tests use localStorage fallback in AppContext
// so we don't need to mock the full API, just ensure it's absent
delete window.todoAPI;
