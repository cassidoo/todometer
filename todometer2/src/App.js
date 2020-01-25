import React, { useContext, createContext } from "react";
import Date from "./components/Date";
import ItemList from "./components/ItemList";
import { AppStateProvider } from "./AppContext";

import "./App.css";

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
