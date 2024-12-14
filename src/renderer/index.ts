import { renderMarkdown } from "./markdown";
import Elements from "./elements";

window.api.onFileOpen((content) => {
	Elements.MarkdownView.value = content;
	renderMarkdown(Elements.MarkdownView.value);
	Elements.SaveMarkdownButton.disabled = true;
});

Elements.MarkdownView.addEventListener("input", async () => {
	const markdown = Elements.MarkdownView.value;
	renderMarkdown(markdown);
	const hasChanges = await window.api.checkForUnsavedChanges(markdown);
	Elements.SaveMarkdownButton.disabled = !hasChanges;
});

Elements.OpenFileButton.addEventListener("click", () => {
	window.api.showOpenDialog();
});

Elements.ExportHtmlButton.addEventListener("click", () => {
	const html = Elements.MarkdownView.value;
	window.api.showExportHtmlDialog(html);
});

Elements.SaveMarkdownButton.addEventListener("click", async () => {
	const markdown = Elements.MarkdownView.value;
	Elements.SaveMarkdownButton.disabled = true;
	await window.api.saveFile(markdown);
});
