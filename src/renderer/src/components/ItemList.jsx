import {
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
} from "@reach/accordion";
import "@reach/accordion/styles.css";

import { useAppReducer, useItems } from "../AppContext.jsx";
import Progress from "./Progress.jsx";
import AddItemForm from "./AddItemForm.jsx";
import Item from "./Item.jsx";
import styles from "./ItemList.module.css";
import arrow from "../img/arrow.svg";
import alldone from "../img/alldone.svg";

// List of todo items
function ItemList() {
	const dispatch = useAppReducer();
	const { pending, paused, completed } = useItems();

	return (
		<div className="item-list">
			<Progress />
			<AddItemForm />
			{pending.length > 0 ? (
				<>
					{pending.map((item) => {
						return <Item item={item} key={item.key} />;
					})}
				</>
			) : (
				<div className={styles.alldone}>
					<img src={alldone} alt="Nothing to do!" />
				</div>
			)}
			<Accordion collapsible multiple>
				{paused.length > 0 && (
					<AccordionItem>
						<AccordionButton className={styles.toggle}>
							<img src={arrow} alt="Do Later Toggle" />
							<span>Do Later</span>
						</AccordionButton>
						<AccordionPanel className={styles.panel}>
							{paused &&
								paused.map((item) => {
									return <Item item={item} key={item.key} />;
								})}
						</AccordionPanel>
					</AccordionItem>
				)}
				{completed.length > 0 && (
					<AccordionItem>
						<AccordionButton className={styles.toggle}>
							<img src={arrow} alt="Completed Toggle" /> <span>Completed</span>
						</AccordionButton>
						<AccordionPanel className={styles.panel}>
							{completed &&
								completed.map((item) => {
									return <Item item={item} key={item.key} />;
								})}
						</AccordionPanel>
					</AccordionItem>
				)}
			</Accordion>

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
