import React from "react";
import Date from "./components/Date";
import ItemList from "./components/ItemList";
import { AppStateProvider } from "./AppContext";

function App() {
  return (
    <AppStateProvider>
      <div>
        <Date />
        <ItemList />
      </div>
    </AppStateProvider>
  );
}

export default App;
