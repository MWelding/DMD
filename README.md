# Change in Progress — cinematic local installation

A dark, interactive photographic collage about Riga's public transport, memory, and change. This redesign uses the supplied train-window view, the twelve-frame arrival sequence, original field photographs, and the original supporting-studies collage.

## Quick edit links

These links open the actual files in this repository, including on GitHub.

| What you want to change | Open this file |
| --- | --- |
| All text in the + cards: titles, descriptions, captions and dates | **[PANEL-TEXT.txt](PANEL-TEXT.txt)** |
| Which photograph appears at each card's timeline stop | **[Card image mapping](src/chapters.js)** |
| All photograph files | [Images folder](public/assets/) |
| Main collage objects and photographic cutout shapes | [Collage artwork](src/artwork.js) |
| Main page title, buttons and About panel text | [Page HTML](public/index.html) |
| Card layout and timeline appearance | [Card and collage styles](src/fragments.css), [cinematic styles](src/cinema.css) |
| Moving scenery in the train window | [Scenery animation](src/train-view.js) |
| Train horn, ambient sound and playful vehicle sounds | [Sound code](src/rail-audio.js) |
| How to edit files and update your local site | [Editing guide](EDITING.md) |
| GitHub setup and downloading the project | [GitHub guide](GITHUB-SETUP.md) |
| Running on a VM / public IP | [Server guide](PUBLIC-SERVER.md) |

## Images inside the + cards

Each link below opens the exact image used by that card. The labels refer to the
three slider positions. The train's present card uses the arrival photograph;
the modern train cutout on the main collage is a separate image listed below.

| Card | Past | Transition | Present |
| --- | --- | --- | --- |
| Train | [Older train](public/assets/journey/legacy-train.jpg) | [Yellow-and-blue train](public/assets/train-transition.png) | [Arrival at the station](public/assets/journey/arrival-11.jpg) |
| Tram | [Older tram](public/assets/tram-past.png) | [Same older-tram photograph](public/assets/tram-past.png) | [Modern tram](public/assets/tram-present.png) |
| Bus | [Older bus](public/assets/bus-past.png) | [Trolleybus](public/assets/trolleybus.png) | [Modern bus](public/assets/bus-present.png) |
| Station | [Station tower](public/assets/station-color.jpg) | [Departure board](public/assets/departures.jpg) | [View from the train window](public/assets/journey/window.jpg) |

To replace a card photograph, replace the linked file with the same filename and
extension. To use a new filename, add the image under [public/assets](public/assets/)
and update its `image` entry in [src/chapters.js](src/chapters.js). See the
[editing guide](EDITING.md) for the difference between card photos and collage cutouts.

## Main collage and entry images

| Part | Direct image links |
| --- | --- |
| Train cutouts | [Past](public/assets/train-past.png) · [Transition](public/assets/train-transition.png) · [Present](public/assets/train-present.png) |
| Tram cutouts | [Past](public/assets/tram-past.png) · [Present](public/assets/tram-present.png) |
| Bus cutouts | [Past](public/assets/bus-past.png) · [Trolleybus](public/assets/trolleybus.png) · [Present](public/assets/bus-present.png) |
| Station and departure board | [Monochrome station](public/assets/station.jpg) · [Colour station](public/assets/station-color.jpg) · [Board](public/assets/departures.jpg) |
| Train interiors | [Older cabin](public/assets/journey/latvian-carriage.png) · [Modern cabin](public/assets/journey/modern-carriage.png) |
| Window scenery | [Scrolling panorama](public/assets/journey/countryside-panorama.png) · [Initial window photograph](public/assets/journey/forest-window.jpg) · [Station window photograph](public/assets/journey/window.jpg) |
| Exterior arrival sequence | [Journey image folder](public/assets/journey/) — files `arrival-00.jpg` to `arrival-11.jpg` |
| Original supporting-studies collage | [Original collage](public/assets/original-collage.png) |

## Get the site from GitHub

```sh
git clone https://github.com/MWelding/DMD.git
cd DMD
npm run dev
```

