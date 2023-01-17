import { useEffect } from "react";
import { useItems } from "../AppContext.jsx";

function getTimeCondition(nd, notificationInterval) {
	let condition = false;

	switch (notificationInterval) {
		case "hour":
			condition = nd.getMinutes() === 0 && nd.getSeconds() === 0;
			break;
		case "halfhour":
			condition = nd.getMinutes() % 30 === 0 && nd.getSeconds() === 0;
			break;
		case "quarterhour":
			condition = nd.getMinutes() % 15 === 0 && nd.getSeconds() === 0;
			break;
		case "fiveminutes":
			condition = nd.getMinutes() % 5 === 0 && nd.getSeconds() === 0;
			break;
		default:
			break;
	}

	return condition;
}

export default function useReminderNotification() {
	const { pending, paused } = useItems();

	useEffect(() => {
		let notificationInterval = null;

		window?.onNotificationSettingsChange?.((data) => {
			notificationInterval = data.reminderNotification;
		});

		const interval = setInterval(() => {
			let nd = new Date();

			// sends a notification if reminder notifications are enabled,
			// and todos are not completed
			if (
				getTimeCondition(nd, notificationInterval) &&
				(pending.length > 0 || paused.length > 0)
			) {
				let text = `Don't forget, you have ${
					pending.length + paused.length
				} tasks to do today (${pending.length} incomplete, ${
					paused.length
				} paused for later)`;

				new Notification("todometer reminder!", {
					body: text,
				});
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [pending.length, paused.length]);
}
