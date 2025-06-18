/* global Autodesk */

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

export async function initViewer({
  containerId,
  urn,
  extensions = [],
  events = [],
  onViewerReady,
}) {
  const response = await fetch(`${backendUrl}/auth/token`);
  const { data } = await response.json();

  const options = {
    env: "AutodeskProduction",
    api: "modelDerivativeV2",
    accessToken: data.access_token,
  };

  const config = { extensions };

  const container =
    typeof containerId === "string" ? document.getElementById(containerId) : containerId;

  if (!container) {
    console.error("Viewer container not found!");
    return null;
  }

  const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);

  Autodesk.Viewing.Initializer(options, () => {
    if (viewer.start() !== 0) {
      console.error("Failed to start viewer");
      return;
    }

    Autodesk.Viewing.Document.load(
      `urn:${urn}`,
      (viewerDocument) => {
        const defaultModel = viewerDocument.getRoot().getDefaultGeometry();
        viewer.loadDocumentNode(viewerDocument, defaultModel);
        if (typeof onViewerReady === "function") {
          onViewerReady(viewer, viewerDocument);
        }
        events.forEach(({ name, handler }) => {
          viewer.addEventListener(name, (evt) => handler(evt, viewer));
        });
      },
      (error) => {
        console.error("Error loading document:", error);
      }
    );
  });

  return viewer;
}
