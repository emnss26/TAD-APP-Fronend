import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ACCPlatformLayout from "../../components/platform_page_components/acc.platform.layout";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import VRViewer from "../../components/aec_model_components/vr.viewer";

import { fetchACCFederatedModel } from "../../pages/services/acc.services";

const ACCVRPage = () => {
  const { projectId, accountId } = useParams();
  const [federatedModel, setFederatedModel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchACCFederatedModel(projectId, accountId)])
      .then(([federatedModelResp]) => {
        setFederatedModel(federatedModelResp);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  return (
    <ACCPlatformLayout projectId={projectId} accountId={accountId}>
      {loading && <LoadingOverlay />}
      <div className="flex flex-col w-full h-full">
        <h1 className="text-right text-xl text-black mt-2">VR VIEWER</h1>
        <hr className="my-4 border-t border-gray-300" />
        {error && (
          <p className="text-red-500">Error loading model: {error.message}</p>
        )}
        <div className="flex-1 h-[600px]">
          <VRViewer model={federatedModel} />
        </div>
      </div>
    </ACCPlatformLayout>
  );
};

export default ACCVRPage;
