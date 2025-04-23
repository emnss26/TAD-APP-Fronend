/* global Autodesk */

class TypeNameSelectionExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    console.log("TypeNameSelectionExtension loaded.");
    return true;
  }

  unload() {
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    console.log("TypeNameSelectionExtension unloaded.");
    return true;
  }

  /**
   * (Helper) Recursively collect ALL child dbIds (leaf or not) under a given parent dbId.
   * If you only want "leaf nodes," modify the logic to check for `childCount === 0`.
   */
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

      // Take the first selected dbId as reference
      const baseDbId = selection[0];

      // Get properties of the selected element to find "Type Name"
      this.viewer.getProperties(baseDbId, (result) => {
        let typeNameValue = null;
        // We look for displayName === "Type Name". Adjust as needed:
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
        console.log("Reference Type Name: ", typeNameValue);

        // Get the instance tree
        const instanceTree = this.viewer.model.getData().instanceTree;
        if (!instanceTree) {
          console.error("No instance tree found.");
          return;
        }

        // ---------------------------------------------------------------------
        // APPROACH A: Check ALL dbIds in the model.
        // ---------------------------------------------------------------------
        // This enumerates *all* children under root. If you have a huge model,
        // consider using "leaf nodes only" or getBulkProperties with a narrower set.

        let allDbIds = [];
        // If you only want LEAF NODES, you can do a separate helper function.
        // For now, let's do "all descendants" from root:
        const rootId = instanceTree.getRootId();
        this.getAllDescendants(instanceTree, rootId, allDbIds);

        // Optionally, if you want to filter out the top rootId itself:
        // allDbIds = allDbIds.filter(dbId => dbId !== rootId);

        // Once we have all dbIds, we get their "Type Name" property in bulk
        this.viewer.model.getBulkProperties(
          allDbIds,
          ["Type Name"],
          (items) => {
            // Filter to those that share the same typeNameValue
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

            console.log(
              `Found ${matchingDbIds.length} elements with Type Name = ${typeNameValue}`
            );
            // Isolate them
            this.viewer.isolate(matchingDbIds);
          }
        );

        // ---------------------------------------------------------------------
        // APPROACH B: Check ONLY the "parent" node's descendants, if that is your goal.
        // ---------------------------------------------------------------------
        // (Commented out by default. If you want *only* siblings/descendants, uncomment.)
        /*
          const parentId = instanceTree.getNodeParentId(baseDbId);
          if (!parentId) {
            console.warn("No parent node found for this dbId. Using root instead.");
            return;
          }
  
          // Gather all descendants of that parent
          let siblingDbIds = [];
          this.getAllDescendants(instanceTree, parentId, siblingDbIds);
  
          // Get bulk properties on these siblings
          this.viewer.model.getBulkProperties(siblingDbIds, ["Type Name"], (items) => {
            let matchingDbIds = items
              .filter((item) => {
                let match = false;
                item.properties.forEach((prop) => {
                  if (prop.displayName === "Type Name" && prop.displayValue === typeNameValue) {
                    match = true;
                  }
                });
                return match;
              })
              .map(item => item.dbId);
  
            console.log(`Found ${matchingDbIds.length} siblings/descendants with Type Name = ${typeNameValue}`);
            this.viewer.isolate(matchingDbIds);
          });
          */
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
