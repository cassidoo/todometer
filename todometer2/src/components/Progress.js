import React from "react";
import { useItems, useAppState } from "../AppContext";

import styles from "./Progress.module.scss";

function Progress() {
  const totalAmount = useAppState().items.length;
  const completedAmount = useItems("completed").length;
  const pausedAmount = useItems("paused").length;

  let completedPercentage = completedAmount / totalAmount;
  let pausedPercentage = pausedAmount / totalAmount + completedPercentage;

  if (isNaN(completedPercentage)) {
    completedPercentage = 0;
  }

  if (isNaN(pausedPercentage)) {
    pausedPercentage = 0;
  }

  return (
    <div className={styles.progress}>
      <div
        className={`${styles.progressbar} ${styles.paused}`}
        style={{ width: `${pausedPercentage * 100}%` }}
      ></div>
      <div
        className={`${styles.progressbar} ${styles.completed}`}
        style={{ width: `${completedPercentage * 100}%` }}
      ></div>
    </div>
  );
}

export default Progress;
