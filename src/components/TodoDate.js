import React, { useEffect } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { useAppReducer, useAppState } from "../AppContext";
import useDateCheck from "../hooks/useDateCheck";
import useReminderNotification from "../hooks/useReminderNotification";
import styles from "./TodoDate.module.scss";

// Current date at the top of the page
function TodoDate() {
  const dispatch = useAppReducer();
  const { date } = useAppState();

  useDateCheck();
  useReminderNotification();

  let nd = new Date();

  const currentNewDate = {
    dayDisplay: format(nd, "d"),
    day: format(nd, "dd"),
    monthDisplay: format(nd, "MMM"),
    month: format(nd, "MM"),
    year: format(nd, "y"),
    weekday: format(nd, "EEEE")
  };

  useEffect(() => {
    const storedDateToCompare = parseISO(`${date.year}-${date.month}-${date.day}`);

    const currentDate = `${currentNewDate.year}-${currentNewDate.month}-${currentNewDate.day}`;
    const currentDateToCompare = parseISO(currentDate);

    if (isBefore(storedDateToCompare, currentDateToCompare)) {
      dispatch({ type: "RESET_ALL" });
    }
  });

  return (
    <div className={styles.date}>
      <div className={styles.calendar}>
        <div className={styles.day}>{currentNewDate.dayDisplay}</div>
        <div className={styles.my}>
          <div className={styles.month}>{currentNewDate.monthDisplay}</div>
          <div className={styles.year}>{currentNewDate.year}</div>
        </div>
      </div>
      <div className="today">{currentNewDate.weekday}</div>
    </div>
  );
}

export default TodoDate;
