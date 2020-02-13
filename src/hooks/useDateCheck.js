import { useEffect } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { useAppState } from "../AppContext";
const { remote } = require("electron");

export default function useDateCheck() {
  const { date } = useAppState();
  const storedDate = parseISO(`${date.year}-${date.month}-${date.day}`);

  useEffect(() => {
    let nd = new Date();

    const interval = setInterval(() => {
      let currentDate = parseISO(
        `${format(nd, "y")}-${format(nd, "MM")}-${format(nd, "dd")}`
      );

      if (isBefore(storedDate, currentDate)) {
        if (remote.getCurrentWindow().showResetNotification) {
          // Disabling this line so that it doesn't yell at us for not using
          // the notification variable
          // eslint-disable-next-line
          let resetNotification = new Notification("todometer reset time!", {
            body: "It's a new day! Your todos are being reset."
          });
        }
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [storedDate]);
}
