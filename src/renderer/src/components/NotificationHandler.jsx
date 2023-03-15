import { useEffect } from "react";
import useExampleNotification from "../hooks/useExampleNotification";

const NotificationHandler = () => {
	// const [notificationData, setNotificationData] = React.useState(null);
	const { message, title } = notificationData || {};

	// Call the useExampleNotification hook with the notification data
	useExampleNotification(message, title);

	useEffect(() => {
		window?.onExampleNotification?.((message, title) => {
			useExampleNotification(message, title);
		});
	}, [window]);

	// useEffect(() => {
	// 	const handleSendNotification = (event, data) => {
	// 		setNotificationData(data);
	// 	};

	// 	// Listen for the 'send-notification' event from the main process
	// 	ipcRenderer.on("send-notification", handleSendNotification);

	// 	return () => {
	// 		// Clean up the listener when the component unmounts
	// 		ipcRenderer.removeListener("send-notification", handleSendNotification);
	// 	};
	// }, []);

	return null;
};

export default NotificationHandler;
