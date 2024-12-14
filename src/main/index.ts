import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { readFile, writeFile } from "fs/promises";
import { join, basename } from "path";

type MarkdownFile = {
	filePath?: string;
	content?: string;
};

const getCurrentFile: (
	browserWindow: BrowserWindow
) => Promise<string | undefined> = async (browserWindow: BrowserWindow) => {
	if (currentFile.filePath) return currentFile.filePath;
	if (!browserWindow) return;

	return showSaveDialog(browserWindow);
};

const setCurrentFile = (
	browserWindow: BrowserWindow,
	filePath: string,
	content: string
) => {
	currentFile.filePath = filePath;
	currentFile.content = content;

	app.addRecentDocument(filePath);
	browserWindow.setTitle(`Markdown - ${basename(filePath)} - ${app.name}`);
	browserWindow.setRepresentedFilename(filePath);
};

const hasChanges = (content: string) => {
	return currentFile.content !== content;
};

let currentFile: MarkdownFile = {
	content: "",
	filePath: undefined,
};

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			nodeIntegration: true,
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
		filters: [{ name: "Markdown Files", extensions: ["md"] }],
	});

	if (result.canceled) return;

	const [filePath] = result.filePaths;
	openFile(browserWindow, filePath);
};

const openFile = async (browserWindow: BrowserWindow, filePath: string) => {
	const content = await readFile(filePath, "utf-8");

	setCurrentFile(browserWindow, filePath, content);

	browserWindow.webContents.send("file-opened", content, filePath);
};

const showHtmlDialog = async (browserWindow: BrowserWindow, html: string) => {
	const result = await dialog.showSaveDialog(browserWindow, {
		title: "Export HTML",
		buttonLabel: "Export",
		filters: [{ name: "HTML Files", extensions: ["html"] }],
	});

	if (result.canceled) return;

	const { filePath } = result;

	if (!filePath) return;

	await exportHtml(filePath, html);
};

const exportHtml = async (filePath: string, html: string) => {
	await writeFile(filePath, html, { encoding: "utf-8" });
};

ipcMain.handle("show-open-dialog", async (event) => {
	const browserWindow = BrowserWindow.fromWebContents(event.sender);

	if (!browserWindow) return;

	showOpenDialog(browserWindow);
});

ipcMain.handle("show-export-html-dialog", async (event, html: string) => {
	const browserWindow = BrowserWindow.fromWebContents(event.sender);

	if (!browserWindow) return;

	showHtmlDialog(browserWindow, html);
});

const showSaveDialog = async (browserWindow: BrowserWindow) => {
	const result = await dialog.showSaveDialog(browserWindow, {
		title: "Save File",
		buttonLabel: "Save",
		filters: [{ name: "Markdown Files", extensions: ["md"] }],
	});

	if (result.canceled) return;

	const { filePath } = result;

	return filePath;
};

const saveFile = async (browserWindow: BrowserWindow, content: string) => {
	const filePath = await getCurrentFile(browserWindow);

	if (!filePath) return;

	await writeFile(filePath, content, { encoding: "utf-8" });
	setCurrentFile(browserWindow, filePath, content);
};

ipcMain.handle("save-file", async (event, content: string) => {
	const browserWindow = BrowserWindow.fromWebContents(event.sender);

	if (!browserWindow) return;

	await saveFile(browserWindow, content);

	return true;
});

ipcMain.handle("has-changes", async (event, content: string) => {
	const browserWindow = BrowserWindow.fromWebContents(event.sender);
	const changed = hasChanges(content);

	browserWindow?.setDocumentEdited(changed);

	return changed;
});
