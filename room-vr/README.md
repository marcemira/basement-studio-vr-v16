# Basement Studio — life-size VR

This is an actual interactive 3D scene, modeled in metres, rather than a panoramic image. The room is **3.80 m across the TV wall × 3.32 m deep × 2.50 m high**. The original **2.50 m furnished depth** is marked when dimension annotations are enabled. The remaining 82 cm at the front contains the east-wall entrance.

## Version 16: furniture finishes and furniture-only view

Open **Furniture finishes & room mode**. Choose frames/drawer fronts and worktops/shelves independently, using solid colors, wood patterns, woven textures or a custom color. Apply them to all furniture or override one module. **Use shared finishes** removes the selected module override. Matte, satin and gloss alter the physical material's roughness and reflections. Furniture dimensions and equipment materials remain unchanged.

The options include Blanco, Negro, Faplac Gris Basalto, Gris Tapir, Gris Caliza, Kiri, Paraíso, Terracota, Jade and Yute. These are approximate colors and locally generated textures, not calibrated manufacturer swatches. Córdoba suppliers such as [Malkoni](https://malkoni.com.ar/productos/) list Faplac and Egger; see the [Faplac catalogue](https://www.faplaconline.com.ar/home/c/ar-faplac/ar-melaminas?lang=es) for manufacturer finishes. Confirm actual samples, stock, board thickness and available substrate/finish combinations with the supplier.

Select melamine over **MDF**, **agglomerate/MDP**, or **MDP RH**. The same melamine finish looks the same on these substrates; the board choice is recorded in the construction parts list without changing modeled thicknesses. It does not simulate structural strength or moisture behavior.

Set **Show → Furniture only** to inspect the built-in furniture in the empty room. This hides equipment, collectibles, CD cases, chairs, the movable gaming desk and equipment accent lights, while keeping built-in desktops, empty compartments, doors, trays, installed shelf LEDs and room features. Switching back restores equipment positions and individual visibility settings. The VR panel has a **Finishes & furniture-only mode** page too.

Finishes, module overrides and room mode persist locally and are included in settings JSON save/load. Existing settings files remain supported. Export 3D model respects furniture-only mode. **assets/furniture-only-meters.glb** is an equipment-free example with black frames, wood-pattern surfaces and a grey music worktop; **plans/furniture-only-example-settings.json** loads its configuration. Construction drawings and the parts list use current finish selections; reopen them after changing finishes.

## Version 15: modules, settings loading, and construction plans

The **Retro PC corner** is a separate named 3D module joined flush to the music return. It contains the 45-degree worktop, three corner shelves, Roland equipment, six CD compartments, a sliding keyboard tray and an open tower bay. Corner and music desktops are separate pieces at the same 806 mm surface height. Upper shelves also have a module joint. CD compartments face into the room, beside the MIDI units, with 112 × 170 × 160 mm clear space each (42 example jewel cases). The west-wall tower bay has 236 × 460 × 550 mm clear space. Its open front/rear and side position keep the tower outside the diagonal footwell; actual tower ventilation and service clearance must be checked against the equipment used. Existing corner/depth sliders and centering rules still apply.

**Save furniture settings (.json)** now includes cabinet LED visibility separately from lighting levels, equipment positions/visibility, screen content/images, RGB animation, navigation, desk height and room view switches. **Load settings (.json)** validates a selected local file before applying it. Original flat settings files are supported. Older saves that overwrote the cabinet LED switch with lighting values retain the current cabinet LED switch because that missing information cannot be recovered. Invalid files leave the room unchanged. Files stay local.

**Construction & LED diagrams** opens two views for the current arrangement. Construction offers a room plan, a south elevation projection, dimensioned shapes of modeled boards/glass, part IDs, thicknesses and a table. Filter by module, save the SVG drawing, download a parts CSV, or download parts and LED groups JSON. Nonrectangular corner pieces include their room X/Z polygon vertices. Numeric dimensions are in millimetres, rounded from the model. CSV dimensions are local part X/Y/Z; positions and assembled bounds in JSON are room coordinates. Reopen the diagrams after changing the room sliders to generate the updated plan.

The LED view assigns every modeled strip to a module/shelf group, with one independent RGB controller per group and parallel 4-wire connections for multiple strips in a group. The default scene has 37 strips in 22 groups. The diagram assumes **24 V constant-voltage analog RGB, common anode**, not addressable LEDs. Adjust LED W/m to match the chosen strip's full RGB-white rating. The diagram calculates lengths, group currents, total load and a 25% power reserve assumption. The default 14.4 W/m assumption gives about 20.13 m / 289.8 W / 12.08 A, with a 362.3 W allowance before controller consumption. Multiple suitably rated supplies/controllers may be needed; do not join positive outputs from separate supplies. Match V+/R/G/B on every branch. Supply 0V feeds the controller input, not a color output.

These are **concept construction and low-voltage wiring diagrams**, not final fabrication or installation drawings. Board/glass specifications, joint design, wall anchors, brackets, edge banding, machining tolerances, drawer slides, load capacity, controller per-channel/total ratings, branch protection, cable sizes, voltage drop and strip cut increments must be resolved before building. Mains wiring is deliberately represented only by an existing outlet and a certified enclosed SELV supply. PC Aura synchronization needs compatible real controllers/software; the simulator does not control physical hardware.

Wiring references: [common-anode current and RGB load](https://www.hiline-lighting.co.uk/gb/blog/led-strip-lights/common-anode-current-colour-changing-led-strip), [constant-voltage strip power supplies](https://www.waveformlighting.com/support/led-flex-strips). Default SVG drawings and the structured parts/groups list are bundled in **plans/**. They are snapshots; use the live diagram viewer for a customized room.

## Start on this PC

1. Double-click **Launch Room VR.cmd** in this folder. It starts a small local viewer and opens **http://localhost:8877**. Keep its minimized server window running while using the viewer. Close that window when finished.
2. For PC VR, use the working Brave + Virtual Desktop/VDXR combination on this PC, or your configured Quest Link/Air Link connection.
3. Open **http://localhost:8877** in desktop **Brave** on this PC. The embedded preview browser does not expose the PC headset.
4. Press **Enter VR**. If the button reports VR is unavailable, connect the headset before starting the browser, confirm the active OpenXR runtime and browser hardware acceleration, close other immersive browser sessions, and reload. The app checks browser capability; a Meta account login alone does not establish the PC headset connection.

All rendering dependencies and textures are local. No account login, cloud upload, paid service, or internet connection is required to view the scene after delivery. The launcher uses the Node runtime already present on this PC; on another PC with Node.js installed, run `node serve.mjs` from this folder. Do not open index.html directly as a file, because module loading and VR require a served page.

The loopback viewer address is for the **PC browser with PC VR**. Entering this address in the headset's standalone browser points at the headset, not your PC. This package does not configure LAN hosting, HTTPS, or a standalone-headset deployment.

## Controls

- Desktop: drag to orbit, wheel to zoom, right-drag to pan. The viewpoint buttons move between the room overview, interior, gaming desk, music desk, vintage PC, collection, and floor plan. The floor plan uses an orthographic camera so furniture heights do not distort their apparent widths; choose another view to orbit.
- Desktop walking: press **F**, then use WASD and the mouse; Escape exits walking mode.
- VR: physically look around at one-to-one scale. Left thumbstick walks; right thumbstick turns smoothly with adjustable speed. Its vertical axis does not change height. Point at equipment and hold grip to move it; release to save. Point and press the trigger to operate the floating VR controls or furniture. Point at the floor and press the trigger to teleport. B or Y hides the panel; press again to place it in front of you.
- Glass doors, side storage drawers, the piano tray, the retro keyboard drawer, and the entrance door open and close. Click the furniture or use the controls panel.
- Adjust the gaming desktop from 70 to 120 cm; choose parquet or carpet; adjust cabinet lights; show ceiling and dimension annotations.

Movement boundaries cover the main furniture footprints. They do not simulate every moving door, drawer, chair, or cable. Physical headset movement remains controlled by your real-world play boundary.

## Layout and dimensions

From the overview, **east is left, west is right, south is the rear TV wall**. The door is at the bottom-left, in the extra front area. Coordinates: x runs -1.90 to +1.90 m; z runs 0 at the south wall to 3.32 m at the front; y is height above the floor.

| Item | Modeled dimensions |
|---|---|
| East gaming desk | 180 cm along wall × 80 cm deep; initial top at 75 cm |
| South retro cabinet | Adjustable 180–210 cm wide × 35–40 cm deep × 230–250 cm tall; default 195 × 40 × 250 cm |
| TV | Select exact 55-inch (121.8 × 68.5 cm screen) or 65-inch (143.9 × 80.9 cm screen), 16:9 |
| Console display | Default four columns × four rows: 16 console bays; adjustable four to six rows, 17 cm row pitch |
| West music desk | 150 cm along wall × adjustable 40–65 cm deep; default 45 cm; continuous worktop surface at approximately 81 cm |
| Piano | Representative 88-key instrument, 140 × 30 × approximately 12 cm |
| CRT | Representative 17-inch monitor, approximately 41 × 40 × 43 cm |
| Corner workstation | Continuous 45-degree desk; adjustable diagonal front 55–106 cm, default 60 cm; available range depends on cabinet width and music depth |
| Door opening | 80 cm wide; representative 207 cm opening height |
| HYTE Y60 | 28.5 cm wide × 45.6 cm deep × 46.2 cm tall |

The door occupies z = 2.51–3.31 m on the east wall. Its modeled inward swing stays in the front entrance area. Wall dimensions describe the clear interior room; exterior wall thickness is additional. The ceiling surface is exactly 250 cm above the floor.

The TV cabinet is now **centered on the south wall by default**. A 195 cm cabinet leaves **92.5 cm on each side**. The east fixed-PC station fills its side; the west corner desk and music return fill the other side. The gaming desk retains 180 × 80 cm.

Use **Music desk depth** (40–65 cm) and **Retro corner diagonal front** (55–106 cm) to resize the joined worktop modules. The music length stays 150 cm. The front always remains at 45 degrees; its horizontal and vertical spans are each diagonal width ÷ √2. Corner reach from the rear wall = music depth + diagonal width ÷ √2. A bridge fills any space between the corner and the TV cabinet, so the modules remain connected as the triangle shrinks. Desktop, shelves, panels, keyboard tray, chair, piano tray, collision boundaries and exported model rebuild together.

**Keep cabinet centered** starts enabled. With it enabled, slider limits fit the west module into the available side width: corner reach ≤ distance from the cabinet’s actual right edge to the west wall. With both side display columns present, this is (380 − cabinet width) ÷ 2. The music depth limit reserves at least a 55 cm diagonal front. For example, a 195 cm cabinet permits a 67 cm front with a 45 cm music desk, while a 210 cm cabinet permits 56 cm. The default is 195 cm cabinet / 45 cm music depth / 60 cm diagonal front. Its music desk runs from z = 87.4 cm to 237.4 cm, leaving 94.6 cm at the north end.

Turn off the centering switch to permit larger corners. The cabinet moves east only when needed, and its east station stays at least 45 cm wide. Increasing music depth then also changes the cabinet position when the west side no longer fits. The summary reports the actual offset. Re-enabling centering returns the cabinet to the center and reduces oversized settings to the available range. Settings below a 60 cm diagonal front are marked compact so you can evaluate seated access in VR.

The CRT and chair remain on **x + z = 1.90**, the corner's 45-degree bisector. The CRT and MIDI modules face toward the seating position. No drawer pedestal blocks the corner-to-music junction. Equipment dimensions are representative; the adjustable model is a spatial design tool rather than fabrication drawings.

The HYTE case now rests on a **fixed 55 cm-deep surface at approximately 81 cm height**. It stays fixed as the sit-stand desk moves. Below it are a representative 18 × 40 × 35 cm UPS, a vented hinged access door, rear cable storage and a cable route. The fixed module stops at z = 0.55 m, leaving a 10 cm gap before the lifting desk. Actual UPS dimensions, ventilation and wire clearances need final measurements before fabrication.

The TV cabinet stays connected to both side modules as its width and position change. The default fixed-PC station is 92.5 cm wide; larger unlocked corners can reduce it to 45 cm.


The named console collection occupies **11 bays**, with **5 reserved for future consoles**. NES, SNES, and Genesis are interpreted as the Japanese **Famicom, Super Famicom, and Mega Drive**. The Wii is displayed horizontally. The Xbox One is a representative original-size unit. Bays are display concepts; practical ventilation, plug clearances, cabinet hinges, and actual equipment should be checked before fabrication.

## 3D model

**assets/basement-studio-meters.glb** is the complete static 3D model with local textures, named objects, furniture, room shell, and equipment. One unit is one metre. It can be opened in a compatible glTF/GLB viewer or imported into Blender. Unity and Unreal import workflows depend on their installed glTF support. Furniture interactions are implemented in the supplied WebXR viewer; the exported GLB is a static snapshot and does not include those interactions or an engine-specific VR project.

The viewer's **Download 3D model** button exports the current furniture positions and finishes, with the retained walls and ceiling included; the north side remains open. Save different GLBs to compare layouts or open/closed configurations.

## Detail and verification

The scene includes individually modeled piano keys, speaker drivers, console lids, buttons and ports, glass frames and hinges, computer vents and internal components, keyboard keys, a streaming microphone arm, vintage MIDI modules, CD cases, floppy disks, cables, and illustrative collectible figures. Screens use original illustrative textures, not running software or game emulators.

Room and major furniture dimensions are explicit. Equipment, joysticks, and figures are detailed representative approximations, not scanned assets or manufacturer CAD. This is a real-time design visualization, not a photorealistic reconstruction or construction drawing. The precise collection, speaker model, cabinet mounting details, and installed services remain to be finalized.

Desktop loading, furniture actions, viewpoints, and GLB export were checked in the local browser. A headset session, controller mapping, and frame rate still require testing on your Quest/OpenXR setup. The embedded preview browser reported immersive VR unavailable, which is expected for a browser without an exposed headset runtime.

## Sources and dependencies

Representative equipment dimensions and silhouettes were informed by:

- Nintendo Famicom: https://www.nintendo.com/jp/famicom/hardware/index.html
- Nintendo Wii: https://www.nintendo.co.jp/en/wii/console/index.html
- Sega Mega Drive: https://www.sega.jp/fb/segahard/md/data.html
- Sega Saturn: https://www.sega.jp/history/hard/segasaturn/index.html
- Sega Dreamcast: https://www.sega.jp/history/hard/dreamcast/index.html (axis labels on the published table appear transposed; model uses width 190, depth 195.8, height 75.5 mm)
- HYTE Y60: https://hyte.com/de/store/y60-refurb/cs-hyte-y60-r1-ww
- Other equipment dimensions are approximate representative values, not verified measurements of your devices.

WebXR implementation: https://threejs.org/manual/pages/how-to-create-vr-content.html

PC OpenXR/WebXR background: https://www.khronos.org/developers/linkto/unifying-reality-building-portable-ar-vr-experiences-with-openxr

Three.js 0.180.0 and its included addons are vendored under their MIT license; see vendor/LICENSE.txt. All other scene code and illustrative textures were created for this room.


## Furniture configurator

The layout controls resize the corner and music desk as described above. The Design the cabinet controls change width (180–210 cm in 5 cm steps), depth (35–40 cm), height (230–250 cm), TV size (55 or 65 inches), glass, cabinet LEDs, side drawers, and the upper display. Back panels and side panels affect the connected PC/music assembly. Settings are remembered in this browser. Save furniture settings downloads the values as JSON; Download 3D model exports the currently displayed geometry.

For programmatic changes, edit the default `furniture` object in `cabinet.js`, or call the viewer API after the room loads. All linear values use metres:

```js
window.roomViewer.configureFurniture({
  width: 2.10, depth: 0.40, height: 2.50, tvInches: 55,
  glass: true, lighting: true, storage: true, upper: true,
  backPanels: true, sidePanels: true
});
```

The API synchronizes the controls, collision footprint, dimension labels, and exported model. The cabinet connection edges and retro PC seating area follow the chosen layout; piano keys and equipment retain their dimensions. The fixed southeast module resizes with the cabinet’s left edge. Cabinet grid count is intentionally kept at 16 display bays; it is not an arbitrary bay-count editor. Sliders update the scene as you move them. The configurator is supplied as source; an exported GLB is a static chosen variant.

Open `http://localhost:8877/?preview=1` to experiment with default settings without changing the saved preferences of the regular viewer. The original 250 cm zone marking is retained as a reference; the music return position now follows the layout sliders.

## Eye height, free walking and controls inside VR

On entering VR, the first tracked headset pose is calibrated to **x = 0, z = 1.66 m**, the room center, facing the TV. Eye height initially starts at **1.78 m**, or the saved selected height, regardless of the runtime's reported floor or physical headset origin. Physical head movement and crouching remain tracked after calibration. **Return to room center** recalibrates from the current headset pose and restores the selected eye height.

The **Position** tab on the floating VR panel provides an eye-height slider (100–210 cm), walking speed, smooth turn speed (5–120 degrees/second), four position steps adjustable from 1–20 cm, one-degree rotation buttons, recentering, Face TV, Reset view and panel repositioning. Height changes only through the explicit slider. The ceiling starts hidden. Free walk starts on and bypasses furniture and room collision boundaries for inspection. Turn it off to use the existing furniture and room movement boundaries. Physical headset movement remains governed by the real headset boundary.

The **Layout** tab includes cabinet width/depth/height, music depth, retro corner front size, TV size, cabinet centering and gaming desk height. Sliders accept a trigger click anywhere along their tracks; plus/minus buttons make individual steps. The **Features** tab controls glass, LEDs, drawers, upper display, workstation panels and open/close actions. Both controllers can point and trigger these controls. Settings stay synchronized with the desktop controls and the exported furniture model.

The working simpler materials are the initial VR mode until you select PBR or a lighting preset; the selected rendering mode is remembered. Desktop rendering uses physically based lighting. Movement and interactions are enabled with simpler materials. Enable **PBR in VR** in the Lighting tab for textured, lit surfaces and reflections; **?quality=full** starts directly in that mode. The floating panel is an actual 3D surface, so it remains visible inside immersive VR without relying on a desktop HTML overlay. For a desktop preview of it, use **Show VR controls**, or **?preview=1&vrcontrols=1**.

Checks cover calibrated height even for a runtime pose reported above the ceiling, center position and viewing direction, controller-ray slider input, shared height changes, recentering, position buttons and render-error recovery. Live headset/controller comfort still needs verification on the Quest.


## Version 10: materials, movable equipment and a lower TV

Desktop uses physically based surfaces with paint microtexture, brushed metal roughness, fabric weave, parquet bump relief and a generated studio reflection environment. These maps are deterministic local assets, with no downloads or external asset licensing required. The scene uses direct lights and environment reflections; it does not simulate ray-traced indirect lighting. Speaker cones, monitor rear ventilation and a movable studio task lamp have additional geometry. Equipment remains representative rather than scanned manufacturer models.

In VR, open **Lighting** and turn **PBR in VR** on. Shadows have a separate switch and start enabled for PBR. Exposure and room-light intensity are adjustable. Simple rendering is the initial VR mode; a chosen PBR mode is remembered. The ?vrsafe=1 link overrides that saved selection for simple rendering. A caught PBR frame error switches back to simple materials. Runtime or graphics-driver failures outside the JavaScript loop may still require ending VR and refreshing.

The **TV** tab changes TV center height, four to six console rows, the number of above-TV display rows, their bottom shelf height, and right display column visibility. The default is four rows and four columns, maintaining sixteen bays with room for the 55-inch TV center at 132 cm. TV height is clamped above the console grid and below the upper shelf; changing either shelf arrangement updates the limit. Five rows use four columns and six rows use three. Any extra cells become accessory cubbies. Both 55- and 65-inch screens retain their correct active-screen dimensions.

The **Objects** tab moves equipment in room east/west, north/south and height axes, and adjusts rotation. Choose Previous/Next, or point at an equipment model and press the trigger while this tab is open. Each object's visibility can be toggled; a single control hides all chairs. Reset returns the selected object to its modeled position. Monitors move with their stands; the gaming desk height control continues to raise its attached equipment. The complete retro hardware group and its individual monitor/speakers can be adjusted separately. The ceiling must be shown to see its adjustable lamps.

Desktop provides equivalent object selectors and sliders. Furniture and object changes are remembered separately in the browser, and object offsets are reapplied after desk/cabinet rebuilds. Save furniture settings includes object offsets, visibility, lighting and the PBR selection in JSON. The GLB export contains the currently visible chosen arrangement, without the floating control panel. The bundled GLB is the default four-row arrangement with all chairs shown. The runtime reflection environment is part of the viewer, not embedded in the GLB.

Checks: 36 cabinet/TV/shelf configurations preserve sixteen bays, fit all eleven consoles, and maintain TV clearance. Tests also cover world-axis movement under rotated desks, chair visibility, rebuild persistence, reset/restore, VR panel inputs, and the existing headset calibration and simple-render safeguards. Headset rendering with PBR and shadows requires testing in the user's Brave/Virtual Desktop session.



## Version 11: wall clearance and modular display rows

The shelves running along the east wall have been removed and replaced by six shallow acoustic panels. The fixed southeast PC station retains three short shelves against the south wall, each stopping before the liftable desk. Tests verify that the default ultrawide monitor clears these shelves at desk heights of 70, 90 and 120 cm. Equipment moved manually with the object editor should be checked in its chosen positions.

The north wall is removed from the scene and exports. An empty named opening group remains as an internal reference; it contains no wall geometry.

**Right cabinet display column** on desktop, or **Right display** in the VR **TV** tab, optionally removes the right column's shelves, figures, drawers, glass and outer frame. The main TV/console section keeps its center position. The connected corner worktop and shelves extend to the shortened cabinet edge; the corner-size and music-depth sliders gain more range. With the default 195 cm cabinet, 55-inch TV and four console rows, this frees 24.6 cm. Cabinet width refers to the nominal full unit with both display columns; the dimension annotations and exported footprint show the actual width of the shortened unit.

**Display rows above TV** adds actual shelves, figures, LED strips and separate glass doors, with one to three rows. Each row reserves at least 22 cm of height. Adding a row can lower the bottom of the upper display and the permitted TV center height, rather than increasing the cabinet height. The available row count respects the ceiling, TV screen and console grid. The original upper-display switch hides all these rows.

The included **assets/basement-studio-meters.glb** uses the default full cabinet, one upper row and visible chairs. **assets/basement-studio-open-corner.glb** illustrates the removed right column, 80 cm corner diagonal, two upper rows and hidden chairs, matching the preview. Both have acoustic panels and the open north side. Existing browser preferences remain supported; new options use their defaults until changed.

Validation covers 72 combinations of cabinet height, TV size, console rows, upper rows and right-column visibility, plus corner-extension measurements, a wider diagonal range, sixteen console bays, monitor lift clearance and the existing VR calibration/render recovery tests. The viewer loads without browser errors.

## Version 12: RGB lighting, grip placement and precise navigation

The Lighting tab and desktop preset selector offer **Off · screens only, Basic room, PC RGB only, Shelf RGB only, Balanced studio, Aurora · synced, Cyberpunk, and Warm evening**. Choosing a preset enables physically based rendering in VR. Room, PC and shelf brightness are independent; master brightness and exposure adjust the whole scene. Cabinet LEDs must be enabled for the cabinet's light sources to exist.

The RGB tab has PC, Shelves and Room selections, eight color swatches, RGB channel sliders and brightness. Desktop has matching color controls. **Sync PC + shelf RGB** shares the PC color with the shelves while keeping brightness independent. This simulates Aura-style RGB in the model; it does not connect to or control physical PC hardware.

Colored light illuminates the textured surfaces. Opaque furniture, equipment and the PC frame cast shadows from the main shadow-enabled lights; transparent glass does not cast opaque shadows. Console rows have local fill lights. The generated reflection environment follows the selected lighting colors, brightness and moved PC light position. It approximates light-source reflections; it does not provide ray-traced object reflections or indirect light bouncing. These rendering effects require PBR in VR.

**Move equipment:** point at an object, hold the controller grip, move or twist the controller, then release. It stays upright and rotates around its vertical axis. Monitors, speakers, lamps, PC cases, console models, MIDI equipment, keyboards, mice, chairs and collectibles are selectable. Open a glass door to point at objects behind it. Grip placement uses the same saved offsets as the Objects sliders; settings survive refresh and furniture rebuilds in this browser. Parent equipment groups carry their children. Fixed worktops and cabinet structure remain controlled by the layout sliders. Reset selected or Reset all object positions restores the modeled arrangement; resetting all also shows chairs.

**Move your viewpoint:** left stick walks, right stick turns continuously. Small right-stick movements turn more slowly. Turn speed ranges from 5–120 degrees/second, starting at 45. The right stick's vertical axis has no height action. Rotation pivots around the tracked headset position. Position provides one-degree left/right buttons, adjustable 1–20 cm directional steps, **Face TV**, **Return to room center**, and **Reset view · 178 cm**. Recenter uses the current tracked pose and selected height; Reset restores the center, TV heading, 178 cm height and default movement settings. B or Y hides or brings back the panel.

Lighting, equipment offsets, eye height and navigation preferences are remembered in this browser. Save furniture settings includes these values and the rendering selection. The default GLB has studio lighting; the open-corner GLB uses Cyberpunk lighting, an 80 cm diagonal, two upper rows and hidden chairs. Runtime reflections and interactive controls remain part of the viewer.

Verification covers eight presets, RGB synchronization, black PC materials, transparent-glass shadow rules, light persistence after rebuild, reflection resource cleanup, grip movement through rotated parents, saved placement, upright rotation, controller ownership, smooth-turn deadzone, headset-centered yaw without height changes, and VR-panel controls. Desktop PBR rendering and both GLB exports were checked without browser errors. Controller feel and PBR performance should be checked in the working Brave/Quest session.
## Version 13: visible side walls, animated RGB and screen light

East and west walls are visible in every desktop viewpoint, including Overview and Floor plan. The north side remains open. The ceiling still has its own visibility control.

Desktop **RGB animation**, and the VR **RGB** tab, offer Static color, Breathing, Rainbow, Color cycle and Rainbow wave. Speed ranges from 0.1× to 3×; Pause freezes the current RGB frame. Sync aligns PC and shelf animation timing; wave/rainbow effects retain spatial color variation across the emitters. Room lights keep their chosen steady color. RGB emitters, colored illumination and the generated reflection lighting update together. Reset lighting restores the static studio setup.

**Screen content & light** on desktop and **Screens** in VR select the TV, gaming ultrawide, music monitor or retro CRT independently. Choose original artwork, mountain wallpaper, music arrangement, retro desktop, animated retro game, animated aurora, color bars, white or off. The animations are illustrative scenes, not running games or emulators. Screen brightness ranges from 0–150%; Cast light from screen controls illumination separately.

Each display casts a broad directional light based on the image's sampled average RGB in linear color space, its brightness and screen area. Animated content updates its light at ten samples per second. Hidden or black/off screens cast no light. Lights move with their displays, and the TV screen light casts shadows when shadows are enabled. Screen lighting remains independent of the PC/shelf/room preset, so **Off · screens only** isolates the displays. Surrounding-surface illumination requires PBR; simple VR mode still displays the screen images.

Desktop **Use my image** applies a local image to the selected display. It is fitted with black bars, resized to 1024 × 576 and saved in this browser as a JPEG; nothing is uploaded. Select **My image** in VR to reuse it. Screen settings and images survive refresh and cabinet/desk rebuilds. Save furniture settings includes the screen choices and images.

Light-source reflections are generated approximations, refreshed at a limited rate to avoid rebuilding them every frame. This does not simulate pixel-by-pixel light transport or ray-traced indirect illumination. Exported GLBs contain a static frame of screen textures and lights; animations run in the supplied viewer. Both bundled GLBs have been re-exported: default studio, and an open-corner example with RGB wave, animated aurora TV and retro-game ultrawide.

Checks cover linear image sampling, screen-brightness scaling, off/hidden/glow behavior, screen persistence across furniture rebuilds, animation progression/pause/sync, no per-frame browser storage writes, independent screen lights, VR screen/effect controls, and the existing layout clearances. Desktop screen-only and animated RGB scenes rendered without browser warnings or errors. Quest performance and controller comfort still need verification in the working Brave session.

## Version 14: every shelf LED emits downward and has occlusion

The old cabinet/row fill lights and east/west shelf spill point lights are removed. Every console bay, side-display level, upper-display row and fixed southeast shelf has its own continuous strip emitter. Each corner-to-music shelf has south, diagonal and west-return strip segments. The default room has **37 independent strips**; the removed-right-column/two-upper-row example has **34**.

Side-column strips are mounted below the actual next shelf board, instead of floating between shelves. Cabinet and southeast strips sit toward the front of the shelf to illuminate the display objects. Each strip has a bounded downward lighting footprint. Its direct illumination is zero above the emitter; the shelf-light reflection environment no longer supplies unoccluded room-wide fill. Colored direct light contributes to the physical material's diffuse and specular response.

Opaque shelves, dividers and equipment are rendered into a **2048 × 2048 shared depth atlas**, with a 256 × 256 tile for each strip. Vertical occlusion and filtered shadow tests prevent light from passing through these surfaces. Glass stays transparent to the shadow pass. Three tiles update per frame, and a final complete pass is queued after movement ends, so moved objects eventually have consistent shadows. This is shadow-mapped direct lighting with an approximate line emitter and vertical occlusion; it is not ray-traced global illumination or a light-bounce simulation.

**PBR materials in VR** and **Light shadows** must both be enabled to see lit surfaces and shelf blocking inside VR. Use **Shelf RGB only** to inspect the change. Turning off shadows removes occlusion; the fixtures still have their downward bounds. RGB animation colors and strip illumination remain synchronized. The desktop lighting section reports the current emitter count; saved VR diagnostics also include atlas status.

Three.js rectangular area lights have no shadow support ([RectAreaLight documentation](https://threejs.org/docs/pages/RectAreaLight.html)), so this viewer uses a custom shared occlusion atlas instead of adding dozens of separate shadow-map samplers. The source retains the previously working WebGL/WebXR renderer.

GLB exports now use a separate scene snapshot and include one downward-facing spotlight approximation per strip. The default asset has 37 shelf-light sources; the open-corner asset has 34 and captures a shelf-only RGB-wave frame. The custom atlas and animation logic run in this viewer. Generic GLB importers must supply their own lighting/shadow rendering, so their appearance can differ.

Checks cover complete strip counts, removal of cabinet point-light fills, rejection of positions above strips, shared shadow pass execution, render-target/viewport/XR state restoration, queued final shadow updates after movement, furniture rebuilds, disabled cabinet LEDs, isolated snapshot exports and exported downward directions. Screen/RGB/VR controls, grip placement and 72 shelf/cabinet configurations also pass. Desktop shaders render without new errors after the changes; live Quest frame rate remains to be checked.
