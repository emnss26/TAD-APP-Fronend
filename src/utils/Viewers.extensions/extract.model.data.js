/* global Autodesk */

class ModeDataExtractionExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    //console.log("ModeDataExtractionExtension has been loaded");
    return true;
  }

  unload() {
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    //console.log("ModeDataExtractionExtension has been unloaded");
    return true;
  }

  onToolbarCreated() {
    this._group =
      this.viewer.toolbar.getControl("allDataExtractionControls") ||
      new Autodesk.Viewing.UI.ControlGroup("allDataExtractionControls");
    this.viewer.toolbar.addControl(this._group);

    this._button = new Autodesk.Viewing.UI.Button("extractDataButton");

    this._button.onClick = () => {
      const selection = this.viewer.getSelection();

      if (selection.length > 0) {
        selection.forEach((dbId) => {
          this.viewer.getProperties(dbId, (data) => {
            // Emitir un evento personalizado con los datos extraídos
            const event = new CustomEvent("dbIdDataExtracted", {
              detail: {
                dbId,
                properties: data.properties.reduce((acc, prop) => {
                  acc[prop.displayName] =
                    prop.displayValue || "no especificado";
                  return acc;
                }, {}),
              },
            });
            //console.log("Data extracted :", event.detail);
            window.dispatchEvent(event);
          });
        });
      } else {
        //console.log("No hay selección.");
      }
    };

    this._button.setToolTip("Extraer Datos");
    this._button.addClass("extractDataIcon");
    this._group.addControl(this._button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "ModeDataExtractionExtension",
  ModeDataExtractionExtension
);
