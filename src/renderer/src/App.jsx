import TodoDate from "./components/TodoDate.jsx";
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
