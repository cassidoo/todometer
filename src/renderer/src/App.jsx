import React from "react";
import TodoDate from "./components/TodoDate.jsx";
import ItemList from "./components/ItemList.jsx";
import { AppStateProvider } from "./AppContext.jsx";

function App() {
  return (
    <AppStateProvider>
      <button onClick={async ()=>{
        console.log("in btn");
       console.log(await window.pinger.ping("from react"));
      }}>ping</button>
      <TodoDate />
      <ItemList />
    </AppStateProvider>
  );
}

export default App;
