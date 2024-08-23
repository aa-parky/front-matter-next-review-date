const { Plugin, TFile, moment } = require("obsidian");

module.exports = class FrontmatterNextReview extends Plugin {
  async onload() {
	this.registerEvent(
	  this.app.workspace.on("editor-change", (editor, info) => {
		if (info.file instanceof TFile) {
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
};