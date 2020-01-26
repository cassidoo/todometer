import React, { useEffect } from "react";
import moment from "moment";

import { useAppReducer } from "../AppContext";

function Date() {
  let dispatch = useAppReducer();
  const date = {
    day: moment().date(),
    month: moment().format("MMM"),
    year: moment().year(),
    weekday: moment().format("dddd")
  };

  function checkDate(local) {
    if (local !== null && moment(local).isBefore(moment().format("MM-DD-YYYY"))) {
      dispatch({ type: "RESET_ALL" });
    }
    localStorage.setItem("date", moment().format("MM-DD-YYYY"));
  }

  function setDate() {
    const local = localStorage.getItem("date");
    dispatch({ type: "SET_DATE", date });
    checkDate(local);
  }

  useEffect(() => {
    setDate();
  }, []);

  return (
    <div className="date">
      <div className="calendar">
        <div className="day">{date.day}</div>
        <div className="my">
          <div className="month">{date.month}</div>
          <div className="year">{date.year}</div>
        </div>
      </div>
      <div className="today">{date.weekday}</div>
    </div>
  );
}

export default Date;
