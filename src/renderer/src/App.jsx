import TodoDate from "./components/TodoDate.jsx";
import ItemList from "./components/ItemList.jsx";
import { AppStateProvider } from "./AppContext.jsx";

function App() {
	return (
		<AppStateProvider>
			<TodoDate />
			<ItemList />
		</AppStateProvider>
	);
}

export default App;
