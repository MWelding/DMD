# Edit the installation

[Back to the README and image links](README.md)

For a computer without Node.js, use the [offline edition](OFFLINE.md). It has a
built-in text and card-photo editor and can download an updated HTML copy.

## Change the + card text

Open [PANEL-TEXT.txt](PANEL-TEXT.txt) in a text editor, or edit that file on GitHub.
All four cards are in this one file: `train`, `tram`, `bus`, and `station`.

Change the words beneath a heading and keep the heading itself unchanged:

```text
[train.title]
Your new title here

[train.intro]
Your introduction here.

[train.past.text]
Your description of the older train.

You can write another paragraph here.
```

| Field | What appears in the card |
| --- | --- |
| `category` | Small text above the main title |
| `title` | Main card heading |
| `intro` | Introduction under the main heading |
| `past.year`, `transition.year`, `present.year` | Slider dates / stop labels |
| `past.title`, `transition.title`, `present.title` | Heading at each stop |
| `past.label`, `transition.label`, `present.label` | Small era label above the photo caption |
| `past.caption`, `transition.caption`, `present.caption` | Photo captions |
| `past.text`, `transition.text`, `present.text` | Main description at each stop |

The same pattern works for every object: `[tram.present.text]`,
`[bus.transition.title]`, `[station.intro]`, and so on. Leave a section empty
to leave that text blank. No HTML, quotation marks or commas are needed.

After saving the **local** file, an open browser panel updates within about two
seconds. Text changes do not need a build or server restart when using the Node
server. Keep the filename exactly `PANEL-TEXT.txt`.

## Replace a photograph inside a card

1. Find the exact file in the [README's card image table](README.md#images-inside-the--cards).
2. Replace that file with your new photograph, keeping its filename and extension.
3. Refresh the browser. For a production/VM copy, rebuild first as described below.

To use a different filename, put your new file under [public/assets](public/assets/)
and edit the relevant `image` value in [src/chapters.js](src/chapters.js). Image
paths in that file are relative to `public/assets/`, for example:

```js
image: 'journey/legacy-train.jpg'
```

The order in each object's array is past, transition, present. Edit the image
path here; edit visible text in [PANEL-TEXT.txt](PANEL-TEXT.txt).

Some files are shared. The older tram photograph appears at two stops; replacing
it changes both. Some card photographs are also used by the main collage.

## Change the main collage images

The [README lists the collage images](README.md#main-collage-and-entry-images).
Their cutouts are defined in [src/artwork.js](src/artwork.js) using SVG polygons.
Keep the original image size and subject placement if replacing an image without
changing its cutout. A completely different photograph usually needs a new polygon
and viewBox so the silhouette fits. Card photographs do not use these cutout masks.

The two carriage images have transparent window openings. Preserve that alpha
transparency and window placement when replacing them.

## Other text and behaviour

| Change | File |
| --- | --- |
| ALWAYS IN MOTION, page buttons, About panel | [public/index.html](public/index.html) |
| Card image order and filenames | [src/chapters.js](src/chapters.js) |
| Card interactions and cursor | [src/experience.js](src/experience.js) |
| Card / timeline layout | [src/fragments.css](src/fragments.css) and [src/cinema.css](src/cinema.css) |
| Journey timing and arrival playback | [src/journey.js](src/journey.js) |
| Scrolling trees, grass and poles | [src/train-view.js](src/train-view.js) |
| Horn, rail ambience and vehicle hover sounds | [src/rail-audio.js](src/rail-audio.js) |
| Image-generation notes | [ASSET-NOTES.md](ASSET-NOTES.md) |

## Bring GitHub edits into your running copy

Editing a file on GitHub changes the repository. Your local PC or VM only sees it
after you download the update. In its project folder, run:

```sh
git pull
```

If Git reports local edits, save and commit those edits before pulling. Do not
discard them just to update.

- **Text only, Node server:** the saved `PANEL-TEXT.txt` is picked up automatically.
- **Images, CSS or browser JavaScript, development server:** refresh the browser.
- **Images, CSS or browser JavaScript, production server:** run `npm run build`,
  then refresh. A hard refresh may be needed for previously cached files.
- **Node server code:** stop the server with Ctrl+C and start it again.
- **Static hosting of dist/ only:** edit `dist/panel-text.txt` there, or rebuild
  from source and copy the resulting `dist/` contents to the static host.

If you downloaded a ZIP instead of cloning, download and extract the updated ZIP
into a separate folder, preserving any local text edits you want to keep.
