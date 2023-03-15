import { useEffect } from "react";
import { isNotificationsEnabled } from "@meetfranz/electron-notification-state";
import notificationPing from "../notification/pingyping.mp3";

const useExampleNotification = (message) => {
	useEffect(() => {
		const sendNotification = async () => {
			if (!isNotificationsEnabled()) {
				console.warn("Desktop notifications are disabled");
				return;
			}

			const audio = new Audio(notificationPing);
			audio.play();

			const notification = new Notification("todometer", {
				body: message,
				silent: true, // We're playing our own sound
			});

			notification.onclick = () => {
				console.log("Notification clicked");
			};
		};

		if (message) {
			sendNotification();
		}
	}, [message, title]);
};

export default useExampleNotification;
