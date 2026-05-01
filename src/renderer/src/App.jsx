import { useCallback, useEffect, useState } from "react";
import TodoDate from "./components/TodoDate.jsx";
import ItemList from "./components/ItemList.jsx";
import SettingsDrawer from "./components/SettingsDrawer.jsx";
import { AppStateProvider } from "./AppContext.jsx";

function App() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [showResetButton, setShowResetButton] = useState(true);
	const [showCopyButton, setShowCopyButton] = useState(false);

	useEffect(() => {
		Promise.all([
			window.settingsAPI?.getShowResetButton(),
			window.settingsAPI?.getShowCopyButton(),
		]).then(([reset, copy]) => {
			setShowResetButton(reset ?? true);
			setShowCopyButton(copy ?? false);
		});
	}, []);

	useEffect(() => {
		const removeListener = window?.onPlayNotificationSound?.((soundPath) => {
			if (!soundPath) {
				return;
			}

			const normalizedPath = String(soundPath).replace(/\\/g, "/");
			const src = normalizedPath.startsWith("file://")
				? normalizedPath
				: `file:///${normalizedPath}`;

			const audio = new Audio(src);
			audio.play().catch(() => {
				// Ignore playback failures to avoid blocking notifications.
			});
		});

		return () => {
			if (typeof removeListener === "function") {
				removeListener();
			}
		};
	}, []);

	useEffect(() => {
		document.body.classList.toggle("settings-drawer-open", drawerOpen);

		return () => {
			document.body.classList.remove("settings-drawer-open");
		};
	}, [drawerOpen]);

	const openSettings = useCallback(() => setDrawerOpen(true), []);

	return (
		<AppStateProvider>
			<TodoDate />
			<ItemList showResetButton={showResetButton} showCopyButton={showCopyButton} onOpenSettings={openSettings} />
			<SettingsDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				showResetButton={showResetButton}
				onShowResetButtonChange={setShowResetButton}
				showCopyButton={showCopyButton}
				onShowCopyButtonChange={setShowCopyButton}
			/>
		</AppStateProvider>
	);
}

export default App;
