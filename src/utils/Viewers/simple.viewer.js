/*global Autodesk*/

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";


export const simpleViewer = async (urn) => {
  
    const response = await fetch (`${backendUrl}/auth/token`)
    const {data} = await response.json()
    
    console.log("Simple Viewer URN:", urn)
    console.log ("token viewer:", data.access_token)

  const options = {
    env: "AutodeskProduction",
    api: "modelDerivativeV2",
    accessToken: data.access_token
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