Open http://127.0.0.1:3000. Alternatively, download and extract the repository ZIP,
then double-click [START.cmd](START.cmd) on Windows. Node.js 20 or newer is required;
the site has no npm dependencies to install. GitHub stores the source; it does
not automatically replace a running local or VM copy. After editing on GitHub,
run `git pull` in your local project folder. See [update instructions](EDITING.md#bring-github-edits-into-your-running-copy).

## Start

Requires Node.js 20 or newer. No installation, account, API key, or internet connection is required.

On Windows, double-click START.cmd, then open http://127.0.0.1:3000. Keep the terminal open while exploring. If the preview is already running, use that existing address rather than launching another server on the same port.

From a terminal:

```
npm run dev
```

For a built version:

```
npm run build
npm start
```

Tests: `npm test`.

## Change the + panel text

Open **[PANEL-TEXT.txt](PANEL-TEXT.txt)** in Notepad. It sits beside START.cmd. Find the train, tram,
bus or station section, replace the words under its `[headings]`, and save.
Keep the headings themselves unchanged. You can use ordinary punctuation and
multiple paragraphs, or leave a section empty to show no text there.

Each object has a main category, title and introduction, followed by past,
transition and present sections. Each period has its slider date (`year`),
heading (`title`), small era label (`label`), photo caption (`caption`) and body copy (`text`).

The browser picks up saved changes within about two seconds, even when a panel
is already open. Its selected date and scroll position are preserved. This works
with START.cmd, START-PUBLIC.cmd, npm run dev and npm start; no restart or rebuild
is needed for text changes. The file must stay named PANEL-TEXT.txt (enable file
extensions in Windows to avoid accidentally saving it as .txt.txt).

When copying the project to a VM or another PC, include PANEL-TEXT.txt. If serving
only the built dist/ folder with an ordinary static server, edit the copy named
dist/panel-text.txt instead. A new build copies the main file into dist/.

## Experience

- **Begin journey:** a photographic Latvian carriage interior opens around a continuously moving countryside view. Orange vinyl seats, pale panels and metal trim follow the supplied interior references. The distant trees, foreground and poles pass at different speeds, while the carriage sways and responds subtly to head/pointer position. The old cabin transforms into a modern Latvian interior with dark patterned seats and yellow handles while the landscape remains continuous. A short horn sounds before the approach when sound is enabled. The IMG_3195 station view arrives inside the window; the scene then opens out to the twelve exterior arrival photographs. Riga is introduced only after the train stops. Skip and replay cancel pending playback cleanly.
- **Photograph into collage:** after the stopped shot, the photograph separates into twelve irregular pieces. They travel towards the photographic objects as the layered collage assembles. Reduced-motion mode skips this spatial transition.
- **Main collage:** coal black, floating photographic fragments, quiet warm accents, and transparent glass controls. Move the pointer to reveal colour. The collage also responds gently to cursor position.
- **Objects:** select the train, tram, bus or station, directly in the artwork. A secondary glass panel contains that object's three chapters. Dates appear only inside these panels.
- **Time as a journey:** each story has a draggable rail with stops at 1975, 2000 and 2025. Dragging blends continuously between photographs; selecting a stop travels smoothly to it. Each vehicle remembers its position. Arrow keys adjust the range, Home/End reach either end, and the stop buttons support arrow-key navigation.
- **Depth and detail:** departure board, platform canopy, passenger, signal, clock, ticket and platform fragments extend the four transport subjects. Separate planes respond differently to pointer movement. Extra station and ticket elements open their related stories. The ticket and clock are original vector artwork; the new photographic fragments use the supplied images.
- **Living collage:** the clock has independent hour, minute and sweeping second hands set to Riga time. The tower, tram and bus use looping horizontal displacement inspired by the supplied Ana Cosma architectural GIF. The existing signal lights pulse. Both colour layers use the same deformation phase, so the cursor reveal stays aligned. Motion pauses during the train journey, in open panels and in hidden tabs; reduced-motion preferences disable it. The clock and elastic distortion remain silent; the sound control also governs vehicle hover cues.
- **Playful vehicle sounds:** hovering over the train plays a rising choo-choo, the tram gives a double bell, and the bus makes a bouncy beep-bop. Sounds are synthesised locally with Web Audio. Entry audio includes a stronger horn. The rolling journey bed fades away before the collage, while hover effects stay enabled unless muted. Brief cooldowns prevent rapid movement from stacking sounds.
- **Original collage:** the information button opens the actual collage from the supporting studies and optional field notes using the new photographs.
- **Accessibility:** keyboard controls, native modal focus handling, Escape dismissal, labelled controls, touch support, and reduced-motion support. Train sound begins with the Begin journey click. The sound control can mute it before or during playback. Status descriptions are available to screen readers; instructional microcopy is removed from the visible interface.

## Architecture

- `server.mjs`: Node HTTP server, explicit MIME types, safe static paths, `/api/health`, and `/api/exhibits`.
- `src/experience.js`: interaction, story panels, per-object chapters, colour lens, cursor, audio and fullscreen.
- `PANEL-TEXT.txt` and `src/panel-text.js`: editable panel copy and automatic updates from the saved file.
- `src/collage-motion.js` and `src/motion.css`: shared elastic photographic deformation, Riga clock hands and animation lifecycle.
- `src/journey.js`: preloading, frame playback, cancellation and replay.
- `src/train-view.js`: canvas scenery, parallax, speed changes, visibility pause and reduced-motion handling.
- `src/fragments.js`: irregular photo partition, spatial breakup, assembly and cancellation.
- `src/time-route.js`: continuous photo blending, accessible range control, stop-to-stop travel and state.
- `src/chapters.js`: timeline content and the ordered arrival-frame manifest.
- `src/artwork.js`: layered SVG photographic cutouts, original source imagery preserved.
- `src/cinema.css`: cinematic visual system, glass, responsive layouts and motion preferences.
- `src/carriage.css`: photographic interior layers, glass, subtle carriage sway and final location reveal.
- `src/fragments.css`: desktop depth composition, extra cutouts, transition and time-route styling.
- `src/content.js`: interpretation, historical sources and image provenance.
- `src/rail-audio.js`: original stereo rail sound, with rolling noise, rail-joint rhythm, motor, deceleration, brakes and air release synced to the shots.
- `scripts/build.mjs`: a clean, self-contained static build in `dist/`.
- `test/`: real HTTP, asset completeness, timeline placement and journey-cancellation checks.

The site can be served statically from `dist/`, or through the supplied Node server. Its story content does not require the API, so it works offline locally.

## Images and interpretation

Original photographs in IMAGES are untouched. Web assets in `public/assets/journey/` are orientation-corrected and resized copies for efficient playback. `forest-window.jpg` is IMG_3206.JPG; `window.jpg` is IMG_3195.JPG. Arrival frames 00–11 follow IMG_3182 through IMG_3194 in the provided order (no IMG_3192 was supplied). No person or face was generated. The original supporting-studies collage appears in the information panel.

The new carriage foreground and scrolling countryside panorama were generated with the built-in image tool. The carriage uses the supplied Latvian interior examples as material references; the stock reference images are not embedded in the site. The original forest-window photo is retained as a loading fallback, and the original station and arrival images remain in the journey. See ASSET-NOTES.md for the asset paths and prompts.

The dates are interpretive chapters, not asserted capture dates. The modern tram reference is from Liepāja and is explicitly identified. The transition chapter uses a trolleybus as a related transport example, rather than claiming it is a bus. Train and Riga tram milestones link to primary sources in their notes.

Anton and its SIL Open Font License remain bundled from the first version; the cinematic interface uses system sans-serif and serif typography. All media stays local; nothing is published or uploaded by the application.

## Snapshot before this version

The previous carriage version is preserved outside the project in `../snapshots/01-carriage-before-fragments.zip`. Its JSON sidecar records the SHA-256 checksum. It includes the complete source, built installation and assets from before the fragmentation, extra collage elements and time route. Extract into a separate folder to run or compare it. Stop the current server first if using the same port. The snapshot is not overwritten by builds or source-ZIP updates.

The train, tram and bus have synthesised hover sounds. The photo breakup and time
route remain silent. The sound control governs the entry sequence and hover
effects. Development and visual verification focus on desktop.
