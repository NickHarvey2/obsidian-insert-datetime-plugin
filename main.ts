import { App, Plugin, PluginSettingTab, Setting, MarkdownView } from 'obsidian';

interface InsertDatetimePluginSettings {
	format: string;
}

const DEFAULT_SETTINGS: InsertDatetimePluginSettings = {
	format: 'YYYY-MM-dd HH:mm'
}

export default class InsertDatetimePlugin extends Plugin {
	settings: InsertDatetimePluginSettings;

	async onload() {
		console.log('loading obsidian-insert-datetime-plugin');

		await this.loadSettings();

		this.addCommand({
			id: 'insert-datetime',
			name: 'Insert Datetime',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.activeLeaf.view as MarkdownView;
				if (view.getMode() === 'source') {
					if (!checking) {
						const editor = view.sourceMode.cmEditor as CodeMirror.Editor;
						const now = new Date();
						editor.replaceSelection(this.settings.format.replace('YYYY', now.getFullYear().toString().padStart(4, '0'))
																	.replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
																	.replace('dd', now.getDate().toString().padStart(2, '0'))
																	.replace('HH', now.getHours().toString().padStart(2, '0'))
																	.replace('mm', now.getMinutes().toString().padStart(2, '0'))
																	.replace('ss', now.getSeconds().toString().padStart(2, '0')));
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new InsertDatetimePluginSettingTab(this.app, this));
	}

	onunload() {
		console.log('unloading obsidian-insert-datetime-plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class InsertDatetimePluginSettingTab extends PluginSettingTab {
	plugin: InsertDatetimePlugin;

	constructor(app: App, plugin: InsertDatetimePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Format')
			.setDesc(`The format of the datetime that will be inserted. Supported: YYYY, MM, dd, HH, mm, ss. Default: ${DEFAULT_SETTINGS.format}`)
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.format)
				.setValue(this.plugin.settings ? this.plugin.settings.format : '')
				.onChange(async (value) => {
					console.log('format: ' + value);
					this.plugin.settings.format = value.trim().length > 0 ? value : DEFAULT_SETTINGS.format;
					await this.plugin.saveSettings();
				}));
	}
}
