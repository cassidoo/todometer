import TodoDate from "./components/TodoDate.jsx";
import ItemList from "./components/ItemList.jsx";
import { AppStateProvider } from "./AppContext.tsx";

function App() {
  return (
    <AppStateProvider>
      <TodoDate />
      <ItemList />
    </AppStateProvider>
  );
}

export default App;
