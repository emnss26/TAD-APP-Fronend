/* global Autodesk */

class TypeNameSelectionExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    //console.log("TypeNameSelectionExtension loaded.");
    return true;
  }

  unload() {
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    //console.log("TypeNameSelectionExtension unloaded.");
    return true;
  }

  getAllDescendants(instanceTree, parentId, dbIdArray) {
    instanceTree.enumNodeChildren(parentId, (childId) => {
      dbIdArray.push(childId);
      // Recursively go deeper
      this.getAllDescendants(instanceTree, childId, dbIdArray);
    });
  }

  onToolbarCreated() {
    // Create or get an existing toolbar group
    this._group =
      this.viewer.toolbar.getControl("TADCustomControls") ||
      new Autodesk.Viewing.UI.ControlGroup("TADCustomControls");
    this.viewer.toolbar.addControl(this._group);

    // Create the button
    this._button = new Autodesk.Viewing.UI.Button("selectTypeNameButton");
    this._button.onClick = () => {
      const selection = this.viewer.getSelection();
      if (!selection || selection.length === 0) {
        console.warn("No elements selected.");
        return;
      }

      const baseDbId = selection[0];
      this.viewer.getProperties(baseDbId, (result) => {
        let typeNameValue = null;
      
        result.properties.forEach((prop) => {
          if (prop.displayName === "Type Name") {
            typeNameValue = prop.displayValue;
          }
        });

        if (!typeNameValue) {
          console.warn(
            "The selected element does NOT have the 'Type Name' property."
          );
          return;
        }
        //console.log("Reference Type Name: ", typeNameValue);

        // Get the instance tree
        const instanceTree = this.viewer.model.getData().instanceTree;
        if (!instanceTree) {
          console.error("No instance tree found.");
          return;
        }

        let allDbIds = [];
        const rootId = instanceTree.getRootId();
        this.getAllDescendants(instanceTree, rootId, allDbIds);

        this.viewer.model.getBulkProperties(
          allDbIds,
          ["Type Name"],
          (items) => {
         
            let matchingDbIds = items
              .filter((item) => {
                let match = false;
                item.properties.forEach((prop) => {
                  if (
                    prop.displayName === "Type Name" &&
                    prop.displayValue === typeNameValue
                  ) {
                    match = true;
                  }
                });
                return match;
              })
              .map((item) => item.dbId);

            //console.log( `Found ${matchingDbIds.length} elements with Type Name = ${typeNameValue}` );
       
            this.viewer.isolate(matchingDbIds);
          }
        );
      });
    };

    this._button.setToolTip('Isolate elements by "Type Name"');
    this._button.addClass("selectTypeCategoryIcon");
    this._group.addControl(this._button);
  }
}

// Register the extension
Autodesk.Viewing.theExtensionManager.registerExtension(
  "TypeNameSelectionExtension",
  TypeNameSelectionExtension
);
