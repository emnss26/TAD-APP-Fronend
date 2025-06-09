/* global Autodesk */

class VisibleSelectionExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() {
    //console.log("VisibleSelectionExtension loaded.");
    return true;
  }

  unload() {
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    //console.log("VisibleSelectionExtension unloaded.");
    return true;
  }

  // Recursively get all leaf node dbIds
  getAllLeafNodes(instanceTree, parentId, leafDbIds) {
    instanceTree.enumNodeChildren(parentId, (childId) => {
      const childCount = instanceTree.getChildCount(childId);
      if (childCount === 0) {
        leafDbIds.push(childId);
      } else {
        this.getAllLeafNodes(instanceTree, childId, leafDbIds);
      }
    });
  }

  onToolbarCreated() {
    // Create or get a toolbar group
    this._group =
      this.viewer.toolbar.getControl("TADCustomControls") ||
      new Autodesk.Viewing.UI.ControlGroup("TADCustomControls");
    this.viewer.toolbar.addControl(this._group);

    // Create the button
    this._button = new Autodesk.Viewing.UI.Button("selectVisibleButton");
    this._button.setToolTip("Select all visible geometry");
    this._button.addClass("selectVisibleIcon");
    this._group.addControl(this._button);

    // Button click logic
    this._button.onClick = () => {
      const instanceTree = this.viewer.model.getData().instanceTree;
      if (!instanceTree) {
        console.error("No instanceTree found.");
        return;
      }

      const rootId = instanceTree.getRootId();
      let allLeafDbIds = [];
      this.getAllLeafNodes(instanceTree, rootId, allLeafDbIds);

      const implVisibilityMgr =
        (this.viewer.impl && this.viewer.impl.visibilityManager) ||
        (this.viewer.model &&
          this.viewer.model.getVisibilityManager &&
          this.viewer.model.getVisibilityManager());

      let visibleLeafDbIds = [];

      allLeafDbIds.forEach((dbId) => {
        // Log properties to debug
        this.viewer.model.getProperties(dbId, (props) => {
          //console.log( `DBID: ${dbId} - Name: ${props.name} - ExternalId: ${props.externalId}`, props );
        });

        // Determine if visible
        let isVisible = true; // default
        if (implVisibilityMgr) {
          // If isNodeOff exists, use that
          if (typeof implVisibilityMgr.isNodeOff === "function") {
            let isOff = implVisibilityMgr.isNodeOff(dbId, this.viewer.model);
            isVisible = !isOff;
          }
          // Otherwise, try viewer.isNodeVisible
          else if (typeof this.viewer.isNodeVisible === "function") {
            isVisible = this.viewer.isNodeVisible(dbId, this.viewer.model);
          }
        }

        console.debug(`dbId ${dbId} -> isVisible? ${isVisible}`);
        if (isVisible) {
          visibleLeafDbIds.push(dbId);
        }
      });

      console.debug(`Visible leaf nodes found: ${visibleLeafDbIds.length}`);
      this.viewer.select(visibleLeafDbIds);
    };
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "VisibleSelectionExtension",
  VisibleSelectionExtension
);
