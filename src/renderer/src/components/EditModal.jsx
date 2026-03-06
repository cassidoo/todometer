import React, { useState } from "react";
import styles from "./EditModal.module.css"; // Import styles

const EditModal = ({ isOpen, onClose, onSave, initialText }) => {
  const [newText, setNewText] = useState(initialText);

  const handleSave = () => {
    if (newText.trim() !== "") {
      onSave(newText);
      onClose();
    }
  };

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ""}`}>
      <div className={styles.modalContent}>
        <h2>Edit Item</h2>
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSave}>Save & Close</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditModal;
