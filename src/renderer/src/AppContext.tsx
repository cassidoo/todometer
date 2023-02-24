import { createContext, ReactNode, useContext, useReducer } from "react";
import { loadState, saveState } from "./local-storage";
import { format } from "date-fns";

export type TodoItem = {
  key: number;
  status: "pending" | "paused" | "completed";
  text: string;
};

type AppState = {
  items: TodoItem[];
  date: {
    day: string;
    dayDisplay: string;
    month: string;
    monthDisplay: string;
    year: string;
    weekday: string;
  };
};
type Context = [AppState, React.Dispatch<Action>];

export const AppContext = createContext<Context>(undefined);

export function useAppState() {
	return useContext(AppContext)[0];
}

export function useAppReducer() {
	return useContext(AppContext)[1];
}

export function useItems() {
	const { items } = useAppState();

	const pending = items.filter((item) => item.status === "pending");
	const paused = items.filter((item) => item.status === "paused");
	const completed = items.filter((item) => item.status === "completed");

	return { pending, paused, completed };
}

<<<<<<< HEAD:src/renderer/src/AppContext.tsx
type Action =
  | { type: "ADD_ITEM"; item: TodoItem }
  | { type: "UPDATE_ITEM"; item: TodoItem }
  | { type: "DELETE_ITEM"; item: TodoItem }
  | { type: "RESET_ALL" };

const appStateReducer = (state: AppState, action: Action) => {
  let nd = new Date();
=======
const appStateReducer = (state, action) => {
	let nd = new Date();
>>>>>>> main:src/renderer/src/AppContext.jsx

	let currentDate = {
		day: format(nd, "dd"),
		dayDisplay: format(nd, "d"),
		month: format(nd, "MM"),
		monthDisplay: format(nd, "MMM"),
		year: format(nd, "y"),
		weekday: format(nd, "EEEE"),
	};

	switch (action.type) {
		case "ADD_ITEM": {
			const newState = { ...state, items: state.items.concat(action.item) };
			saveState(newState);
			return newState;
		}
		case "UPDATE_ITEM": {
			const newItems = state.items.map((i) => {
				if (i.key === action.item.key) {
					return Object.assign({}, i, {
						status: action.item.status,
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
				items: state.items.filter((item) => item.key !== action.item.key),
			};
			saveState(newState);
			return newState;
		}
		case "RESET_ALL": {
			const newItems = state.items
				.filter((item) => item.status !== "completed")
				.map((i) => {
					if (i.status === "paused") {
						return Object.assign({}, i, {
							status: "pending",
						});
					}
					return i;
				});
			const newState = { ...state, items: newItems, date: currentDate };
			saveState(newState);
			return newState;
		}
		default:
			return state;
	}
};

<<<<<<< HEAD:src/renderer/src/AppContext.tsx
export function AppStateProvider({ children }: { children: ReactNode }) {
  let initialState: AppState = loadState();
=======
export function AppStateProvider({ children }) {
	let initialState = loadState();
>>>>>>> main:src/renderer/src/AppContext.jsx

	if (initialState === undefined) {
		let nd = new Date();

		initialState = {
			items: [],
			date: {
				day: format(nd, "dd"),
				dayDisplay: format(nd, "d"),
				month: format(nd, "MM"),
				monthDisplay: format(nd, "MMM"),
				year: format(nd, "y"),
				weekday: format(nd, "EEEE"),
			},
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
