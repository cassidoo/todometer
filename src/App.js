import React from "react";
import TodoDate from "./components/TodoDate";
import ItemList from "./components/ItemList";
import { AppStateProvider } from "./AppContext";

function App() {
  return (
    <AppStateProvider>
      <TodoDate />
      <ItemList />
    </AppStateProvider>
  );
}

export default App;
