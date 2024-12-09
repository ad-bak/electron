import { app, BrowserWindow, dialog } from "electron";
import { readFile } from "fs/promises";
import { join } from "path";

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			preload: join(__dirname, "preload.js"),
		},
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
		);
	}

	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
		mainWindow.focus();
		showOpenDialog(mainWindow);
	});

	mainWindow.webContents.openDevTools({
		mode: "detach",
	});
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

const showOpenDialog = async (browserWindow: BrowserWindow) => {
	const result = await dialog.showOpenDialog(browserWindow, {
		title: "Open File",
		buttonLabel: "Open",
		properties: ["openFile", "multiSelections"],
		// filters: below means only show files with .md extension
		filters: [{ name: "PDF Files", extensions: ["pdf"] }],
	});

	if (result.canceled) return;

	const [filePath] = result.filePaths;
	openFile(filePath);
};

const openFile = async (filePath: string) => {
	const content = await readFile(filePath, "utf-8");

	console.log({ filePath, content });
};
