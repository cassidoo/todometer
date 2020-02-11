import { useEffect } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { useAppState } from "../AppContext";

export default function useDateCheck() {
  const { date } = useAppState();
  const storedDate = parseISO(`${date.year}-${date.month}-${date.day}`);

  useEffect(() => {
    const interval = setInterval(() => {
      let currentDate = parseISO(
        `${format(new Date(), "y")}-${format(new Date(), "MM")}-${format(
          new Date(),
          "dd"
        )}`
      );

      if (isBefore(storedDate, currentDate)) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [storedDate]);
}
