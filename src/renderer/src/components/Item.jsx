import { useEffect, useRef, useState } from "react";
import { useAppReducer } from "../AppContext.jsx";
import styles from "./Item.module.css";

// Individual todo item
function Item({ item }) {
	const dispatch = useAppReducer();
	const [isEditing, setIsEditing] = useState(false);
	const [draftText, setDraftText] = useState(item.text);
	const inputRef = useRef();
	const itemnameRef = useRef();
	let text = item.text;
	let paused = item.status === "paused";
	let completed = item.status === "completed";

	useEffect(() => {
		if (!isEditing) {
			setDraftText(item.text);
		}
	}, [item.text, isEditing]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	useEffect(() => {
		if (!isEditing || !inputRef.current) {
			return;
		}

		inputRef.current.style.height = "auto";
		inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
	}, [draftText, isEditing]);

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

	function startEdit() {
		setIsEditing(true);
	}

	function cancelEdit() {
		setDraftText(item.text);
		setIsEditing(false);
	}

	function commitEdit() {
		const trimmedText = draftText.trim();

		if (!trimmedText) {
			setDraftText(item.text);
			setIsEditing(false);
			return;
		}

		if (trimmedText !== item.text) {
			dispatch({ type: "UPDATE_ITEM", item: { ...item, text: trimmedText } });
		}

		setIsEditing(false);
	}

	function handleEditKeyDown(event) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			commitEdit();
		}

		if (event.key === "Escape") {
			cancelEdit();
		}
	}

	function handleItemKeyDown(event) {
		if (event.currentTarget !== event.target || isEditing) {
			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			itemnameRef.current?.focus();
		}
	}

	return (
		<div
			className={`${styles.item} ${isEditing ? styles.editing : ""}`}
			tabIndex="0"
			onKeyDown={handleItemKeyDown}
		>
			{isEditing ? (
				<textarea
					ref={inputRef}
					className={styles.editInput}
					value={draftText}
					onChange={(event) => {
						setDraftText(event.target.value);
					}}
					onBlur={commitEdit}
					onKeyDown={handleEditKeyDown}
					rows={Math.max(draftText.split("\n").length, 1)}
				/>
			) : (
				<button
					type="button"
					ref={itemnameRef}
					className={styles.itemname}
					onClick={startEdit}
				>
					{text}
				</button>
			)}
			<div
				className={`${styles.buttons} ${
					completed ? styles.completedButtons : ""
				}`}
			>
				{completed && <button className={styles.empty} tabIndex="-1"></button>}
				<button
					type="button"
					className={styles.delete}
					onClick={deleteItem}
					tabIndex="0"
				></button>
				{!paused && !completed && (
					<button
						type="button"
						className={styles.pause}
						onClick={pauseItem}
						tabIndex="0"
					></button>
				)}
				{(paused || completed) && (
					<button
						type="button"
						className={styles.resume}
						onClick={resumeItem}
						tabIndex="0"
					></button>
				)}
				{!completed && (
					<button
						type="button"
						className={styles.complete}
						onClick={completeItem}
						tabIndex="0"
					></button>
				)}
			</div>
		</div>
	);
}

export default Item;
