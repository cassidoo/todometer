import { notarize } from "@electron/notarize";
import path from "path";

export default async function notarizing(context) {
	const { electronPlatformName, appOutDir } = context;

	if (electronPlatformName !== "darwin") {
		return;
	}

	const appleId = process.env.APPLE_ID;
	const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
	const teamId = process.env.APPLE_TEAM_ID;

	if (!appleId || !appleIdPassword || !teamId) {
		console.log(
			"Skipping notarization — APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID not set",
		);
		return;
	}

	const appName = context.packager.appInfo.productFilename;
	const appPath = path.join(appOutDir, `${appName}.app`);

	console.log(`Notarizing ${appPath}...`);

	await notarize({
		appPath,
		appleId,
		appleIdPassword,
		teamId,
		tool: "notarytool",
	});

	console.log("Notarization complete.");
}
