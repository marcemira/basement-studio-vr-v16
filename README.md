# Basement Studio VR — Version 16

An interactive, life-size Three.js / WebXR studio viewer with furniture customization, lighting, construction diagrams and GLB exports.

[Open the live viewer](https://marcemira.github.io/basement-studio-vr-v16/) · [Download releases](https://github.com/marcemira/basement-studio-vr-v16/releases)

## Run locally

Install Node.js 20 or newer, then run `npm start` and open http://localhost:8877. No dependency installation is needed; Three.js is vendored with its license.

## Build and distribute

Run `npm run build`. The `dist/` folder contains the complete static website, including models, plans, and dependencies. Upload its **contents** to any static host, at either the domain root or a subdirectory. The release ZIP contains these same files at its root. Serve it over HTTP locally or HTTPS remotely; opening HTML directly via `file://` does not support the module imports.

## Public default configuration

The public build loads `room-vr/furniture-settings (5).json` on every page load, including furniture, finishes, equipment positions, screens, and lighting. It is validated at build time and shipped as `default-settings.json`. This preset overrides previously cached settings at startup, so everyone opens the published arrangement. Visitors can adjust it and export their changes during the session. The local `npm start` viewer retains its existing behavior.

## GitHub Pages

The included workflow builds and deploys `dist/` on every push to `main`. In repository Settings → Pages, select **GitHub Actions** as the source. The live site uses HTTPS, required for remote WebXR sessions. Enter VR requires a compatible browser and connected headset; desktop viewing works without a headset.

Settings and uploaded screen images stay in browser storage. Use the app's settings export/import to transfer them between the local viewer and hosted site.

See [the viewer documentation](room-vr/README.md) for controls, features, and VR troubleshooting.
