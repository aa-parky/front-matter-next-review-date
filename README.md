# Obsidian Plugin: Frontmatter Next Review Date

---

This Obsidian plugin automatically manages a `next_review_date` field in the YAML front matter of your notes. It sets the `next_review_date` to 12 months from either the creation date of a new note or the `last_review_date` of an existing note.

## Overview

The plugin monitors changes to notes and updates the `next_review_date` field to help users keep track of when each note should be reviewed next. It includes additional features such as enabling/disabling the plugin, a status bar indicator, and settings accessible through the Obsidian interface.

## Features

- **Automatic Date Calculation**: Automatically adds or updates the `next_review_date` in the YAML front matter, setting it 12 months after either the note's creation or its last review.
- **Toggle Functionality**: The plugin can be enabled or disabled via a command or through a settings tab.
- **Status Bar Indicator**: A status bar item indicates whether the plugin is currently enabled or disabled.
- **Settings Tab**: Provides a user interface in the settings panel to enable or disable the plugin.

## Dependencies

- **Obsidian API**: Utilizes `Plugin`, `TFile`, `Notice`, `PluginSettingTab`, and `Setting` from the Obsidian API for core functionalities.
- **Moment.js**: Used for date manipulation and formatting.

## Installation

1. Download and install Obsidian.
2. Clone or download this repository.
3. Copy the plugin files into your Obsidian vault's plugins directory.
4. Enable the plugin in the Obsidian settings.

## Plugin Code Breakdown

### 1. **Importing Required Modules**

```javascript
const { Plugin, TFile, moment, Notice, PluginSettingTab, Setting } = require("obsidian");
```

- **Plugin**: Base class for creating Obsidian plugins.
- **TFile**: Represents a file within the Obsidian vault.
- **moment**: A library for date manipulation.
- **Notice**: Provides visual feedback within Obsidian.
- **PluginSettingTab** and **Setting**: Classes for creating settings UI.

### 2. **Defining the Plugin Class**

```javascript
module.exports = class FrontmatterNextReview extends Plugin {
```

- This class defines the core functionality of the plugin, including event handling and UI updates.

### 3. **onload() Method**

```javascript
async onload() {
	await this.loadSettings(); // Load settings from disk

	this.addSettingTab(new FrontmatterNextReviewSettingTab(this.app, this));

	// Add a status bar item
	this.statusBarItem = this.addStatusBarItem();
	this.updateStatusBar();

	this.addCommand({
		id: "toggle-plugin",
		name: "Toggle Frontmatter Next Review Date Plugin",
		callback: () => {
			this.settings.enabled = !this.settings.enabled;
			new Notice(`Frontmatter Next Review Date Plugin is now ${this.settings.enabled ? "enabled" : "disabled"}`);
			this.updateStatusBar(); // Update status bar when toggled
			this.saveSettings(); // Save settings whenever the plugin is toggled
		},
		hotkeys: [
			{
				modifiers: ["Ctrl", "Shift"],
				key: "T",
			},
		],
	});

	this.registerEvent(
		this.app.workspace.on("editor-change", (editor, info) => {
			if (this.settings.enabled && info.file instanceof TFile) {
				this.updateFrontmatter(info.file);
			}
		})
	);
}
```

- **Purpose**: Initializes the plugin, loads settings, and sets up UI components and event listeners.
- **Features**:
  - Loads user settings.
  - Adds a settings tab in the Obsidian settings panel.
  - Creates a status bar item for plugin status.
  - Registers a command to toggle the plugin.
  - Sets up an event listener to monitor changes in the editor and update front matter accordingly.

### 4. **updateFrontmatter(file) Method**

```javascript
async updateFrontmatter(file) {
	const cache = this.app.metadataCache.getFileCache(file);
	this.app.fileManager.processFrontMatter(file, (frontmatter) => {
		const now = window.moment();
		let nextReviewDate;

		if (!frontmatter["created"]) {
			const createdDate = window.moment(file.stat.ctime);
			nextReviewDate = createdDate.add(12, "months").format("YYYY-MM-DD");
		} else if (frontmatter["last_review_date"]) {
			const lastReviewDate = window.moment(frontmatter["last_review_date"]);
			nextReviewDate = lastReviewDate.add(12, "months").format("YYYY-MM-DD");
		}

		if (nextReviewDate) {
			frontmatter["next_review_date"] = nextReviewDate;
		}
	});
}
```

- **Purpose**: Updates the `next_review_date` in the YAML front matter of the specified file.
- **Logic**:
  - For new notes, calculates the next review date based on the creation time.
  - For existing notes, calculates the next review date based on the `last_review_date`.
  - Updates the front matter with the calculated date.

### 5. **Settings Management**

#### loadSettings() Method

```javascript
async loadSettings() {
	this.settings = Object.assign({ enabled: true }, await this.loadData());
}
```

- Loads the plugin settings from storage, defaulting to enabled if no settings are found.

#### saveSettings() Method

```javascript
async saveSettings() {
	await this.saveData(this.settings);
}
```

- Saves the current plugin settings to storage.

### 6. **Status Bar Updates**

```javascript
updateStatusBar() {
	this.statusBarItem.setText(this.settings.enabled ? "Review Update: ON | " : "Review Update: OFF | ");
	this.statusBarItem.setAttr("title", "Toggle Frontmatter Next Review Date Plugin");
	this.statusBarItem.onclick = () => {
		this.settings.enabled = !this.settings.enabled;
		this.updateStatusBar();
		this.saveSettings();
	};
}
```

- Updates the status bar to reflect whether the plugin is enabled or disabled.
- Allows toggling the plugin by clicking the status bar item.

### 7. **Settings Tab Class**

```javascript
class FrontmatterNextReviewSettingTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Frontmatter Next Review Date Settings" });

		new Setting(containerEl)
			.setName("Enable Plugin")
			.setDesc("Toggle the Frontmatter Next Review Date plugin.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
					this.plugin.settings.enabled = value;
					this.plugin.updateStatusBar(); // Update status bar when setting is changed
					await this.plugin.saveSettings();
				})
			);
	}
}
```

- Provides a settings tab within Obsidian to manage the plugin.
- Allows users to enable or disable the plugin via a toggle switch.

## License

This plugin is licensed under the GNU General Public License v3.0. See the [LICENSE](https://www.gnu.org/licenses/gpl-3.0.txt) file for more information.