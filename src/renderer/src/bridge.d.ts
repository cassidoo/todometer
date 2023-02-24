// Modify the window to have type of
declare global {
  interface Window {
    onNotificationSettingsChange?: (
      callback: (data: {
        resetNotification: boolean;
        reminderNotification: string;
      }) => void
    ) => void;
  }
}

export {};
