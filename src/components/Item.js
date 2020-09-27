import React from "react";
import { useAppReducer } from "../AppContext";
import styles from "./Item.module.scss";

// Individual todo item
function Item({ item }) {
  const dispatch = useAppReducer();
  let text = item.text;
  let completed = item.status === "completed";
  let routine = item.status == "routine";
  let logging = item.status == "logging";

  function deleteItem() {
    dispatch({ type: "DELETE_ITEM", item });
  }

  function routineItem(){
    const routinedItem = { ...item, status: "routine" };
    dispatch({ type: "UPDATE_ITEM", item: routinedItem });
  }

  function pauseItem() {
    const pausedItem = { ...item, status: "pending" };
    dispatch({ type: "UPDATE_ITEM", item: pausedItem });
  }

  function loggingItem() {

    const loggingItem = { ...item, status: "logging" };
    const newItem = {
      text: item.text,
      key: Date.now(),
      status: "routine"
    };
    dispatch({ type: "ADD_ITEM", item: newItem });
    dispatch({ type: "UPDATE_ITEM", item: loggingItem });
  }

  function completeItem() {
    if (item.status == "routine") {
      const completedItem = { ...item, status: "completed" };
      dispatch({ type: "UPDATE_ITEM", item: completedItem });
    }
    else {
      const loggingItem = { ...item, status: "logging" };
      dispatch({ type: "UPDATE_ITEM", item: loggingItem });
    }
  }

  return (
    <div className={styles.item} tabIndex="0">
      <div className={styles.itemName}>{text}</div>
      <div
        className={`${styles.buttons} ${completed ? styles.completedButtons : ""}`}
      >
        {!routine && !completed && !logging && (
          <button className={styles.resume} onClick={routineItem} tabIndex="0"></button>
          )}
        {routine && !completed && !logging && (
          <button
            className={styles.pause}
            onClick={pauseItem}
            tabIndex="0"
          ></button>
        )}
        {!completed && !logging  && (
          <button
            className={styles.complete}
            onClick={completeItem}
            tabIndex="0"
          ></button>
        )}
        {!logging && !completed && (
          <button 
              className={styles.delete}
              onClick={deleteItem} 
              tabIndex="0">
          </button>
        )}
        
        {completed && (
          <button 
              className={styles.logging}
              onClick={loggingItem} 
              tabIndex="0">
          </button>
        )}
        
      </div>
    </div>
  );
}

export default Item;
