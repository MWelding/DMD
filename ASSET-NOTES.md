# Generated scenery and carriage assets

Both assets were made with the built-in Image Generation tool and saved in this project. The supplied reference photographs remain unchanged. No watermarked reference image is embedded in the site.

## Carriage foreground

Path: `public/assets/journey/latvian-carriage.png`

Photographic interior with a genuinely transparent window opening, allowing the moving landscape to remain an independent layer. It is an artistic interpretation of the supplied Latvian commuter-train references, rather than a documented exact vehicle interior.

Final prompt:

> Use case: precise-object-edit. Image 1 is the edit target: a photographic train-interior overlay. Images 2 and 3 are material/design references for Latvian train interiors only. Create an ORIGINAL realistic Latvian commuter-train side-wall interior, keeping image 1's perfectly frontal camera and its large central single rounded-rectangle window and same composition. Change the brown wooden wall into pale warm ivory/cream laminate panels, gray ceiling, brushed aluminum window trim with visible screws and black rubber gaskets. Replace the patterned olive seat corners with simple worn burnt-orange vinyl bench-seat corners inspired by image 2, realistic seam stitching and curved metal edges. Practical cool-white ceiling strip light across the top, soft natural daylight. Preserve the enormous central window opening at x=10 to 90%, y=13 to 69% approximately. CRITICAL: the whole inside of that window must be genuinely transparent alpha, without black glass, a scenery image or opaque reflections; it is a hole for a website's moving scenery. All surrounding train interior must be opaque. No people, lettering, logos, watermark, or graphics. Tactile believable photographic materials, not a futuristic capsule or interface. Wide landscape 1536x1024. Preserve the composition so this functions as a stationary foreground window frame over motion.

## Moving countryside

Path: `public/assets/journey/countryside-panorama.png`

An original panoramic forest image. Canvas renders the distant forest, near ground and poles at different speeds. Movement is implemented in code, rather than baked into a video.

Prompt:

> Use case: photorealistic-natural. Website scenery asset for a train-window motion sequence. Make an exceptionally wide 3:1 panoramic photograph of the Latvian countryside as seen sideways out of a moving commuter train, overcast autumn daylight. Continuous forest of mixed dark Baltic pine and birch trees, some muted golden undergrowth, pale gray cloudy sky in the top 30%, flat countryside, thin railway gravel and a low strip of grass along the bottom 15%. The dense continuous tree line is the principal subject. Camera looks horizontally and perpendicular to the tracks, no vanishing-point railroad going into the distance. Everything stretches naturally across a wide landscape, with consistent horizon and forest density at both left and right edges suitable for scrolling. Natural subdued green, gray, ochre. Fine photographic details in distant trees and slight horizontal panning softness in the lowest grass only. No train interior, no window frames or glass, no people, no stations, no signage, no text, no watermarks, no dramatic mountains. Landscape 3072x1024.

## Modern cabin counterpart

Saved asset: `public/assets/journey/modern-carriage.png`, 1536 × 1024 RGBA. Built-in image generation was used to edit the original foreground, with `sample_images` as material references. The originals remain unchanged. The transparent window retains the same placement so the landscape stays continuous during the transition.

Prompt: Create a contemporary version of the existing frontal train-window foreground, preserving its 1536 × 1024 composition, window opening at approximately x=10–90%, y=13–69%, and foreground seat positions. Use the supplied modern Latvian carriage references for warm-white molded panels, charcoal window surround, brushed aluminium, dark blue-black seats with tiny yellow dots, yellow grab handles and restrained ceiling lighting. Keep the central window genuinely transparent, every area outside it opaque, with no scenery, people, text, logos or watermarks. Preserve the camera and window alignment for a seamless old-to-new cabin transformation.

## Animated collage reference

The user-supplied Ana Cosma GIF is a motion reference only; it is not embedded in the installation. The tower, tram and bus use original SVG horizontal displacement loops, with a stronger deformation on the tower. The clock and signal remain code-native SVG artwork. No new raster imagery was generated for the animation request.

## Moving city approach

Saved asset: public/assets/journey/city-panorama.jpg (2172 x 724, RGB JPEG).
Created with the built-in image-generation tool, using the existing countryside panorama for matching sky, horizon and exposure, and the supplied Riga rail-yard observation for architectural material reference. This is an artistic city environment plate, not a documentary panorama of a specific Riga route. The generated PNG original is preserved in the image tool's output folder; the JPEG is a mechanical quality-93 export.

TrainView scrolls the city buildings and near ground at different speeds. Over 6.4 seconds a broad directional alpha mask introduces the city from the right while the forest continues moving underneath. The train eases towards a lower approach speed, then the existing exterior arrival sequence plays. The former static station-window overlay has been removed from the entry scene. The original window.jpg remains in the station card.

Final generation prompt:

Create a PHOTOGRAPHIC ULTRAWIDE 3:1 panorama for an animated train-window scene. Image 1 (the forest panorama) is the LIGHTING, CAMERA HEIGHT, HORIZON AND WIDE COMPOSITION reference. Image 2 (the supplied Riga rail-side observation) is only the architectural and location material reference. Generate an original continuous view of arriving into a Latvian city beside the railway: rows of ochre/red-brick railway warehouses and handsome pale plaster late-19th-century city blocks, a few distant roofs and very subtle spires behind, scattered autumn birches and low shrubs, then open railway ballast in the lowest 15%. Sideways view exactly perpendicular to train movement, at passenger-window height, no deep diagonal vanishing-point tracks. Buildings form a realistic wide horizontal street/railway frontage across the whole width, interrupted by small yards. Match image 1's overcast pale grey sky, soft autumn light, quiet muted green/ochre/grey palette and overall exposure so a moving blend between these two panoramas feels natural. Sky occupies the upper 25%, architecture and trees the middle 60%, near ballast and ground the lower 15%. No train, carriage, window frame, station platform roof, people, readable writing, city labels, logos, watermarks or foreground poles. No monumental landmarks or science-fiction architecture. The foreground ground should be a little softer than the distant building details. Photorealistic cinematic environment plate, not a collage or illustration. Both left and right edges should have similar sky, building height and ground level, suitable for continuous horizontal scrolling. Output exceptionally wide 3:1, ideally 3072 by 1024.
