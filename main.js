/*
 * This file is part of frontmatter-next-review-date.
 *
 * frontmatter-next-review-date is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * frontmatter-next-review-date is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with [Plugin Name].  If not, see <https://www.gnu.org/licenses/>.
 */

const { Plugin, TFile, moment, Notice, PluginSettingTab, Setting } = require("obsidian");

module.exports = class FrontmatterNextReview extends Plugin {
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
	  // No default hotkeys defined; users can set their own in Obsidian settings.
	});

	this.registerEvent(
	  this.app.workspace.on("editor-change", (editor, info) => {
		if (this.settings.enabled && info.file instanceof TFile) {
		  this.updateFrontmatter(info.file);
		}
	  })
	);
  }

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

  async loadSettings() {
	this.settings = Object.assign({ enabled: true }, await this.loadData());
  }

  async saveSettings() {
	await this.saveData(this.settings);
  }

  onunload() {
	this.statusBarItem.remove(); // Remove the status bar item when plugin is unloaded
  }

  // Update the status bar icon and text
  updateStatusBar() {
	this.statusBarItem.setText(this.settings.enabled ? "Review Update: ON | " : "Review Update: OFF | ");
	this.statusBarItem.setAttr("title", "Toggle Frontmatter Next Review Date Plugin");
	this.statusBarItem.onclick = () => {
	  this.settings.enabled = !this.settings.enabled;
	  this.updateStatusBar();
	  this.saveSettings();
	};
  }
};

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

	containerEl.createEl("p", {
	  text: "You can set your own hotkey for toggling this plugin in the Obsidian 'Hotkeys' settings under 'Settings > Hotkeys'.",
	});
  }
}