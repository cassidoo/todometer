import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { format } from "date-fns";

export const AppContext = createContext();

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

function getCurrentDate() {
	let nd = new Date();
	return {
		day: format(nd, "dd"),
		dayDisplay: format(nd, "d"),
		month: format(nd, "MM"),
		monthDisplay: format(nd, "MMM"),
		year: format(nd, "y"),
		weekday: format(nd, "EEEE"),
	};
}

const appStateReducer = (state, action) => {
	let currentDate = getCurrentDate();

	switch (action.type) {
		case "INIT": {
			return action.state;
		}
		case "ADD_ITEM": {
			return { ...state, items: state.items.concat(action.item) };
		}
		case "UPDATE_ITEM": {
			const newItems = state.items.map((i) => {
				if (i.id === action.item.id) {
					return Object.assign({}, i, {
						status:
							action.item.status !== undefined ? action.item.status : i.status,
						text: action.item.text !== undefined ? action.item.text : i.text,
					});
				}
				return i;
			});
			return { ...state, items: newItems };
		}
		case "DELETE_ITEM": {
			return {
				...state,
				items: state.items.filter((item) => item.id !== action.item.id),
			};
		}
		case "SET_ITEMS": {
			return { ...state, items: action.items };
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
			return { ...state, items: newItems, date: currentDate };
		}
		default:
			return state;
	}
};

function persistAction(action) {
	if (!window.todoAPI) return;

	switch (action.type) {
		case "ADD_ITEM":
			window.todoAPI.addItem(action.item).catch(console.error);
			break;
		case "UPDATE_ITEM":
			window.todoAPI
				.updateItem({
					id: action.item.id,
					status: action.item.status,
					text: action.item.text,
				})
				.catch(console.error);
			break;
		case "DELETE_ITEM":
			window.todoAPI.deleteItem(action.item.id).catch(console.error);
			break;
		case "SET_ITEMS":
			window.todoAPI.setItems(action.items).catch(console.error);
			break;
		case "RESET_ALL":
			// Computed in reducer — we need to derive the same items here
			window.todoAPI.setItems(action._computedItems).catch(console.error);
			window.todoAPI.saveDate(action._computedDate).catch(console.error);
			break;
	}
}

export function AppStateProvider({ children }) {
	const [loading, setLoading] = useState(true);
	const [state, rawDispatch] = useReducer(appStateReducer, {
		items: [],
		date: getCurrentDate(),
	});

	const dispatch = useCallback(
		(action) => {
			if (action.type === "RESET_ALL") {
				// Pre-compute for persistence since reducer is pure
				const currentDate = getCurrentDate();
				const computedItems = state.items
					.filter((item) => item.status !== "completed")
					.map((i) =>
						i.status === "paused" ? { ...i, status: "pending" } : i,
					);
				const enrichedAction = {
					...action,
					_computedItems: computedItems,
					_computedDate: currentDate,
				};
				persistAction(enrichedAction);
				rawDispatch(action);
			} else {
				persistAction(action);
				rawDispatch(action);
			}
		},
		[state.items],
	);

	useEffect(() => {
		async function init() {
			try {
				if (window.todoAPI) {
					let dbState = await window.todoAPI.loadState();

					// if DB is empty but localStorage has data
					if (
						(!dbState.items || dbState.items.length === 0) &&
						localStorage.getItem("state")
					) {
						try {
							const oldState = JSON.parse(localStorage.getItem("state"));
							if (oldState && oldState.items && oldState.items.length > 0) {
								dbState =
									await window.todoAPI.migrateFromLocalStorage(oldState);
								localStorage.removeItem("state");
							}
						} catch (migrationErr) {
							console.error("Migration failed:", migrationErr);
						}
					}

					rawDispatch({
						type: "INIT",
						state: {
							items: dbState.items || [],
							date: dbState.date || getCurrentDate(),
						},
					});
				} else {
					// Fallback for non-Electron environments
					const serialized = localStorage.getItem("state");
					if (serialized) {
						const parsed = JSON.parse(serialized);
						rawDispatch({ type: "INIT", state: parsed });
					}
				}
			} catch (err) {
				console.error("Failed to load state:", err);
			} finally {
				setLoading(false);
			}
		}
		init();

		// Listen for external DB changes (protocol handler, API)
		const removeListener = window.todoAPI?.onDbChanged?.(async () => {
			try {
				const dbState = await window.todoAPI.loadState();
				rawDispatch({
					type: "INIT",
					state: {
						items: dbState.items || [],
						date: dbState.date || getCurrentDate(),
					},
				});
			} catch (err) {
				console.error("Failed to reload state:", err);
			}
		});

		return () => {
			if (typeof removeListener === "function") removeListener();
		};
	}, []);

	if (loading) {
		return <div className="App"></div>;
	}

	return (
		<div className="App">
			<AppContext.Provider value={[state, dispatch]}>
				{children}
			</AppContext.Provider>
		</div>
	);
}
