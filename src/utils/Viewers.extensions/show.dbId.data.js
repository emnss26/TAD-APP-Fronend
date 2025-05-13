/* global Autodesk */

class ShowDbIdExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
    this._panel = null;
  }

  load() {
    //console.log("TAD => Extension ShowDbIdExtension cargada correctamente");
    return true;
  }

  unload() {
    if (this._panel) {
      this._panel.setVisible(false);
      this._panel = null;
    }
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    return true;
  }

  onToolbarCreated() {
    // Nombre del grupo donde se ubica el botón
    const groupName = "Cuantificacion";
    this._group = this.viewer.toolbar.getControl(groupName);

    // Si no existe el grupo, lo creamos
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup(groupName);
      this.viewer.toolbar.addControl(this._group);
    }

    // Creamos el botón
    const buttonName = "ShowDbIdExtensionButton";
    this._button = new Autodesk.Viewing.UI.Button(buttonName);

    this._button.setToolTip("Mostrar dbId del elemento + su padre");
    this._button.addClass("showDbIdExtensionIcon");

    // Acción al dar clic en el botón
    this._button.onClick = (ev) => {
      const selection = this.viewer.getSelection();
      if (selection.length === 0) {
        alert("No hay ningún elemento seleccionado.");
        return;
      }
      const selectedDbId = selection[0];

      // Obtenemos el árbol de instancias
      const instanceTree = this.viewer.model.getInstanceTree();
      let parentDbId = null;
      if (instanceTree) {
        parentDbId = instanceTree.getNodeParentId(selectedDbId);
      }

      // Disparamos un evento personalizado (si lo necesitas)
      window.dispatchEvent(
        new CustomEvent("showDbIdExtensionClicked", {
          detail: { dbId: selectedDbId, parentDbId },
        })
      );

      if (!this._panel) {
        this._panel = new ShowDbIdPanel(
          this.viewer.container,
          "showDbIdExtensionPanel",
          "DB ID Panel",
          { selectedDbId, parentDbId }
        );
      } else {
        this._panel.updateDbIds({ selectedDbId, parentDbId });
      }
      this._panel.setVisible(true);
    };

    // Agregamos el botón al grupo
    this._group.addControl(this._button);
  }
}

// Clase para el Panel
class ShowDbIdPanel extends Autodesk.Viewing.UI.DockingPanel {
  constructor(parentContainer, id, title, ids) {
    super(parentContainer, id, title);

    this.container.style.top = "10px";
    this.container.style.left = "10px";
    this.container.style.width = "300px";
    this.container.style.height = "180px";
    this.container.style.backgroundColor = "black";

    // Clase CSS opcional para estilizar
    this.container.classList.add("showDbIdExtensionPanel");

    // Contenido inicial del panel
    this._contentDiv = document.createElement("div");
    this._contentDiv.style.margin = "10px";
    this._contentDiv.style.color = "white";
    this.container.appendChild(this._contentDiv);

    // Mostramos inicialmente
    this.updateDbIds(ids);
  }

  /**
   * Actualiza el texto en el panel con los dbIds recibidos
   */
  updateDbIds({ selectedDbId, parentDbId }) {
    // Si parentDbId es -1, usualmente indica el root node (sin padre real).
    const parentText = parentDbId === -1 ? "Sin padre (root)" : parentDbId;

    this._contentDiv.innerHTML = `
        <h3>dbId seleccionado:</h3>
        <p style="font-size:18px;">${selectedDbId}</p>
        <h3>dbId del padre:</h3>
        <p style="font-size:18px;">${parentText}</p>
      `;
  }
}

// Registro de la extensión
Autodesk.Viewing.theExtensionManager.registerExtension(
  "ShowDbIdExtension",
  ShowDbIdExtension
);
