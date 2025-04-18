/*global Autodesk*/

export const simpleViewer = async (urn, access_token) => {
  //console.log ('urn:', urn);
  console.log("access_token viewer:", access_token);

  const options = {
    env: "AutodeskProduction",
    api: "modelDerivativeV2",
    getAccessToken: (onGet) => onGet(access_token, 3600),
  };

  const container = document.getElementById("TADSimpleViwer");
  if (!container) {
    console.error("Viewer container not found!");
    return;
  }

  Autodesk.Viewing.Initializer(options, () => {
    const viewer = new Autodesk.Viewing.GuiViewer3D(container);
    if (viewer.start() !== 0) {
      console.error("Failed to start viewer");
      return;
    }
    Autodesk.Viewing.Document.load(
      `urn:${urn}`,
      doc => {
        const geom = doc.getRoot().getDefaultGeometry();
        viewer.loadDocumentNode(doc, geom);
      },
      (code, msg) => console.error("Error loading doc:", code, msg)
    );
  });
}