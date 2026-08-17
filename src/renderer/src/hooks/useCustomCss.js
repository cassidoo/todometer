import { useEffect } from "react";

const STYLE_ELEMENT_ID = "user-custom-css";

function applyCustomCss(payload) {
	const css = payload?.enabled ? (payload.css ?? "") : "";
	let styleEl = document.getElementById(STYLE_ELEMENT_ID);

	if (!css) {
		if (styleEl) styleEl.remove();
		return;
	}

	if (!styleEl) {
		styleEl = document.createElement("style");
		styleEl.id = STYLE_ELEMENT_ID;
		document.head.appendChild(styleEl);
	}
	styleEl.textContent = css;
}

// Injects and live-updates a user-defined CSS override supplied via the
// settings drawer. The stylesheet is appended last so it wins over the
// bundled component styles.
export function useCustomCss() {
	useEffect(() => {
		window.settingsAPI
			?.getCustomCss()
			.then(applyCustomCss)
			.catch((err) => console.error("Failed to load custom CSS:", err));

		const removeListener = window?.onCustomCssChange?.(applyCustomCss);
		return () => {
			if (typeof removeListener === "function") removeListener();
		};
	}, []);
}
