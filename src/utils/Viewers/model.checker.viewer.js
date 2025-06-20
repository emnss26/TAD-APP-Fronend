/*global Autodesk*/

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

  import "../Viewers.extensions/extract.model.data";
import "../Viewers.extensions/category.selection";
import "../Viewers.extensions/show.dbId.data";
import "../Viewers.extensions/visible.elements.selection";
import "../Viewers.extensions/type.name.filter.selection";

export const modelcheckerviewer = async (urn) => {
  const response = await fetch(`${backendUrl}/auth/token`);
  const { data } = await response.json();

  const options = {
    env: "AutodeskProduction",
    api: "modelDerivativeV2",
    accessToken: data.access_token,
  };

  const config = {
    extensions: [
      "ModeDataExtractionExtension",
      "CategorySelectionExtension",
      "VisibleSelectionExtension",
      "TypeNameSelectionExtension",
      "ShowDbIdExtension",
    ],
  };

  const container = document.getElementById("TADModelCheckerViwer");
  if (!container) {
    console.error("Viewer container not found!");
    return;
  }

  Autodesk.Viewing.Initializer(options, () => {
    const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
    if (viewer.start() !== 0) {
      console.error("Failed to start viewer");
      return;
    }
    Autodesk.Viewing.Document.load(
      `urn:${urn}`,
      (doc) => {
        const geom = doc.getRoot().getDefaultGeometry();
        viewer.loadDocumentNode(doc, geom);
      },
      (code, msg) => console.error("Error loading doc:", code, msg)
    );
  });
};
