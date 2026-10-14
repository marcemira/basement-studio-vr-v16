# VR black-screen check

The VR controls version uses a baseline WebXR WebGL layer without requesting the optional layers feature. It reports startup errors, falls back to local tracking when local-floor is unavailable, recenters the first tracked headset pose inside the room facing the TV, and disables dynamic shadows during VR. Desktop shadows return when VR ends. The eye framebuffer uses the runtime's recommended size.

End the existing immersive session, refresh the room in Edge and try Enter VR again. Under **VR CHECK**, the PC panel shows frames, tracked frames, eye views and session visibility. **Save VR diagnostics** downloads a local JSON report with errors and counters.

If the room stays black, open http://localhost:8877/vr-test.html in the same Edge browser and start its VR session. You should see a blue background, a floor grid and three colored cubes. If that is also black, compare with the official WebXR sample at https://immersive-web.github.io/webxr-samples/immersive-vr-session.html.

If the official sample works but our simple scene does not, the local session/rendering path needs further investigation. If the official sample also fails, investigate Edge, graphics acceleration and the active Virtual Desktop/OpenXR display route.

Virtual Desktop's VDXR compatibility list includes Microsoft Edge (WebXR): https://github.com/mbucchia/VirtualDesktop-OpenXR/wiki/Application-Compatibility. The Meta/Oculus OpenXR runtime is for Quest Link/Air Link; Virtual Desktop uses VDXR or SteamVR: https://github.com/mbucchia/VirtualDesktop-OpenXR/wiki.

The viewer does not change installed runtimes or browser settings. Automated checks cover startup fallback, error recovery and recentering; headset rendering still needs a live test on your device.

## Simple test works but room does not

Open http://localhost:8877/?vrsafe=1 in the working browser. This shows the full room with unlit materials that preserve colors, textures, transparent glass, geometry and positions. Controller movement and interaction are now enabled with simpler materials; physical head tracking remains active. The normal viewer remains available at http://localhost:8877/.

The render loop now catches frame errors and reports the failing stage. Controller movement failures disable movement without stopping rendering. A room-rendering exception switches to the blue grid/cubes scene on subsequent frames. Diagnostics include tracked frames, completed render frames, the failing stage and error stack. Click Save VR diagnostics on the PC page after reproducing the failure.
