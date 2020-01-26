import React from "react";
import { useAppReducer } from "../AppContext";

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
    <div className="item">
      <div className="item-name">{text}</div>
      <div className="buttons">
        <button className="delete" onClick={deleteItem}></button>
        {!paused && <button className="pause" onClick={pauseItem}></button>}
        <button className="complete" onClick={completeItem}></button>
      </div>
    </div>
  );
}

export default Item;
