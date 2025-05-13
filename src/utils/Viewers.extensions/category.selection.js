/* global Autodesk */

class CategorySelectionExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    //console.log("Category Selection Extension has been loaded.");
    return true;
  }

  unload() {
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    //console.log("Category Selection Extension has been downloaded.");
    return true;
  }

  onToolbarCreated() {
    this._group =
      this.viewer.toolbar.getControl("TADCustomControls") ||
      new Autodesk.Viewing.UI.ControlGroup("TADCustomControls");
    this.viewer.toolbar.addControl(this._group);

    this._button = new Autodesk.Viewing.UI.Button("selectCategoryButton");
    this._button.onClick = () => {
      const selection = this.viewer.getSelection();
      if (!selection || selection.length === 0) {
        console.warn("No selected elements.");
        return;
      }

      const baseDbId = selection[0];

      this.viewer.getProperties(baseDbId, (result) => {
        let categoryValue = null;
        result.properties.forEach((prop) => {
          if (prop.displayName === "Category") {
            categoryValue = prop.displayValue;
          }
        });

        if (!categoryValue) {
          console.warn("The selected element not contain'Category' parameter.");
          return;
        }

        //console.log("Category reference: ", categoryValue);

        const instanceTree = this.viewer.model.getData().instanceTree;
        if (!instanceTree) {
          console.error("Not tree of instances loaded.");
          return;
        }

        let allDbIds = [];
        instanceTree.enumNodeChildren(instanceTree.getRootId(), (dbId) => {
          allDbIds.push(dbId);
        });

        const implVisibilityMgr =
          (this.viewer.impl && this.viewer.impl.visibilityManager) ||
          (this.viewer.model &&
            this.viewer.model.getVisibilityManager &&
            this.viewer.model.getVisibilityManager());

        let visibleDbIds = [];
        if (!implVisibilityMgr) {
          console.warn(
            "No se encontró un visibilityManager. Se considerarán todos los elementos como visibles."
          );
          visibleDbIds = allDbIds;
        } else {
          visibleDbIds = allDbIds.filter((dbId) => {
            try {
              return implVisibilityMgr.getNodeVisibility(dbId);
            } catch (error) {
              console.warn(
                "Error al obtener la visibilidad del nodo:",
                dbId,
                error
              );
              return false;
            }
          });
        }

        //console.log("Total de elementos visibles: ", visibleDbIds.length);

        this.viewer.model.getBulkProperties(
          visibleDbIds,
          ["Category"],
          (items) => {
            let similarCategoryIds = [];
            items.forEach((item) => {
              let catValue = null;
              item.properties.forEach((prop) => {
                if (prop.displayName === "Category") {
                  catValue = prop.displayValue;
                }
              });
              if (catValue === categoryValue) {
                similarCategoryIds.push(item.dbId);
              }
            });
            //console.log( "Se encontraron " + similarCategoryIds.length + " elementos de la misma categoría (visibles)." );

            this.viewer.isolate(similarCategoryIds);
          }
        );
      });
    };

    this._button.setToolTip("Aislar elementos por categoría (solo visibles)");
    this._button.addClass("selectCategoryIcon");
    this._group.addControl(this._button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "CategorySelectionExtension",
  CategorySelectionExtension
);
