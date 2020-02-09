import React, { useEffect } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { useAppReducer, useAppState } from "../AppContext";
import styles from "./TodoDate.module.scss";

// Current date at the top of the page
function TodoDate() {
  let dispatch = useAppReducer();
  let { date } = useAppState();

  const currentNewDate = {
    dayDisplay: format(new Date(), "d"),
    day: format(new Date(), "dd"),
    monthDisplay: format(new Date(), "MMM"),
    month: format(new Date(), "MM"),
    year: format(new Date(), "y"),
    weekday: format(new Date(), "EEEE")
  };

  useEffect(() => {
    const storedDateToCompare = parseISO(`${date.year}-${date.month}-${date.day}`);

    const currentDate = `${currentNewDate.year}-${currentNewDate.month}-${currentNewDate.day}`; // format(new Date(), "yyyy-MM-dd");
    const currentDateToCompare = parseISO(currentDate);

    if (isBefore(storedDateToCompare, currentDateToCompare)) {
      dispatch({
        type: "SET_DATE",
        date: {
          day: currentNewDate.day,
          month: currentNewDate.month,
          year: currentNewDate.year
        }
      });
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
