import { contextBridge, ipcRenderer } from "electron";
import Elements from "./renderer/elements";
import { renderMarkdown } from "./renderer/markdown";

ipcRenderer.on("file-opened", (_, content: string, filePath: string) => {
	Elements.MarkdownView.value = content;
	renderMarkdown(Elements.MarkdownView.value);
});

contextBridge.exposeInMainWorld("api", {
	showOpenDialog: () => {
		ipcRenderer.invoke("show-open-dialog");
	},
});
