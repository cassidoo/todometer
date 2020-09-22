import React from "react";
import { useAppReducer } from "../AppContext";
import styles from "./Item.module.scss";

// Individual todo item
function Item({ item }) {
  const dispatch = useAppReducer();
  let text = item.text;
  let paused = item.status === "paused";
  let completed = item.status === "completed";
  let routine = item.status == "routine";

  function deleteItem() {
    dispatch({ type: "DELETE_ITEM", item });
  }

  function routineItem(){
    const routinedItem = { ...item, status: "routine" };
    dispatch({ type: "UPDATE_ITEM", item: routinedItem });
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
    if (item.status == "routine") {
      const newItem = {
        text: item.text,
        key: Date.now(),
        status: "routine"
      };
      dispatch({ type: "ADD_ITEM", item: newItem });
    }
    dispatch({ type: "UPDATE_ITEM", item: completedItem });
  }

  return (
    <div className={styles.item} tabIndex="0">
      <div className={styles.itemName}>{text}</div>
      <div
        className={`${styles.buttons} ${completed ? styles.completedButtons : ""}`}
      >
        <button className={styles.delete} onClick={deleteItem} tabIndex="0"></button>
        {!paused && !completed && (
          <button className={styles.pause} onClick={pauseItem} tabIndex="0"></button>
          )}
        { !paused && !routine && !completed && (
          <button className={styles.routine} onClick={routineItem} tabIndex="0"></button>
          )
        }
        {paused && !completed && (
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
      </div>
    </div>
  );
}

export default Item;
