import React from "react";
import { useAppReducer } from "../AppContext";
import styles from "./Item.module.scss";

function Item({ text, paused, item }) {
  const dispatch = useAppReducer();

  function deleteItem() {
    dispatch({ type: "DELETE_ITEM", item });
  }

  function pauseItem() {
    const pausedItem = Object.assign({}, item, {
      status: "paused"
    });
    dispatch({ type: "UPDATE_ITEM", item: pausedItem });
  }

  function completeItem() {
    const completedItem = Object.assign({}, item, {
      status: "completed"
    });
    console.log(completedItem);
    dispatch({ type: "UPDATE_ITEM", item: completedItem });
  }

  return (
    <div className={styles.item}>
      <div className={styles.itemName}>{text}</div>
      <div className={styles.buttons}>
        <button className={styles.delete} onClick={deleteItem}></button>
        {!paused && <button className={styles.pause} onClick={pauseItem}></button>}
        <button className={styles.complete} onClick={completeItem}></button>
      </div>
    </div>
  );
}

export default Item;
