import React from "react";
import TodoDate from "./components/TodoDate.jsx";
import ItemList from "./components/ItemList.jsx";
import { AppStateProvider } from "./AppContext.jsx";

function App() {
  return (
    <p>TEST</p>
    // <AppStateProvider>
    //   <TodoDate />
    //   <ItemList />
    // </AppStateProvider>
  );
}

export default App;