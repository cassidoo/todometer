import React, { useRef } from "react";
import { useAppReducer, useItems } from "../AppContext";
import Item from "./Item";
import Progress from "./Progress";
import styles from "./ItemList.module.scss";

function ItemList() {
  const dispatch = useAppReducer();
  const pendingItems = useItems("pending");
  const completedItems = useItems("completed");
  const pausedItems = useItems("paused");

  let inputRef = useRef();

  function addItem(e) {
    const newItem = {
      text: inputRef.current.value,
      key: Date.now(),
      status: "pending"
    };
    if (!!newItem.text.trim()) {
      dispatch({ type: "ADD_ITEM", item: newItem });
    }
    e.preventDefault();
    inputRef.current.value = "";
    inputRef.current.focus();
  }

  return (
    <div className="item-list">
      <Progress />
      <form className={styles.form} onSubmit={addItem}>
        <input ref={inputRef} placeholder="Add new item" autoFocus />
        <button type="submit" />
      </form>
      {pendingItems &&
        pendingItems.map(item => {
          return (
            <Item item={item} text={item.text} status={item.status} key={item.key} />
          );
        })}
      {pausedItems !== undefined && pausedItems.length > 0 && (
        <>
          <h2>Do Later</h2>
          {pausedItems &&
            pausedItems.map(item => {
              return (
                <Item
                  item={item}
                  text={item.text}
                  status={item.status}
                  key={item.key}
                  paused
                />
              );
            })}
        </>
      )}
      {(completedItems.length > 0 || pausedItems.length > 0) && (
        <div className={styles.reset}>
          <button
            onClick={() => {
              dispatch({ type: "RESET_ALL" });
            }}
          >
            reset progress
          </button>
        </div>
      )}
    </div>
  );
}

export default ItemList;
