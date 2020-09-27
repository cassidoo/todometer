import React from "react";
import { useItems, useAppState } from "../AppContext";

import styles from "./Progress.module.scss";
import { remote } from "electron";


// Timer bar for reset todo items
function Timer() {
  const { routine, completed, pending, paused, timePercentage } = useItems();
  const pausedAmount = paused.length;
  const pendingAmount = pending.length;
  const completedAmount = completed.length;
  const routineAmount = routine.length;
  const totalAmount = pendingAmount + completedAmount + routineAmount;

  let completedPercentage = completedAmount / totalAmount;
  let timePercent = timePercentage[0].timePercentage

  return (
    <div className={styles.progress}>
      {timePercent < 0.5 ? (
        
        <div
          className={`${styles.progressbar} ${styles.paused}`}
          style={{ width: `${timePercent * 100}%` }}
        ></div>

      ):
        ( <div
            className={`${styles.progressbar} ${styles.completed}`}
            style={{ width: `${timePercent * 100}%` }}
          ></div>)};
    </div>
  );
}

export default Timer;
