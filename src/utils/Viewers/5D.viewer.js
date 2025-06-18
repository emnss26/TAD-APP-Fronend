/* global Autodesk, THREE */


import "../Viewers.extensions/extract.model.data";
import "../Viewers.extensions/category.selection";
import "../Viewers.extensions/show.dbId.data";
import "../Viewers.extensions/visible.elements.selection";
import "../Viewers.extensions/type.name.filter.selection";
import { initViewer } from "./init.viewer";

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
  //console.log("Viewer reset complete.");
}

export async function data5Dviewer({
  federatedModel,
  setSelectionCount,
  setSelection,
  setIsLoadingTree,
  setCategoryData,
}) {
  const extensions = [
    "ModeDataExtractionExtension",
    "CategorySelectionExtension",
    "VisibleSelectionExtension",
    "TypeNameSelectionExtension",
    "ShowDbIdExtension",
  ];

  const events = [
    {
      name: Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      handler: (e) => {
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
      },
    },
    {
      name: Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      handler: (e) => {
        setSelectionCount(e.dbIdArray.length);
        setSelection(e.dbIdArray);
      },
    },
  ];

  const onViewerReady = (viewer) => {
    window.data5Dviewer = viewer;
    window.data5Dviewer.resetViewerState = () => resetViewerState(viewer);
    viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.MULTIPLE);

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
  };

  await initViewer({
    containerId: "TAD5DViwer",
    urn: federatedModel,
    extensions,
    events,
    onViewerReady,
  });
}
