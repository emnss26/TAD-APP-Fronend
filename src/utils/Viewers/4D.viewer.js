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

function parseData(dataString) {
  if (!dataString) {
    return null;
  }
  const [yearString, monthString, dayString] = dataString.split("-");
  const year = parseInt(yearString, 10);
  const month = parseInt(monthString, 10) - 1;
  const day = parseInt(dayString, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }
  return new Date(year, month, day);
}

function resetAllTheming(viewer) {
  data4Dglobal.forEach((elem) => {
    viewer.setThemingColor(elem.dbId, null, viewer);
  });
}

function updateViewerVisibility(viewer, currentDate) {
  const idsToShow = [];
  const idsToColor = [];

  data4Dglobal.forEach(({ dbId, startDate, endDate }) => {
    const start = parseData(startDate);
    const end = parseData(endDate);

    if (!start || !end) return;

    if (currentDate >= start) {
      idsToShow.push(dbId);
      if (currentDate <= end) {
        idsToColor.push(dbId);
      }
    }
  });

  viewer.hideAll();
  viewer.show(idsToShow);
  resetAllTheming(viewer);

  idsToColor.forEach((dbId) => {
    viewer.setThemingColor(dbId, new THREE.Vector4(0, 0, 1, 0.5), viewer);
  });

  lastSliderDate = currentDate;
}

function handleSliderChange(event, viewer) {
  const sliderValue = parseFloat(event.target.value);
  if (!data4Dglobal.length) {
    console.error("No data available for 4D visualization.");
    return;
  }

  let earliestDate = null;
  let lastestEnd = null;

  data4Dglobal.forEach((item) => {
    const startDate = parseData(item.startDate);
    const endDate = parseData(item.endDate);

    if (startDate && (!earliestDate || startDate < earliestDate)) {
      earliestDate = startDate;
    }
    if (endDate && (!lastestEnd || endDate > lastestEnd)) {
      lastestEnd = endDate;
    }
  });

  if (!earliestDate || !lastestEnd) {
    console.error("Invalid date range in data4Dglobal.");
    return;
  }

  lastestEnd = new Date(lastestEnd.getTime() + 1000 * 60 * 60 * 24);

  const totalDuration = lastestEnd - earliestDate;
  const currentDate = new Date(
    earliestDate.getTime() + (sliderValue / 100) * totalDuration
  );

  updateViewerVisibility(viewer, currentDate);

  const dateDisplay = document.getElementById("currentDate-display");
  if (dateDisplay) {
    dateDisplay.textContent = `Current date: ${currentDate.toLocaleDateString(
      "en-US"
    )}`;
  }
}

function set4DData(newData) {
  data4Dglobal = newData;
  //console.log("Updated 4D data:", data4Dglobal);
}

function resetViewerState(viewer) {
  viewer.showAll();
  viewer.clearThemingColors();
  const slider = document.getElementById("4D-slider");
  if (slider) {
    slider.value = 0;
  }
  const dateDisplay = document.getElementById("currentDate-display");
  if (dateDisplay) {
    dateDisplay.textContent = "Current date: N/A";
  }
  lastSliderDate = null;
  data4Dglobal = [];
  //console.log("Reset 4D data:", data4Dglobal);
  if (viewer) {
    viewer.setThemingColor(null, null, viewer);
    viewer.hideAll();
  }
  //console.log("Viewer reset complete.");
}

function countDbIdsInNode(nodeId) {
  let count = 0;
  instanceTree.enumNodeChildren(nodeId, (childNodeId) => {
    count += countDbIdsInNode(childNodeId);
  });
  // Check if leaf
  const isLeafNode = instanceTree.getChildCount(nodeId) === 0;
  if (isLeafNode) {
    count++;
  }
  return count;
}

export async function data4Dviewer({
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
      handler: () => {
        if (setIsLoadingTree) setIsLoadingTree(false);

        if (setCategoryData) {
          const instanceTree = window.data4Dviewer.model.getData().instanceTree;
          const rootNodeId = instanceTree.getRootId();
          const categoryCount = {};

          instanceTree.enumNodeChildren(rootNodeId, (nodeId) => {
            const nodeName = instanceTree.getNodeName(nodeId);
            const categoryName = nodeName.replace(/\s*\[.*?\]\s*/g, "");
            if (!categoryCount[categoryName]) {
              categoryCount[categoryName] = 0;
            }
            const c = countDbIdsInNode(nodeId);
            categoryCount[categoryName] += c;
          });

          setCategoryData(categoryCount);
        }
      },
    },
    {
      name: Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      handler: (event) => {
        if (setSelectionCount) {
          setSelectionCount(event.dbIdArray.length);
        }
        if (setSelection) {
          setSelection(event.dbIdArray);
        }
      },
    },
  ];

  const onViewerReady = (viewer) => {
    window.data4Dviewer = viewer;
    window.data4Dviewer.set4DData = set4DData;
    window.data4Dviewer.resetViewerState = () => resetViewerState(viewer);
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

    const slider = document.getElementById("dateSlider");
    if (slider) {
      slider.addEventListener("input", (evt) => handleSliderChange(evt, viewer));
    }
  };

  await initViewer({
    containerId: "TAD4DViwer",
    urn: federatedModel,
    extensions,
    events,
    onViewerReady,
  });
}
