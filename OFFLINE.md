# Offline edition — no Node.js or installation on the exam computer

1. Download and extract the repository ZIP before the exam.
2. Open **[offline/START-HERE.html](offline/START-HERE.html)** in Edge, Chrome or Firefox.
3. Keep that HTML file on the permitted local drive or removable storage.

The file includes the images, fonts, styles, JavaScript, text and synthesised
sound. It needs no internet connection, local web server, administrator account,
Node.js or browser extension. JavaScript must be permitted in the browser.
Animations and interactions are retained. The HTML is large because its assets
are embedded; allow a moment for the first load.

On GitHub the HTML may display as source or be too large to preview. Download
the repository ZIP and extract it, or use this [direct HTML download](https://github.com/MWelding/DMD/raw/refs/heads/main/offline/START-HERE.html).
Do not save the GitHub preview page as the installation.

## Edit text and card photos inside the offline version

- Click **Edit content**, or press **Ctrl+Shift+E**. An open + card also has an
  **Edit this card** button.
- Choose Train, Tram, Bus or Station. Edit the main title and introduction, then
  the past, transition and present headings, dates, captions and descriptions.
- Use **Replace card photo** to select a JPEG, PNG, WebP or GIF from your computer.
  This changes that card image only; the collage cutout remains as designed.
- **Apply changes** updates the current session. **Preview card** applies your
  edits and opens the selected card.
- **Download updated HTML** saves a new, self-contained installation with the
  text and replacement photos embedded. Open **that downloaded copy** next time.
  The browser does not silently overwrite the original file.

Edits are not automatically written back to disk. Download the updated HTML
before closing. A browser reload otherwise starts from the content saved in the
HTML you originally opened. Saving does not depend on localStorage or browser
cache, so you can transfer the edited HTML to another permitted computer.

## Use your existing text file

**Import texts** reads an edited [PANEL-TEXT.txt](PANEL-TEXT.txt) through the file
picker and applies it. **Export texts** downloads the current text in the same
format, so it can also be used by the regular Node version.

The offline edition cannot automatically watch a separate text file on disk.
After editing one in Notepad, import it again, then download an updated HTML if
you want to keep that content in the standalone installation.

## Rebuild the offline edition on your preparation computer

After changing the regular source, images or `PANEL-TEXT.txt`, run:

```sh
npm run build:offline
```

This regenerates `offline/START-HERE.html` using the current source and text. The
builder needs Node.js on the preparation computer, not on the exam computer.
It has no npm dependencies. Building replaces the generated START-HERE file;
keep HTML copies downloaded from the editor under their own filenames.

The generated file is included in GitHub so you do not need to build it during
the exam. [Build script](scripts/build-offline.mjs) · [Editor code](src/offline-editor.js)

The offline HTML is a snapshot from its last build. Later edits to the regular
source or `PANEL-TEXT.txt` on GitHub do not rewrite that snapshot automatically.
Rebuild it before transferring it, or import the updated text file in its editor.

## Before the exam

Test the actual saved HTML on the exam computer beforehand, using its normal
browser permissions. Confirm the school's rules for local HTML, JavaScript,
file selection and your method of transferring the project.
