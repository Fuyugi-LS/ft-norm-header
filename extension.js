const vscode = require("vscode");
const path = require("path");

// Define comment styles for each language to fit the 80-column norm
const COMMENT_STYLES = {
  lua: {
    start: "-- ",
    end: "--",
    width: 75,
  },
  python: {
    start: "# ",
    end: " #",
    width: 76,
  },
  javascript: {
    start: "/* ",
    end: " */",
    width: 74,
  },
  typescript: {
    start: "/* ",
    end: " */",
    width: 74,
  },
};

/**
 * Gets the comment style profile for the language.
 * Defaults to JavaScript style.
 * @param {string} languageId
 * @returns {object}
 */
function getCommentProfile(languageId) {
  return COMMENT_STYLES[languageId] || COMMENT_STYLES.javascript;
}

/**
 * Truncates and pads a string to a specific width.
 * @param {string} content
 * @param {number} width
 * @returns {string}
 */
function normLine(content, width) {
  return content.substring(0, width).padEnd(width, " ");
}

/**
 * Gets a formatted timestamp (YYYY/MM/DD HH:mm:ss).
 * @param {Date} date
 * @returns {string}
 */
function getTimestamp(date) {
  const Y = date.getFullYear();
  const M = (date.getMonth() + 1).toString().padStart(2, "0");
  const D = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${Y}/${M}/${D} ${h}:${m}:${s}`;
}

/**
 * Generates the full 80-column header string based on language.
 * @param {string} fileName
 * @param {vscode.WorkspaceConfiguration} config - The extension's config object
 * @param {object} commentProfile
 * @param {string | null} createdTimestamp
 * @returns {string}
 */
function getHeaderString(fileName, config, commentProfile, createdTimestamp = null) {
  const now = new Date();
  const updateTimestamp = getTimestamp(now);
  const createTimestamp = createdTimestamp || updateTimestamp;

  // --- Read settings from the config object ---
  const authorName = config.get("authorName", "lorem");
  const authorAddress = config.get("authorAddress", "github.com/loremipsum");
  const projectName = config.get("projectName", "projectName"); // Reads the correct default
  const copyright = config.get("copyright", '© "projectName" - All rights reserved'); // Reads the correct default
  // ---

  const fullAuthor = `${authorName} <${authorAddress}>`;
  const { start, end, width } = commentProfile;
  const tildeLine = " ".repeat(width).replace(/ /g, "~");

  // Center-align the ASCII art
  const line1 = "{   o   }".padStart(Math.floor((width + 9) / 2), " ").padEnd(width, " ");
  const line2 = "|   ‾‾‾   |".padStart(Math.floor((width + 9) / 2), " ").padEnd(width, " ");
  const line3 = "/\\+_______+/\\".padStart(Math.floor((width + 11) / 2), " ").padEnd(width, " ");
  // This line correctly uses the 'projectName' variable
  const line4 = `───   ${projectName}   ───`.padStart(Math.floor((width + projectName.length + 8) / 2), " ").padEnd(width, " ");
  const emptyLine = " ".repeat(width);

  // Left-align the file info
  const fileNameContent = normLine(fileName, width);
  const authorContent = normLine(`By: ${fullAuthor}`, width);
  const createdContent = normLine(`Created: ${createTimestamp} by ${authorName}`, width);
  const updatedContent = normLine(`Updated: ${updateTimestamp} by ${authorName}`, width);
  // This line correctly uses the 'copyright' variable
  const copyrightContent = normLine(copyright, width);

  // Build the 80-column header
  const lines = [
    `${start}${tildeLine}${end}`,
    `${start}${line1}${end}`,
    `${start}${line2}${end}`,
    `${start}${line3}${end}`,
    `${start}${line4}${end}`,
    `${start}${emptyLine}${end}`,
    `${start}${fileNameContent}${end}`,
    `${start}${emptyLine}${end}`,
    `${start}${authorContent}${end}`,
    `${start}${emptyLine}${end}`,
    `${start}${createdContent}${end}`,
    `${start}${updatedContent}${end}`,
    `${start}${emptyLine}${end}`,
    `${start}${copyrightContent}${end}`,
    `${start}${tildeLine}${end}`,
  ];

  return lines.join("\n") + "\n\n";
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "ft-norm-header.addHeader",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      // Get the configuration object
      const config = vscode.workspace.getConfiguration("ft-norm-header");

      const fileName = path.basename(document.fileName);
      const languageId = document.languageId;
      const commentProfile = getCommentProfile(languageId);

      const tildeLine = " ".repeat(commentProfile.width).replace(/ /g, "~");
      const headerRegex = new RegExp(
        // [[ THIS IS THE FIX: 'commentf' is now 'commentProfile' ]]
        `${commentProfile.start.replace(/[*]/g, "\\*")}${tildeLine}${commentProfile.end.replace(/[*]/g, "\\*")}[\\s\\S]*?${commentProfile.start.replace(/[*]/g, "\\*")}${tildeLine}${commentProfile.end.replace(/[*]/g, "\\*")}\\s*`
      );

      const fileContent = document.getText();
      const match = fileContent.match(headerRegex);

      let createdTimestamp = null;
      let existingHeaderRange = null;

      if (match) {
        const oldHeader = match[0];
        existingHeaderRange = new vscode.Range(
          document.positionAt(match.index),
          document.positionAt(match.index + oldHeader.length)
        );

        const createdMatch = oldHeader.match(
          /Created: (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/
        );
        if (createdMatch && createdMatch[1]) {
          createdTimestamp = createdMatch[1];
        }
      }

      // Pass the config object into the generator
      const newHeader = getHeaderString(
        fileName,
        config,
        commentProfile,
        createdTimestamp
      );

      await editor.edit((editBuilder) => {
        if (existingHeaderRange) {
          editBuilder.replace(existingHeaderRange, newHeader);
        } else {
          editBuilder.insert(new vscode.Position(0, 0), newHeader);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
