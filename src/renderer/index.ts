import { renderMarkdown } from "./markdown";
import Elements from "./elements";

window.api.onFileOpen((content) => {
	Elements.MarkdownView.value = content;
	renderMarkdown(Elements.MarkdownView.value);
});

Elements.MarkdownView.addEventListener("input", async () => {
	const markdown = Elements.MarkdownView.value;
	renderMarkdown(markdown);
});

Elements.OpenFileButton.addEventListener("click", () => {
	window.api.showOpenDialog();
});

Elements.ExportHtmlButton.addEventListener("click", () => {
	const html = Elements.MarkdownView.value;
	window.api.showExportHtmlDialog(html);
});

Elements.SaveMarkdownButton.addEventListener("click", () => {
	const markdown = Elements.MarkdownView.value;
	window.api.saveFile(markdown);
});

Elements.SaveMarkdownButton.disabled = false;
