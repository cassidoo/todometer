import { useEffect } from "react";
import { remote } from "electron";
import { useItems } from "../AppContext";

function getTimeCondition(nd) {
  let condition = false;

  switch (remote.getGlobal("notificationSettings").reminderNotification) {
    case "hour":
      condition = nd.getMinutes() === 0 && nd.getSeconds() === 0;
      break;
    case "halfhour":
      condition = nd.getMinutes() % 30 === 0 && nd.getSeconds() === 0;
      break;
    case "quarterhour":
      condition = nd.getMinutes() % 15 === 0 && nd.getSeconds() === 0;
      break;
    default:
      break;
  }

  return condition;
}

export default function useReminderNotification() {
  const { pending, paused } = useItems();

  useEffect(() => {
    const interval = setInterval(() => {
      let nd = new Date();

      // sends a notification if reminder notifications are enabled,
      // and todos are not completed
      if (getTimeCondition(nd) && (pending.length > 0 || paused.length > 0)) {
        let text = `Don't forget, you have ${pending.length +
          paused.length} tasks to do today (${pending.length} incomplete, ${
          paused.length
        } paused for later)`;

        new Notification("todometer reminder!", {
          body: text
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pending.length, paused.length]);
}
