import React, { useEffect } from "react";
import moment from "moment";
import { useAppReducer } from "../AppContext";
import styles from "./Date.module.scss";

// Current date at the top of the page
function Date() {
  let dispatch = useAppReducer();
  const date = {
    day: moment().date(),
    month: moment().format("MMM"),
    year: moment().year(),
    weekday: moment().format("dddd")
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
    if (local !== null && moment(local).isBefore(moment().format("MM-DD-YYYY"))) {
      dispatch({ type: "RESET_ALL" });
    }
    localStorage.setItem("date", moment().format("MM-DD-YYYY"));
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

export default Date;
