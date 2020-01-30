import React from "react";
import { useAppReducer, useItems } from "../AppContext";
import Progress from "./Progress";
import AddItemForm from "./AddItemForm";
import Item from "./Item";
import styles from "./ItemList.module.scss";

// List of todo items
function ItemList() {
  const dispatch = useAppReducer();
  const pendingItems = useItems("pending");
  const completedItems = useItems("completed");
  const pausedItems = useItems("paused");

  return (
    <div className="item-list">
      <Progress />
      <AddItemForm />
      {pendingItems &&
        pendingItems.map(item => {
          return <Item item={item} key={item.key} />;
        })}
      {pausedItems !== undefined && pausedItems.length > 0 && (
        <>
          <h2>Do Later</h2>
          {pausedItems &&
            pausedItems.map(item => {
              return <Item item={item} key={item.key} />;
            })}
        </>
      )}
      {completedItems !== undefined && completedItems.length > 0 && (
        <>
          <h2>Completed</h2>
          {completedItems &&
            completedItems.map(item => {
              return <Item item={item} key={item.key} />;
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
