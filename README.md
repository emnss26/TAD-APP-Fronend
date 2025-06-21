<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# TAD-APP-Fronend
TAD-APP-Fronend
>>>>>>> 0d465505cda816f13c117229ca450ea61acfb01b

## Proposed Viewer Extensions

The Autodesk Platform Services viewer supports many optional extensions. Consider enabling additional tools such as:

- `Autodesk.Viewing.ZoomWindow` for quick zoom window selection.
- `Autodesk.Viewing.MeasureTools` to measure distances and areas in the model.
- `Autodesk.Viewing.MarkupsCore` for markup and annotation features.

These extensions can enhance the user experience when working with the built-in APS viewer.

## VR Viewer Usage

To enable the WebXR viewer you need Three.js and its GLTF loader:

```bash
npm install three
npm install three/examples/jsm/loaders/GLTFLoader.js
```

Open the application in the Oculus Browser and navigate to the VR viewer page. Press the **VR** button to start the immersive experience. The viewer only supports models in **GLTF** or **GLB** format. If your federated model is in another format you must convert it before using this feature.
