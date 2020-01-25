import React from "react";

function ItemList({
  text,
  paused,
  item,
  onDelete,
  onPause,
  onComplete
}) {
  // TODO refactor these dumb repeated buttons
  return (
    <div className="item">
      <div className="item-name">{text}</div>
      <div className="buttons">
        <button
          className="delete"
          onClick={() => onDelete(item)}
        ></button>
        {!paused && (
          <button
            className="pause"
            onClick={() => onPause(item)}
          ></button>
        )}
        <button
          className="complete"
          onClick={() => onComplete(item)}
        ></button>
      </div>
    </div>
  );
}

export default ItemList;
