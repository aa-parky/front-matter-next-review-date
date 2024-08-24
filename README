# Obsidian plugin that adds the next review date plus 12 months from creation date or last reviewed date.

Below is a documentation for the Obsidian plugin code you provided. The plugin is designed to add or update a `next_review_date` field in the YAML front matter of notes. This field is calculated based on either the creation date of a new note or the last review date of an existing note.

### Obsidian Plugin: Frontmatter Next Review

#### Overview
This plugin automatically adds or updates the `next_review_date` field in the YAML front matter of your Obsidian notes. The `next_review_date` is set to 12 months from the note's creation date for new notes or from the `last_review_date` for existing notes. 

#### Dependencies
- **Obsidian API**: The plugin utilizes Obsidian's `Plugin`, `TFile`, and `moment` modules to interact with the application, access files, and handle date manipulations.
- **Moment.js**: This library is used for date manipulation and formatting.

### Plugin Code Breakdown

#### 1. **Importing Required Modules**
```javascript
const { Plugin, TFile, moment } = require("obsidian");
```
- **Plugin**: The base class for all plugins in Obsidian.
- **TFile**: Represents a file within the Obsidian vault.
- **moment**: A date manipulation library.

#### 2. **Defining the Plugin Class**
```javascript
module.exports = class FrontmatterNextReview extends Plugin {
```
- The plugin is defined as a class extending the `Plugin` class, allowing it to integrate into the Obsidian ecosystem.

#### 3. **onload() Method**
```javascript
async onload() {
	this.registerEvent(
	  this.app.workspace.on("editor-change", (editor, info) => {
		if (info.file instanceof TFile) {
		  this.updateFrontmatter(info.file);
		}
	  })
	);
}
```
- **Purpose**: This method is automatically called when the plugin is loaded.
- **Functionality**:
  - Registers an event listener for the `editor-change` event in the Obsidian workspace.
  - Checks if the change is associated with a `TFile` (a file in the vault).
  - If it is a `TFile`, it calls the `updateFrontmatter()` method to update the YAML front matter.

#### 4. **updateFrontmatter(file) Method**
```javascript
async updateFrontmatter(file) {
	const cache = this.app.metadataCache.getFileCache(file);
	this.app.fileManager.processFrontMatter(file, (frontmatter) => {
	  const now = window.moment();
	  let nextReviewDate;

	  if (!frontmatter["created"]) {
		// New note case
		const createdDate = window.moment(file.stat.ctime);
		nextReviewDate = createdDate.add(12, "months").format("YYYY-MM-DD");
	  } else if (frontmatter["last_review_date"]) {
		// Existing note case
		const lastReviewDate = window.moment(
		  frontmatter["last_review_date"]
		);
		nextReviewDate = lastReviewDate
		  .add(12, "months")
		  .format("YYYY-MM-DD");
	  }

	  if (nextReviewDate) {
		frontmatter["next_review_date"] = nextReviewDate;
	  }
	});
}
```

- **Purpose**: This method updates the YAML front matter of a given file to include a `next_review_date`.
- **Parameters**: 
  - `file`: A `TFile` object representing the note file to update.
  
- **Functionality**:
  - Retrieves the current front matter cache of the file using `metadataCache`.
  - Uses `processFrontMatter` to access and modify the front matter.
  - **For New Notes**: If the `created` field is not present in the front matter, it considers the note as new:
	- Uses the file's creation time (`ctime`) to set `next_review_date` to 12 months later.
  - **For Existing Notes**: If the `last_review_date` field is present:
	- Uses this date to set the `next_review_date` to 12 months later.
  - If `next_review_date` is calculated, it is added to the front matter.

### Conclusion

This plugin effectively automates the management of review dates for your notes, ensuring that each note has a `next_review_date` calculated and updated based on either its creation or last review. This can help in maintaining a regular review cycle for your notes within Obsidian.