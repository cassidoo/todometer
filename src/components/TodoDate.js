import React, { useEffect } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { useAppReducer } from "../AppContext";
import styles from "./TodoDate.module.scss";

// Current date at the top of the page
function TodoDate() {
  let dispatch = useAppReducer();
  const date = {
    day: format(new Date(), "d"),
    month: format(new Date(), "MMM"),
    year: format(new Date(), "y"),
    weekday: format(new Date(), "EEEE")
  };

  useEffect(() => {
    setDate();
    // eslint-disable-next-line
  }, []);

  function setDate() {
    const local = localStorage.getItem("date");
    dispatch({ type: "SET_DATE", date });
    checkDate(local);
  }

  function checkDate(local) {
    const currentDate = format(new Date(), "yyyy-MM-dd");
    const currentDateToCompare = parseISO(currentDate);
    const localDateToCompare = parseISO(local);

    if (local !== null && isBefore(localDateToCompare, currentDateToCompare)) {
      dispatch({ type: "RESET_ALL" });
      localStorage.setItem("date", currentDate);
    }
  }

  return (
    <div className={styles.date}>
      <div className={styles.calendar}>
        <div className={styles.day}>{date.day}</div>
        <div className={styles.my}>
          <div className={styles.month}>{date.month}</div>
          <div className={styles.year}>{date.year}</div>
        </div>
      </div>
      <div className="today">{date.weekday}</div>
    </div>
  );
}

export default TodoDate;
