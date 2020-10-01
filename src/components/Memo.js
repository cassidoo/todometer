import React, { useRef } from "react";
import { useAppReducer } from "../AppContext";
import styles from "./AddItemForm.module.scss";
// import SimpleMDE from "simplemde";

// import s from "../js/renderer.js";
// Form to populate todo items
function Memo({ item }) {
  const dispatch = useAppReducer();
  
  let inputRef = useRef();
  function addItem(e) {
    const newItem = {
        text: item.text,
        key: item.key,
        status: item.status,
        memo: inputRef.current.value,
      };

    if (!!newItem.memo.trim()) {
      dispatch({ type: "ADD_MEMO", item: newItem });
    }
    e.preventDefault();

  }

  function livetime(value) {
    const newItem = {
        text: item.text,
        key: item.key,
        status: item.status,
        memo: value,
      };

    if (!!newItem.memo.trim()) {
      dispatch({ type: "ADD_MEMO", item: newItem });
    }

  }

  return (
    // <TextInput className={styles.form} 
    // onChange={ e => addItem(e.currentTarget.value)} 
    // placeholder="Start typing..." >  </TextInput>
    <form className={styles.form} onSubmit={addItem}>
    <input onChange={ e => livetime(e.currentTarget.value)} id="text-area" ref={inputRef} placeholder="Add here" value={item.memo} autoFocus />
    <button type="submit" />
  </form>
  );
}

export default Memo;
