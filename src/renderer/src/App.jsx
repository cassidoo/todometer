import TodoDate from "./components/TodoDate.jsx";
import ItemList from "./components/ItemList.jsx";
import NotificationHandler from "./components/NotificationHandler.jsx";
import { AppStateProvider } from "./AppContext.jsx";

function App() {
	return (
		<AppStateProvider>
			<TodoDate />
			<ItemList />
			<NotificationHandler />
		</AppStateProvider>
	);
}

export default App;
