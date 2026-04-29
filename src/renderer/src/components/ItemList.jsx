import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

import { useAppReducer, useItems } from "../AppContext.jsx";
import Progress from "./Progress.jsx";
import AddItemForm from "./AddItemForm.jsx";
import Item from "./Item.jsx";
import styles from "./ItemList.module.css";
import itemStyles from "./Item.module.css";
import arrow from "../img/arrow.svg";
import alldone from "../img/alldone.svg";

function DroppableSection({ id, children, className }) {
	const { ref } = useDroppable({
		id,
		type: "section",
		accept: "item",
		collisionPriority: CollisionPriority.Low,
	});

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

// Droppable zone over a collapsed accordion header.
// When an item is dragged over this, it will be placed at index 0 of that group.
// Hovering for EXPAND_DELAY ms triggers expansion.
const EXPAND_DELAY = 1000;

function DroppableHeader({
	id,
	children,
	isDragging,
	isOpen,
	onExpandRequest,
}) {
	const { ref, isDropTarget } = useDroppable({
		id,
		type: "section-header",
		accept: "item",
		collisionPriority: CollisionPriority.High,
		disabled: !isDragging || isOpen,
	});
	const timerRef = useRef(null);

	useEffect(() => {
		if (isDropTarget && !isOpen) {
			timerRef.current = setTimeout(() => {
				onExpandRequest();
			}, EXPAND_DELAY);
		}
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [isDropTarget, isOpen, onExpandRequest]);

	return (
		<div
			ref={ref}
			className={`${styles.headerDropZone} ${isDropTarget ? styles.headerDropTarget : ""}`}
		>
			{children}
		</div>
	);
}

const STATUS_LABELS = {
	pending: "Mark as todo",
	paused: "Mark as todo later",
	completed: "Mark as completed",
};

function ItemList() {
	const dispatch = useAppReducer();
	const { pending, paused, completed } = useItems();

	const itemMap = useMemo(() => {
		const map = new Map();
		for (const item of [...pending, ...paused, ...completed]) {
			map.set(item.key, item);
		}
		return map;
	}, [pending, paused, completed]);

	const [localKeys, setLocalKeys] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [currentDragId, setCurrentDragId] = useState(null);
	const [dragInitialGroup, setDragInitialGroup] = useState(null);
	const [accordionValue, setAccordionValue] = useState([]);
	// Sections manually expanded by hovering during a drag — kept open after drop
	const expandedDuringDrag = useRef(new Set());

	const expandSection = useCallback((accordionKey) => {
		expandedDuringDrag.current.add(accordionKey);
		setAccordionValue((prev) =>
			prev.includes(accordionKey) ? prev : [...prev, accordionKey],
		);
	}, []);

	const isPausedOpen = accordionValue.includes("do-later");
	const isCompletedOpen = accordionValue.includes("completed");

	const requestExpandPaused = useCallback(
		() => expandSection("do-later"),
		[expandSection],
	);
	const requestExpandCompleted = useCallback(
		() => expandSection("completed"),
		[expandSection],
	);

	// Derive render groups from local drag state or global state
	const renderGroups = useMemo(() => {
		if (localKeys) {
			return {
				pending: localKeys.pending.map((k) => itemMap.get(k)).filter(Boolean),
				paused: localKeys.paused.map((k) => itemMap.get(k)).filter(Boolean),
				completed: localKeys.completed
					.map((k) => itemMap.get(k))
					.filter(Boolean),
			};
		}
		return { pending, paused, completed };
	}, [localKeys, itemMap, pending, paused, completed]);

	// Current group of the dragged item (for overlay label)
	const currentDragGroup = useMemo(() => {
		if (!currentDragId || !localKeys) return null;
		for (const [group, keys] of Object.entries(localKeys)) {
			if (keys.includes(currentDragId)) return group;
		}
		return null;
	}, [localKeys, currentDragId]);

	function handleDragStart(event) {
		const { source } = event.operation;
		setIsDragging(true);
		setCurrentDragId(source.id);
		expandedDuringDrag.current = new Set();

		setLocalKeys({
			pending: pending.map((i) => i.key),
			paused: paused.map((i) => i.key),
			completed: completed.map((i) => i.key),
		});

		let group = null;
		if (pending.some((i) => i.key === source.id)) group = "pending";
		else if (paused.some((i) => i.key === source.id)) group = "paused";
		else if (completed.some((i) => i.key === source.id)) group = "completed";
		setDragInitialGroup(group);
	}

	function handleDragOver(event) {
		event.preventDefault();

		const { source, target } = event.operation;
		if (!source || !target || source.id === target.id) return;

		setLocalKeys((prevKeys) => {
			if (!prevKeys) return prevKeys;

			const sourceId = source.id;

			let sourceGroup = null;
			let sourceIndex = -1;
			for (const [group, keys] of Object.entries(prevKeys)) {
				const idx = keys.indexOf(sourceId);
				if (idx !== -1) {
					sourceGroup = group;
					sourceIndex = idx;
					break;
				}
			}
			if (sourceGroup === null) return prevKeys;

			let targetGroup, targetIndex;

			if (target.type === "section-header") {
				// Dragged over a collapsed header — insert at top of that group
				targetGroup = target.id.replace("-header", "");
				targetIndex = 0;
				// Don't count the source if it's already in that group
				if (sourceGroup === targetGroup) return prevKeys;
			} else if (target.type === "section") {
				// Hovering over a section container — add to end
				targetGroup = target.id;
				targetIndex = prevKeys[targetGroup]?.length ?? 0;
				if (sourceGroup === targetGroup) return prevKeys;
			} else {
				// Hovering over another item — find its position
				for (const [group, keys] of Object.entries(prevKeys)) {
					const idx = keys.indexOf(target.id);
					if (idx !== -1) {
						targetGroup = group;
						targetIndex = idx;
						break;
					}
				}
			}

			if (!targetGroup || prevKeys[targetGroup] === undefined) return prevKeys;

			// Only update if the source and target positions are different
			if (sourceGroup === targetGroup && sourceIndex === targetIndex)
				return prevKeys;

			const newKeys = { ...prevKeys };

			if (sourceGroup === targetGroup) {
				// Same group reorder
				const list = [...prevKeys[sourceGroup]];
				list.splice(sourceIndex, 1);
				list.splice(targetIndex, 0, sourceId);
				newKeys[sourceGroup] = list;
			} else {
				// Cross-group move
				const sourceList = [...prevKeys[sourceGroup]];
				sourceList.splice(sourceIndex, 1);
				const targetList = [...prevKeys[targetGroup]];
				targetList.splice(targetIndex, 0, sourceId);
				newKeys[sourceGroup] = sourceList;
				newKeys[targetGroup] = targetList;
			}

			return newKeys;
		});
	}

	function handleDragEnd(event) {
		setIsDragging(false);
		setCurrentDragId(null);
		setDragInitialGroup(null);

		if (event.canceled || !localKeys) {
			setLocalKeys(null);
			return;
		}

		const newItems = [];
		for (const [status, keys] of Object.entries(localKeys)) {
			for (const key of keys) {
				const item = itemMap.get(key);
				if (item) {
					newItems.push(item.status === status ? item : { ...item, status });
				}
			}
		}

		dispatch({ type: "SET_ITEMS", items: newItems });
		setLocalKeys(null);
	}

	const showCrossGroupLabel =
		currentDragGroup &&
		dragInitialGroup &&
		currentDragGroup !== dragInitialGroup;

	return (
		<div className="item-list">
			<Progress />
			<AddItemForm />
			<DragDropProvider
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<DroppableSection id="pending" className={styles.droppableSection}>
					{renderGroups.pending.length > 0 || isDragging ? (
						renderGroups.pending.map((item, idx) => (
							<Item item={item} key={item.key} index={idx} group="pending" />
						))
					) : (
						<div className={styles.alldone}>
							<img src={alldone} alt="Nothing to do!" />
						</div>
					)}
				</DroppableSection>

				<Accordion.Root
					type="multiple"
					value={accordionValue}
					onValueChange={setAccordionValue}
				>
					{(renderGroups.paused.length > 0 || isDragging) && (
						<Accordion.Item value="do-later">
							<DroppableHeader
								id="paused-header"
								isDragging={isDragging}
								isOpen={isPausedOpen}
								onExpandRequest={requestExpandPaused}
							>
								<Accordion.Header>
									<Accordion.Trigger className={styles.toggle}>
										<img src={arrow} alt="Later Toggle" />
										<span>Later</span>
									</Accordion.Trigger>
								</Accordion.Header>
							</DroppableHeader>
							<Accordion.Content className={styles.panel}>
								<DroppableSection
									id="paused"
									className={styles.droppableSection}
								>
									{renderGroups.paused.map((item, idx) => (
										<Item
											item={item}
											key={item.key}
											index={idx}
											group="paused"
										/>
									))}
								</DroppableSection>
							</Accordion.Content>
						</Accordion.Item>
					)}
					{(renderGroups.completed.length > 0 || isDragging) && (
						<Accordion.Item value="completed">
							<DroppableHeader
								id="completed-header"
								isDragging={isDragging}
								isOpen={isCompletedOpen}
								onExpandRequest={requestExpandCompleted}
							>
								<Accordion.Header>
									<Accordion.Trigger className={styles.toggle}>
										<img src={arrow} alt="Completed Toggle" />{" "}
										<span>Completed</span>
									</Accordion.Trigger>
								</Accordion.Header>
							</DroppableHeader>
							<Accordion.Content className={styles.panel}>
								<DroppableSection
									id="completed"
									className={styles.droppableSection}
								>
									{renderGroups.completed.map((item, idx) => (
										<Item
											item={item}
											key={item.key}
											index={idx}
											group="completed"
										/>
									))}
								</DroppableSection>
							</Accordion.Content>
						</Accordion.Item>
					)}
				</Accordion.Root>

				<DragOverlay>
					{(source) => {
						const item = itemMap.get(source.id);
						if (!item) return null;

						return (
							<div className={itemStyles.dragOverlay}>
								<span>{item.text}</span>
								{showCrossGroupLabel && (
									<div
										className={[
											itemStyles.dragOverlayLabel,
											itemStyles[currentDragGroup],
										].join(" ")}
									>
										{STATUS_LABELS[currentDragGroup]}
									</div>
								)}
							</div>
						);
					}}
				</DragOverlay>
			</DragDropProvider>

			{(completed.length > 0 || paused.length > 0) && (
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
