import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ACCPlatformLayout from "../../components/platform_page_components/acc.platform.layout";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import VRViewer from "../../components/aec_model_components/vr.viewer";

import { fetchACCFederatedModel } from "../services/acc.services";

const ACCVRPage = () => {
  const { projectId, accountId } = useParams();
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchACCFederatedModel(projectId, accountId)
      .then((url) => setModelUrl(url))
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  return (
    <ACCPlatformLayout projectId={projectId} accountId={accountId}>
      {loading && <LoadingOverlay />}
      {error && (
        <p className="text-red-500 p-4">Failed to load federated model.</p>
      )}
      {modelUrl && <VRViewer modelUrl={modelUrl} />}
    </ACCPlatformLayout>
  );
};

export default ACCVRPage;
