/// <reference types="vite/client" />
/// <reference types="electron" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

declare interface Window {
	api: {
		showOpenDialog: () => void;
		onFileOpen: (callback: (content: string, filePath: string) => void) => void;
		showExportHtmlDialog: (html: string) => void;
		saveFile: (filePath: string, content: string) => void;
	};
}
