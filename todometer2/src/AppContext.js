import React, { createContext, useContext, useReducer } from "react";

export const AppContext = createContext();

export function useAppStateAndReducer() {
  return useContext(AppContext);
}

export function useAppState() {
  return useContext(AppContext)[0];
}

export function useAppReducer() {
  return useContext(AppContext)[1];
}

export function useItems(filterType) {
  let { items } = useAppState();
  if (
    filterType === "pending" ||
    filterType === "completed" ||
    filterType === "paused"
  ) {
    return items.filter(item => item.status === filterType);
  } else {
    throw new Error(`Unknown item filter.`);
  }
}

const appStateReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      return { ...state, items: state.items.concat(action.item) };
    }
    case "UPDATE_ITEM": {
      let newItems = state.items.map(i => {
        if (i.key === action.item.key) {
          return Object.assign({}, i, {
            status: action.item.status
          });
        }
        return i;
      });
      return { ...state, items: newItems };
    }
    case "DELETE_ITEM": {
      return {
        ...state,
        items: state.items.filter(item => item.key !== action.item.key)
      };
    }
    case "RESET_ALL": {
      let newItems = state.items
        .filter(item => item.status !== "completed")
        .map(i => {
          if (i.status === "paused") {
            return Object.assign({}, i, {
              status: "pending"
            });
          }
          return i;
        });
      return { ...state, items: newItems };
    }
    case "SET_DATE": {
      return { ...state, date: action.date };
    }
    default:
      return state;
  }
};

export function AppStateProvider({ children }) {
  let initialState = {
    items: [],
    date: {
      day: "",
      month: "",
      year: "",
      weekday: ""
    }
  };

  const value = useReducer(appStateReducer, initialState);
  return (
    <div className="App">
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </div>
  );
}
