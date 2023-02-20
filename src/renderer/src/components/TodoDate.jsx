import { useAppState } from "../AppContext.jsx";
import useDateCheck from "../hooks/useDateCheck.js";
import useReminderNotification from "../hooks/useReminderNotification.js";
import styles from "./TodoDate.module.css";

// Current date at the top of the page
function TodoDate() {
	const { date } = useAppState();

	useDateCheck();
	useReminderNotification();

	return (
		<div className={styles.date}>
			<div className={styles.calendar}>
				<div className={styles.day}>{date.dayDisplay}</div>
				<div className={styles.my}>
					<div className={styles.month}>{date.monthDisplay}</div>
					<div className={styles.year}>{date.year}</div>
				</div>
			</div>
			<div className="today">{date.weekday}</div>
		</div>
	);
}

export default TodoDate;
