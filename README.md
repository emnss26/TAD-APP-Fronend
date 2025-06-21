# TAD-APP-Fronend

This project is a React + Vite application for the TAD platform.

## Proposed Viewer Extensions

The Autodesk Platform Services viewer supports many optional extensions. Consider enabling additional tools such as:

- `Autodesk.Viewing.ZoomWindow` for quick zoom window selection.
- `Autodesk.Viewing.MeasureTools` to measure distances and areas in the model.
- `Autodesk.Viewing.MarkupsCore` for markup and annotation features.

These extensions can enhance the user experience when working with the built-in APS viewer.

## VR Viewer

The VR viewer allows inspection of the federated model using a WebXR compatible headset such as the Oculus (Meta Quest).

### Installation

```bash
npm install three
```

If you plan to load GLTF/GLB models you may also need the `GLTFLoader` from the `three` examples:

```bash
npm install three/examples/jsm/loaders/GLTFLoader.js
```

### Using Oculus

1. Open the application in the **Oculus Browser**.
2. Navigate to the VR page and wait for the model to load.
3. Press the **VR** button to start the immersive experience.

If your model is not in GLTF/GLB format you will need to convert it before using the VR viewer.
