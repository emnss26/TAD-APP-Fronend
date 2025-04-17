/*global Autodesk*/

export const simpleViewer = async (urn, access_token) => {

    //console.log ('urn:', urn);
    //console.log ('access_token viewer:', access_token);

    const options ={
        env: 'AutodeskProduction',
        api: 'derivativeV2',
        getAccessToken: (onGetAccessToken) => {
            onGetAccessToken(access_token, 3600);
          }
    };

    const viewerContainer = document.getElementById('TADSimpleViwer');
        if (!viewerContainer) {
            console.error ('Viewer container not found!');
            return;
        }
    
    let viewer = new Autodesk.Viewing.GuiViewer3D(viewerContainer);

    Autodesk.Viewing.Initializer(options, () => {
        const  startCode = viewer.start();

        window.privateViewer = viewer

        if (startCode !== 0) {
            console.error('Failed to create a viewer:', startCode);
            return;
        }

        const documentId = "urn:" + urn;

        Autodesk.Viewing.Document.load(documentId, (viewerDoc) => {
            let defaultModel = viewerDoc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(viewerDoc, defaultModel);
            
        
        })

        })

    }
