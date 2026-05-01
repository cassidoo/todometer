import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SettingsDrawer.module.css";

const REMINDER_OPTIONS = [
	{ value: "never", label: "Never" },
	{ value: "fiveminutes", label: "Every 5 minutes" },
	{ value: "quarterhour", label: "Every 15 minutes" },
	{ value: "halfhour", label: "Every 30 minutes" },
	{ value: "hour", label: "Every hour" },
];

const DOCS_URL =
	"https://github.com/cassidoo/todometer/blob/main/docs/api-and-mcp-setup.md";

const SECTION_INFO = {
	notifications: "Control how and when you receive notifications.",
	data: "Manage where your data is stored.",
	display: "Enable extra buttons on the interface.",
	api: "Query and control your todometer data from other applications using the local API.",
};

function InfoButton({ text }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		if (!open) return;
		function handleClick(e) {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	return (
		<span className={styles.infoWrapper} ref={ref}>
			<button
				className={styles.infoButton}
				onClick={() => setOpen((v) => !v)}
				aria-label="More info"
			>
				i
			</button>
			{open && <span className={styles.infoTip}>{text}</span>}
		</span>
	);
}

function SettingsDrawer({
	isOpen,
	onClose,
	showResetButton,
	onShowResetButtonChange,
	showCopyButton,
	onShowCopyButtonChange,
}) {
	const [notifications, setNotifications] = useState({
		resetNotification: true,
		reminderNotification: "never",
	});
	const [vaultInfo, setVaultInfo] = useState({
		path: null,
		currentPath: "",
		defaultPath: "",
	});
	const [apiState, setApiState] = useState({
		enabled: false,
		port: 19747,
		token: null,
		mcpPath: "",
	});
	const [tokenCopied, setTokenCopied] = useState(false);

	const loadSettings = useCallback(async () => {
		if (!window.settingsAPI) return;
		try {
			const [notif, vault, api] = await Promise.all([
				window.settingsAPI.getNotifications(),
				window.settingsAPI.getVaultPath(),
				window.settingsAPI.getApiState(),
			]);
			setNotifications(notif);
			setVaultInfo(vault);
			setApiState(api);
		} catch (err) {
			console.error("Failed to load settings:", err);
		}
	}, []);

	useEffect(() => {
		if (isOpen) {
			loadSettings();
		}
	}, [isOpen, loadSettings]);

	useEffect(() => {
		if (!isOpen) return;
		function handleKeyDown(e) {
			if (e.key === "Escape") {
				onClose();
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	async function handleResetNotificationToggle() {
		const newValue = !notifications.resetNotification;
		setNotifications((prev) => ({ ...prev, resetNotification: newValue }));
		await window.settingsAPI?.setNotifications({ resetNotification: newValue });
	}

	async function handleReminderChange(e) {
		const newValue = e.target.value;
		setNotifications((prev) => ({ ...prev, reminderNotification: newValue }));
		await window.settingsAPI?.setNotifications({
			reminderNotification: newValue,
		});
	}

	async function handleTestNotification() {
		await window.settingsAPI?.showTestNotification();
	}

	async function handleChangeVault() {
		const result = await window.settingsAPI?.changeVault();
		if (result) setVaultInfo(result);
	}

	async function handleResetVault() {
		const result = await window.settingsAPI?.resetVault();
		if (result) setVaultInfo(result);
	}

	async function handleRevealVault() {
		await window.settingsAPI?.revealVault();
	}

	async function handleToggleApi() {
		const result = await window.settingsAPI?.toggleApi(!apiState.enabled);
		if (result) setApiState((prev) => ({ ...prev, ...result }));
	}

	async function handleCopyToken() {
		const result = await window.settingsAPI?.copyApiToken();
		if (result?.copied) {
			setTokenCopied(true);
			setTimeout(() => setTokenCopied(false), 2000);
		}
	}

	function handleOpenDocs() {
		window.open(DOCS_URL, "_blank");
	}

	function handleShowResetButtonToggle() {
		const newValue = !showResetButton;
		onShowResetButtonChange(newValue);
		window.settingsAPI?.setShowResetButton(newValue);
	}

	function handleShowCopyButtonToggle() {
		const newValue = !showCopyButton;
		onShowCopyButtonChange(newValue);
		window.settingsAPI?.setShowCopyButton(newValue);
	}

	const displayPath = vaultInfo.path || vaultInfo.currentPath || "Default";
	const isCustomVault = !!vaultInfo.path;

	return (
		<>
			{isOpen && <div className={styles.overlay} onClick={onClose} />}
			<div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
				<div className={styles.container}>
					<div className={styles.header}>
						<h2>Configuration</h2>
						<button className={styles.closeButton} onClick={onClose}>
							✕
						</button>
					</div>

					<div className={styles.content}>
						<section className={styles.section}>
							<div className={styles.sectionHeader}>
								<h3>Notifications</h3>
								<InfoButton text={SECTION_INFO.notifications} />
							</div>
							<label className={styles.toggle}>
								<span>Reset notification</span>
								<input
									type="checkbox"
									checked={notifications.resetNotification}
									onChange={handleResetNotificationToggle}
								/>
								<span className={styles.slider} />
							</label>
							<div className={styles.field}>
								<span>Reminder frequency</span>
								<select
									value={notifications.reminderNotification}
									onChange={handleReminderChange}
								>
									{REMINDER_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
							<div className={styles.buttonGroup}>
								<button
									className={styles.secondaryButton}
									onClick={handleTestNotification}
								>
									Show example notification
								</button>
							</div>
						</section>

						<section className={styles.section}>
							<div className={styles.sectionHeader}>
								<h3>Your data</h3>
								<InfoButton text={SECTION_INFO.data} />
							</div>
							<div className={styles.locationRow}>
								<div
									className={styles.locationInput}
									title={displayPath}
									onClick={handleRevealVault}
								>
									{displayPath}
								</div>
								<button
									className={styles.secondaryButton}
									onClick={handleChangeVault}
								>
									Change…
								</button>
								{isCustomVault && (
									<button
										className={styles.secondaryButton}
										onClick={handleResetVault}
									>
										Reset
									</button>
								)}
							</div>
						</section>

						<section className={styles.section}>
							<div className={styles.sectionHeader}>
								<h3>Display</h3>
								<InfoButton text={SECTION_INFO.display} />
							</div>
							<label className={styles.toggle}>
								<span>Show reset progress button</span>
								<input
									type="checkbox"
									checked={showResetButton}
									onChange={handleShowResetButtonToggle}
								/>
								<span className={styles.slider} />
							</label>
							<label className={styles.toggle}>
								<span>Show copy button</span>
								<input
									type="checkbox"
									checked={showCopyButton}
									onChange={handleShowCopyButtonToggle}
								/>
								<span className={styles.slider} />
							</label>
						</section>

						<section className={styles.section}>
							<div className={styles.sectionHeader}>
								<h3>Local API and MCP</h3>
								<InfoButton text={SECTION_INFO.api} />
							</div>
							<label className={styles.toggle}>
								<span>
									Enable Local API{" "}
									{apiState.enabled ? `(port ${apiState.port})` : ""}
								</span>
								<input
									type="checkbox"
									checked={apiState.enabled}
									onChange={handleToggleApi}
								/>
								<span className={styles.slider} />
							</label>

							{apiState.enabled && apiState.token && (
								<>
									<div className={styles.locationRow}>
										<div className={styles.locationInput}>{apiState.token}</div>
										<button
											className={styles.secondaryButton}
											onClick={handleCopyToken}
										>
											{tokenCopied ? "Copied!" : "Copy"}
										</button>
									</div>
									<details className={styles.details}>
										<summary>MCP configuration</summary>
										<pre className={styles.codeBlock}>
											{JSON.stringify(
												{
													mcpServers: {
														todometer: {
															command: "node",
															args: [apiState.mcpPath],
															env: {
																TODOMETER_API_TOKEN: apiState.token,
															},
														},
													},
												},
												null,
												2,
											)}
										</pre>
									</details>
								</>
							)}
							<button className={styles.linkButton} onClick={handleOpenDocs}>
								API Documentation →
							</button>
						</section>
					</div>
				</div>
			</div>
		</>
	);
}

export default SettingsDrawer;
