/* global Autodesk, THREE */

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

import "../Viewers.extensions/extract.model.data";
import "../Viewers.extensions/category.selection";
import "../Viewers.extensions/show.dbId.data";
import "../Viewers.extensions/visible.elements.selection";
import "../Viewers.extensions/type.name.filter.selection";

let data4Dglobal = [];
let lastSliderDate = null;
let instanceTree = null;

function resetViewerState(viewer) {
  viewer.showAll();
  viewer.clearThemingColors();

  if (viewer) {
    viewer.setThemingColor(null, null, viewer);
    viewer.hideAll();
  }
  console.log("Viewer reset complete.");
}

export async function data5Dviewer({
  federatedModel,

  setSelectionCount,
  setSelection,
  setIsLoadingTree,
  setCategoryData,
}) {
  console.log("token viewer 5D :", federatedModel);

  const response = await fetch(`${backendUrl}/auth/token`);
  const { data } = await response.json();

  console.log("5D Viewer URN:", federatedModel);
  console.log("token viewer:", data.access_token);

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

  const container = document.getElementById("TAD5DViwer");
  if (!container) {
    console.error("Viewer container not found!");
    return;
  }

  let viewer = new Autodesk.Viewing.GuiViewer3D(container, config);

  Autodesk.Viewing.Initializer(
    options,
    () => {
      const startCode = viewer.start();
      console.log("Viewer start code:", startCode);
      if (startCode !== 0) {
        console.error("Failed to start viewer");
        return;
      }

      window.data5Dviewer = viewer;
      window.data5Dviewer.resetViewerState = () => resetViewerState(viewer);

      viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MULTIPLE);

      const documentId = `urn:${federatedModel}`;

      Autodesk.Viewing.Document.load(documentId, (viewerDocument) => {
        const defaultModel = viewerDocument.getRoot().getDefaultGeometry();
        viewer.loadDocumentNode(viewerDocument, defaultModel);

        viewer.addEventListener(
          Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
          async (e) => {
            const instanceTree = e.model.getData().instanceTree;
            const rootNodeId = instanceTree.getRootId();
            const categoryCount = {};

            function countDbIdsInNode(nodeId) {
              let count = 0;

              instanceTree.enumNodeChildren(nodeId, (childNodeId) => {
                count += countDbIdsInNode(childNodeId);
              });

              const isLeafNode = instanceTree.getChildCount
                ? instanceTree.getChildCount(nodeId) === 0
                : true;

              if (isLeafNode) {
                count += 1;
              }

              return count;
            }

            instanceTree.enumNodeChildren(rootNodeId, (nodeId) => {
              const nodeName = instanceTree.getNodeName(nodeId);
              const categoryName = nodeName.replace(/\s*\[.*?\]\s*/g, "");

              if (!categoryCount[categoryName]) {
                categoryCount[categoryName] = 0;
              }

              const count = countDbIdsInNode(nodeId);
              categoryCount[categoryName] += count;
            });

            setCategoryData(categoryCount);
            setIsLoadingTree(false);
          }
        );
      });

      viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (e) => {
        setSelectionCount(e.dbIdArray.length);
        setSelection(e.dbIdArray);
      });

      viewer.applyColorByDiscipline = (dbIds, colorHex) => {
        if (!viewer.model) return;
        const color = new THREE.Color(colorHex);
        dbIds.forEach((id) => {
          viewer.setThemingColor(
            id,
            new THREE.Vector4(color.r, color.g, color.b, 1),
            viewer.model
          );
        });
      };
    },
    () => {
      console.error("Fail");
    }
  );
}
