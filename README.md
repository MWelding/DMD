# Change in Progress

An interactive digital installation about Riga's public transport, developed from the supplied supporting studies. The experience pairs a train-window arrival with a photographic Constructivist collage, four object stories, a moving colour lens, and three interpretive chapters.

## Run locally

Requires Node.js 20 or newer. No dependency installation or external services are needed.

```sh
npm run dev
```

Open http://127.0.0.1:3000. For a different port, set the `PORT` environment variable.

```sh
npm test
npm run build
npm start
```

`npm start` serves the built `dist` directory. Run `npm run build` after changing source files. The build is also compatible with static hosting; all exhibit content is included as a local ES module. The Node server provides `/api/health` and `/api/exhibits` for future integrations. The installation does not require those endpoints when hosted statically.

## Architecture

- `server.mjs`: dependency-free Node HTTP server, explicit MIME types, safe path resolution, read-only content API, production mode.
- `src/app.js`: arrival state, keyboard/pointer/touch controls, era selection, accessible modal stories, audio and fullscreen controls.
- `src/artwork.js`: original SVG and CSS composition. Embedded photographic fragments use SVG clip paths; original image files are preserved.
- `src/content.js`: exhibit text, era labels, source links, captions, and image provenance notes.
- `src/audio.js`: optional locally synthesised railway ambience; no audio downloads or autoplay.
- `src/styles.css`: responsive composition, motion, print-like texture and reduced-motion support.
- `scripts/build.mjs`: portable static output, without remote fonts or runtime dependencies.
- `test/server.test.mjs`: real HTTP checks, path traversal protection, and content/asset completeness.

## Interaction

Choose **Take a seat** for a roughly seven-second arrival, or **Skip journey**. Move across the collage to reveal colour beneath monochrome. Select the train, tram, bus, or station to reveal its story. The timeline supports click, touch, arrow keys, Home and End. Dialogs support Escape and restore keyboard focus. Turn the colour lens off to inspect each era without a pointer. Touch users can drag the lens and tap an object label. The operating system's reduced-motion setting removes continuous motion and skips the moving journey.

## Source and interpretation notes

The supplied supporting-studies presentation is the source of the transport and station imagery and the starting point for the composition. The website extends its grayscale/colour contrast, Constructivist geometry, floating objects, and cursor-reveal idea. Third-party artist research images are not reproduced as finished artwork.

1975, 2000, and 2025 are interpretive chapters, not asserted capture dates for the photos. The contemporary tram reference is from Liepāja, as its destination sign indicates, and is explicitly identified as a low-floor design reference in its story. Train and tram milestones link to primary operator/manufacturer sources. Memories and emotional interpretations are identified as artistic interpretation rather than historical evidence. Individual photo authors and permissions should be confirmed before a public museum exhibition.

The original examination brief asks for the final creative solution to be completed during the supervised test. This working implementation is an AI-assisted development artifact; keep an honest record of your process and follow your centre's requirements for the assessed submission.

## Exhibition setup

Use a desktop browser at 1280×800 or larger for the main composition, select fullscreen, and enable sound if appropriate for the venue. The touch layout works on smaller screens. Everything runs offline once the folder is present and the local server has started. No visitor tracking, accounts, or database is required.
