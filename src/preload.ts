import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
	onFileOpen: (callback: (content: string) => void) => {
		ipcRenderer.on("file-opened", (_, content: string) => {
			callback(content);
		});
	},
	showOpenDialog: () => {
		ipcRenderer.invoke("show-open-dialog");
	},
	showExportHtmlDialog: (html: string) => {
		ipcRenderer.invoke("show-export-html-dialog", html);
	},
	saveFile: (filePath: string, content: string) => {
		ipcRenderer.invoke("save-file", filePath, content);
	},
});
