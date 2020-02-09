import React, { createContext, useContext, useReducer } from "react";
import { loadState, saveState } from "./local-storage";
import { format } from "date-fns";

export const AppContext = createContext();

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
      const newState = { ...state, items: state.items.concat(action.item) };
      saveState(newState);
      return newState;
    }
    case "UPDATE_ITEM": {
      const newItems = state.items.map(i => {
        if (i.key === action.item.key) {
          return Object.assign({}, i, {
            status: action.item.status
          });
        }
        return i;
      });
      const newState = { ...state, items: newItems };
      saveState(newState);
      return newState;
    }
    case "DELETE_ITEM": {
      const newState = {
        ...state,
        items: state.items.filter(item => item.key !== action.item.key)
      };
      saveState(newState);
      return newState;
    }
    case "RESET_ALL": {
      const newItems = state.items
        .filter(item => item.status !== "completed")
        .map(i => {
          if (i.status === "paused") {
            return Object.assign({}, i, {
              status: "pending"
            });
          }
          return i;
        });
      const newState = { ...state, items: newItems };
      saveState(newState);
      return newState;
    }
    case "SET_DATE": {
      const newState = { ...state, date: action.date };
      saveState(newState);
      return newState;
    }
    default:
      return state;
  }
};

export function AppStateProvider({ children }) {
  let initialState = loadState();

  if (initialState === undefined) {
    initialState = {
      items: [],
      date: {
        day: format(new Date(), "dd"),
        month: format(new Date(), "MM"),
        year: format(new Date(), "y")
      }
    };
  }

  saveState(initialState);

  const value = useReducer(appStateReducer, initialState);
  return (
    <div className="App">
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </div>
  );
}
