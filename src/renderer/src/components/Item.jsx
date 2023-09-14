import { useState, useRef } from "react";
import { useAppReducer } from "../AppContext.jsx";
import styles from "./Item.module.css";

// Individual todo item
function Item({ item }) {
  const dispatch = useAppReducer();

  const [isEditMode, setIsEditMode] = useState(false);
  const editValueRef = useRef(item.text);

  let text = item.text;
  let paused = item.status === "paused";
  let completed = item.status === "completed";

  function deleteItem() {
    dispatch({ type: "DELETE_ITEM", item });
  }

  function editItem() {
    const editedValue =
      editValueRef.current.value === "" ? text : editValueRef.current.value;
    const editedItem = { ...item, text: editedValue };
    dispatch({ type: "UPDATE_ITEM", item: editedItem });
    setIsEditMode(false);
  }

  function pauseItem() {
    const pausedItem = { ...item, status: "paused" };
    dispatch({ type: "UPDATE_ITEM", item: pausedItem });
  }

  function resumeItem() {
    const pendingItem = { ...item, status: "pending" };
    dispatch({ type: "UPDATE_ITEM", item: pendingItem });
  }

  function completeItem() {
    const completedItem = { ...item, status: "completed" };
    dispatch({ type: "UPDATE_ITEM", item: completedItem });
  }

  return (
    <div className={styles.item} tabIndex="0">
      {isEditMode && (
        <form onSubmit={() => editItem()} className={styles.editform}>
          <input
            ref={editValueRef}
            defaultValue={text}
            autoFocus
            onBlur={() => editItem()}
          />
        </form>
      )}
      {!isEditMode && (
        <div
          className={styles.itemname}
          onDoubleClick={() => setIsEditMode(true)}
        >
          {text}
        </div>
      )}
      {!isEditMode && (
        <div
          className={`${styles.buttons} ${
            completed ? styles.completedButtons : ""
          }`}
        >
          <button
            className={styles.edit}
            onClick={() => setIsEditMode(true)}
            tabIndex="0"
          ></button>
          <button
            className={styles.delete}
            onClick={deleteItem}
            tabIndex="0"
          ></button>
          {!paused && !completed && (
            <button
              className={styles.pause}
              onClick={pauseItem}
              tabIndex="0"
            ></button>
          )}
          {(paused || completed) && (
            <button
              className={styles.resume}
              onClick={resumeItem}
              tabIndex="0"
            ></button>
          )}
          {!completed && (
            <button
              className={styles.complete}
              onClick={completeItem}
              tabIndex="0"
            ></button>
          )}

          {completed && <button className={styles.empty} tabIndex="0"></button>}
        </div>
      )}
    </div>
  );
}

export default Item;
