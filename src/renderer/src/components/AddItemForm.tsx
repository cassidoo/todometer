import { useRef } from "react";
import { useAppReducer } from "../AppContext";
import styles from "./AddItemForm.module.css";

// Form to populate todo items
function AddItemForm() {
  const dispatch = useAppReducer();
  let inputRef = useRef<HTMLInputElement>(null);

  function addItem(e: React.FormEvent<HTMLFormElement>) {
    if (!inputRef.current) return;

    const newItem = {
      text: inputRef.current.value,
      key: Date.now(),
      status: "pending",
    } as const;
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
