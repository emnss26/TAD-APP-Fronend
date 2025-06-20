import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import BIM360PlatformLayout from "../../components/platform_page_components/bim360.platform.layout";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import DisciplineSidebar from "../../components/model_LOD_checker_components/DisciplineSidebar"

import { LODTableArchitectureCompliance } from "../../components/model_LOD_checker_components/LODTableArchitecture";
import { LODTableExteriorArchitectureCompliance } from "../../components/model_LOD_checker_components/LODTableExteriorArchitecutre";
import { LODTableConcreteStructureCompliance } from "../../components/model_LOD_checker_components/LODTableConcreteStructure";
import { LODTableSteelStructureCompliance } from "../../components/model_LOD_checker_components/LODTableSteelStructure";
import { LODTablePlumbingCompliance } from "../../components/model_LOD_checker_components/LODTablePlumbingInstallation";
import { LODTableElectricalCompliance } from "../../components/model_LOD_checker_components/LODTableElectricalInstallation";
import { LODTableSpecialSystemsCompliance } from "../../components/model_LOD_checker_components/LODTableSpecialSystems";
import { LODTableMechanicalCompliance } from "../../components/model_LOD_checker_components/LODTableMechanical&HVAC";

import { modelcheckerviewer } from "@/utils/Viewers/model.checker.viewer";

import {
  fetchBIM360FederatedModel,
} from "../../pages/services/bim360.services";

export default function BIM360ModelLODCheckerPage() {
  const { projectId, accountId } = useParams();

  const disciplinas = [
    "Architecture",
    "Exteriors",
    "Concrete Structure",
    "Steel Structure",
    "Plumbing Installation",
    "Electrical Installation",
    "Special Systems",
    "Mechanical - HVAC",
  ];

  const [disciplina, setDisciplina] = useState(disciplinas[0]);
  const [collapsed, setCollapsed] = useState(true);
  const [urn, setUrn] = useState("");
  const [federatedModel, setFederatedModel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const renderTabla = () => {
    switch (disciplina) {
      case "Architecture":
        return <LODTableArchitectureCompliance />;
      case "Exteriors":
        return <LODTableExteriorArchitectureCompliance />;
      case "Concrete Structure":
        return <LODTableConcreteStructureCompliance />;
      case "Steel Structure":
        return <LODTableSteelStructureCompliance />;
      case "Plumbing Installation":
        return <LODTablePlumbingCompliance />;
      case "Electrical Installation":
        return <LODTableElectricalCompliance />;
      case "Special Systems":
        return <LODTableSpecialSystemsCompliance />;
      case "Mechanical - HVAC":
        return <LODTableMechanicalCompliance />;
      default:
        return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchBIM360FederatedModel(projectId, accountId)])
      .then(([federatedModelResp]) => {
        setFederatedModel(federatedModelResp);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  useEffect(() => {
    if (federatedModel) {
      modelcheckerviewer(federatedModel);
    }
  }, [federatedModel]);

  return (
    <BIM360PlatformLayout projectId={projectId} accountId={accountId}>
      {loading && <LoadingOverlay />}

      {/* Main Content header */}
      <main className="flex-1 min-w-0 p-2 px-4 bg-white">
        <h1 className="text-right text-xl text-black mt-2">
          PROJECT MODEL CHECKER
        </h1>
        <hr className="my-4 border-t border-gray-300" />
        <button
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => {/* TODO: send data to backend */}}
          >
            Send Data
          </button>
      </main>

      {/* Layout */}
      <div className="flex h-full">
        {/* Sidebar */}
        <DisciplineSidebar
          selected={disciplina}
          onSelect={setDisciplina}
        />

        {/* Table */}
        <section className="w-2/5 p-4 overflow-auto bg-white h-[650px]">
          <h2 className="text-2xl font-bold mb-4">
            LOD Checker – {disciplina}
          </h2>
          {renderTabla()}
        </section>

        {/* Viewer */}
        <div className="w-3/5 p-4 bg-gray-50 h-[650px]">
          <div id="TADModelCheckerViwer" className= "flex-1 w-full h-[600px] relative" />
        </div>
      </div>
    </BIM360PlatformLayout>
  );
}
