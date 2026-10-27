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
