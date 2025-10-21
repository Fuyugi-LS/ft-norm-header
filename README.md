# F.Tycoon Norm Header Extension

A simple, lightweight VSCode extension that inserts a language-aware, norm-compliant header at the top of your file.

## Features

-   **Idempotent:** Run the command once to add a header. Run it again to update the header (preserves "Created" timestamp).
-   **Language-Aware:** Automatically uses the correct comment style for:
    -   Lua / Luau (`-- ... --`)
    -   Python (`# ... #`)
    -   JavaScript / TypeScript (`/* ... */`)
    -   Defaults to `/* ... */` for any other language.
-   **Fully Configurable:** Set your own project name, author, and copyright in VSCode settings.
-   **80-Column Strict:** All header lines are stripped and padded to exactly 80 columns.

## Command

The extension provides one command:

-   **Command:** `F.Tycoon: Add Norm Header`
-   **Keybinding:** `Ctrl+Alt+G` (or `Cmd+Alt+G` on Mac)

## Configuration

You can configure the header's content by opening your VSCode `settings.json` file and adding the following properties:

```json
{
  "ft-norm-header.projectName": "MyProject",
  "ft-norm-header.authorName": "MyName",
  "ft-norm-header.authorAddress": "my.email@example.com",
  "ft-norm-header.copyright": "© \"MyProject\" - All rights reserved"
}
````

## Installation (from GitHub)

1.  Go to the [Releases](https://github.com/Fuyugi-LS/ft-norm-header/releases) page of this repository.
2.  Download the latest `.vsix` file.
3.  In VSCode, go to the **Extensions** tab.
4.  Click the **`...`** (More Actions) menu and select **"Install from VSIX..."**.
5.  Choose the `.vsix` file you just downloaded.
