import React, { useRef } from "react";
import { useAppReducer, useItems } from "../AppContext";

function ItemList() {
  let dispatch = useAppReducer();
  let pendingItems = useItems("pending");
  let completedItems = useItems("completed");
  let pausedItems = useItems("paused");

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
      {/* {this.renderProgress()} */}
      {/* TODO: Put progress bar in its own component */}
      <form className="form" onSubmit={addItem}>
        <input ref={inputRef} placeholder="Add new item" autoFocus />
        <button type="submit" />
      </form>
      {pendingItems &&
        pendingItems.map(item => {
          return null;
          // <Item
          //   item={item}
          //   text={item.text}
          //   status={item.status}
          //   key={item.key}
          //   onComplete={this.completeItem}
          //   onDelete={this.props.deleteItem}
          //   onPause={this.pauseItem}
          // />
        })}
      {/* {this.renderPaused()}
      {this.renderReset()} */}
      {(completedItems.length > 0 || pausedItems.length > 0) && (
        <div className="reset">
          {/* TODO fix reset */}
          <button onClick={() => {}}>reset progress</button>
        </div>
      )}
    </div>
  );
}

export default ItemList;
