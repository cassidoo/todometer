import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel
} from "@reach/accordion";
import "@reach/accordion/styles.css";

import { useAppReducer, useItems } from "../AppContext";
import Progress from "./Progress";
import AddItemForm from "./AddItemForm";
import Item from "./Item";
import styles from "./ItemList.module.scss";
import arrow from "../img/arrow.svg";
import alldone from "../img/alldone.svg";

// List of todo items
function ItemList() {
  const dispatch = useAppReducer();
  const pendingItems = useItems("pending");
  const completedItems = useItems("completed");
  const pausedItems = useItems("paused");

  return (
    <div className="item-list">
      <Progress />
      <AddItemForm />
      {pendingItems.length > 0 ? (
        <>
          {pendingItems.map(item => {
            return <Item item={item} key={item.key} />;
          })}
        </>
      ) : (
        <div className={styles.alldone}>
          <img src={alldone} alt="Nothing to do!" />
        </div>
      )}
      <Accordion collapsible multiple>
        {pausedItems.length > 0 && (
          <AccordionItem>
            <AccordionButton className={styles.toggle}>
              <img src={arrow} alt="Do Later Toggle" />
              Do Later
            </AccordionButton>
            <AccordionPanel className={styles.panel}>
              {pausedItems &&
                pausedItems.map(item => {
                  return <Item item={item} key={item.key} />;
                })}
            </AccordionPanel>
          </AccordionItem>
        )}
        {completedItems.length > 0 && (
          <AccordionItem>
            <AccordionButton className={styles.toggle}>
              <img src={arrow} alt="Completed Toggle" /> Completed
            </AccordionButton>
            <AccordionPanel className={styles.panel}>
              {completedItems &&
                completedItems.map(item => {
                  return <Item item={item} key={item.key} />;
                })}
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>

      {(completedItems.length > 0 || pausedItems.length > 0) && (
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
