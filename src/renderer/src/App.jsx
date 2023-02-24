import TodoDate from "./components/TodoDate.tsx";
import ItemList from "./components/ItemList.tsx";
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
