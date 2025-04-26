
export const isolateObjectsInViewer = (viewer, dbIds) => {
  const ids = dbIds.map(id => Number(id));
  console.log("viewer isoalte:", viewer);
  console.log("dbIds isolate :", ids);
  if (viewer && dbIds.length > 0) {
    viewer.isolate(ids );
    viewer.fitToView(ids );
  } else {
    console.error(
      "Viewer no inicializado o no se encontraron elementos a aislar."
    );
  }
};

export const showAllObjects = (viewer) => {
  console.log("viewer:", viewer);
  if (viewer) {
    viewer.isolate(); 
  } else {
    console.error("Viewer no inicializado.");
  }
};

export const hideObjectsInViewer = (viewer, dbIds) => {
  const ids = dbIds.map(id => Number(id));
  console.log("viewer:", viewer);
  console.log("dbIds:", ids);
  if (viewer && ids.length > 0) {
    viewer.hide(ids);
  } else {
    console.error("Viewer no inicializado o no hay elementos para ocultar.");
  }
};

export const highlightObjectsInViewer = (viewer, dbIds) => {
  const ids = dbIds.map(id => Number(id));
  if (viewer && ids.length > 0) {
    viewer.clearSelection();
    viewer.select(ids);
  } else {
    console.error("Viewer no inicializado o no hay elementos para resaltar.");
  }
};

export const applyFilterToViewer = async (
  filterType,
  filterValue,
  viewer,
  backendUrl,
  projectId
) => {
  try {
    const response = await fetch(`${backendUrl}/filter-elements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filterType, filterValue, projectId }),
    });

    const data = await response.json();
    if (!data.dbIds || data.dbIds.length === 0) {
      console.warn(
        `No se encontraron elementos para el filtro: ${filterValue}`
      );
      return;
    }

    console.log("Data de elementos filtrados:", data.dbIds);

    switch (filterType) {
      case "isolate":
        isolateObjectsInViewer(viewer, data.dbIds);
        break;
      case "hide":
        hideObjectsInViewer(viewer, data.dbIds);
        break;
      case "highlight":
        highlightObjectsInViewer(viewer, data.dbIds);
        break;
      default:
        console.error("Acción no reconocida:", filterType);
    }
  } catch (error) {
    console.error("Error al aplicar filtro en el visor:", error);
  }
};

export const resetViewerView = (viewer) => {
  if (viewer) {
    viewer.isolate();
    viewer.clearThemingColors();
    viewer.showAll();
  } else {
    console.error("Viewer no inicializado.");
  }
};
