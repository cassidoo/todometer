import { useEffect } from "react";
import TodoDate from "./components/TodoDate.jsx";
import ItemList from "./components/ItemList.jsx";
import { AppStateProvider } from "./AppContext.jsx";

function App() {
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

	return (
		<AppStateProvider>
			<TodoDate />
			<ItemList />
		</AppStateProvider>
	);
}

export default App;
