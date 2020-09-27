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
  const { pending, completed, routine, logging } = useItems();

  return (
    <div className="item-list">
      <Progress />
      <AddItemForm />
      {pending.length > 0 ? (
        <>
          {pending.map(item => {
            return <Item item={item} key={item.key} />;
          })}
        </>
      ) : (
        <div></div>
      )}

      <Accordion collapsible multiple>
        {(routine.length > 0 || completed.length > 0) && (
          <AccordionItem>
            <AccordionButton className={styles.toggle}>
              <img src={arrow} alt="Routine" />
              <span>Routine</span>
            </AccordionButton>
            <AccordionPanel className={styles.panel}>
              {routine.length > 0 ? (
                routine.map(item => {
                  return <Item item={item} key={item.key} />;
                })):(
                  <div className={styles.alldone}>
                  <img src={alldone} alt="Routine" />
                  </div> 
                )}
                <Progress />
              {completed &&
                completed.map(item => {
                  return <Item item={item} key={item.key} />;
                })}
            </AccordionPanel>
          </AccordionItem>
        )}

        {logging.length > 0 && (
          <AccordionItem>
            <AccordionButton className={styles.toggle}>
              <img src={arrow} alt="Logging Toggle" /> <span>Logging</span>
            </AccordionButton>
            <AccordionPanel className={styles.panel}>
              {logging &&
                logging.map(item => {
                  return <Item item={item} key={item.key} />;
                })}
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
      

      {(completed.length > 0 || logging.length > 0) && (
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
