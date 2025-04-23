export const isolateObjectsInViewer = (viewer, dbIds) => {
    if (viewer && dbIds.length > 0) {
      viewer.isolate(dbIds);
      viewer.fitToView(dbIds);
    } else {
      console.error("Viewer no inicializado o no se encontraron elementos a aislar.");
    }
  };

  export const showAllObjects = (viewer) => {
    if (viewer) {
      viewer.isolate(); // Al no pasar dbIds, se muestra todo
    } else {
      console.error("Viewer no inicializado.");
    }
  };

  export const hideObjectsInViewer = (viewer, dbIds) => {
    if (viewer && dbIds.length > 0) {
      viewer.hide(dbIds);
    } else {
      console.error("Viewer no inicializado o no hay elementos para ocultar.");
    }
  };

  export const highlightObjectsInViewer = (viewer, dbIds) => {
    if (viewer && dbIds.length > 0) {
      viewer.clearSelection();
      viewer.select(dbIds);
    } else {
      console.error("Viewer no inicializado o no hay elementos para resaltar.");
    }
  };

  export const applyFilterToViewer = async (filterType, filterValue, viewer, backendUrl, projectId) => {
    try {
      const response = await fetch(`${backendUrl}/filter-elements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filterType, filterValue, projectId }),
      });
  
      const data = await response.json();
      if (!data.dbIds || data.dbIds.length === 0) {
        console.warn(`No se encontraron elementos para el filtro: ${filterValue}`);
        return;
      }
  
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