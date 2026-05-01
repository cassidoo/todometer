import { useRef } from "react";
import { useAppReducer } from "../AppContext.jsx";
import styles from "./AddItemForm.module.css";

// Form to populate to-do items
function AddItemForm() {
	const dispatch = useAppReducer();
	let inputRef = useRef();

	function addItem(e) {
		const newItem = {
			text: inputRef.current.value,
			id: crypto.randomUUID(),
			status: "pending",
		};
		if (newItem.text.trim()) {
			dispatch({ type: "ADD_ITEM", item: newItem });
		}
		e.preventDefault();
		inputRef.current.value = "";
		inputRef.current.focus();
	}

	return (
		<form className={styles.form} onSubmit={addItem}>
			<input ref={inputRef} placeholder="Add new item" autoFocus />
			<button type="submit" />
		</form>
	);
}

export default AddItemForm;
