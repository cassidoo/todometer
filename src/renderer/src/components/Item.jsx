import React, { useState } from "react";
import { useAppReducer } from "../AppContext.jsx";
import EditModal from "./EditModal.jsx"; // Import the modal component
import styles from "./Item.module.css";

function Item({ item }) {
  const dispatch = useAppReducer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  let text = item.text;
  let paused = item.status === "paused";
  let completed = item.status === "completed";

  function deleteItem() {
    dispatch({ type: "DELETE_ITEM", item });
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

  // Function to handle saving the edited item
  function handleEditSave(newText) {
    const updatedItem = { ...item, text: newText };
    dispatch({ type: "UPDATE_ITEM", item: updatedItem });
  }

  return (
    <div className={styles.item} tabIndex="0">
      <div className={styles.itemname}>{text}</div>
      <div
        className={`${styles.buttons} ${
          completed ? styles.completedButtons : ""
        }`}
      >
        {completed && <button className={styles.empty} tabIndex="0"></button>}
        <button className={styles.delete} onClick={deleteItem} tabIndex="0"></button>
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
            className={styles.edit}
            onClick={() => setIsModalOpen(true)} // Open the modal when editing
            tabIndex="0"
          >
            
          </button>
        )}
        {!completed && (
          <button
            className={styles.complete}
            onClick={completeItem}
            tabIndex="0"
          ></button>
        )}
      </div>

      {/* Render the modal when it's open */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Close the modal
        onSave={handleEditSave} // Save the new text
        initialText={item.text}
      />
    </div>
  );
}

export default Item;
