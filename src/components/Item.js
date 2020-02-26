import React from "react";

// Individial todo item
function Item({ item }) {
  return (
    <div tabIndex="0">
      <p>{item.name}</p>
    </div>
  );
}

export default Item;
