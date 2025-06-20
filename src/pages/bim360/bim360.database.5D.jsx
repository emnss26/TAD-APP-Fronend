import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import BIM360PlatformLayout from "../../components/platform_page_components/bim360.platform.layout";

import { data5Dviewer } from "../../utils/Viewers/5D.viewer";

import {
  disciplineOptions,
  elementtype,
  propertyMappings,
  numericFields,
} from "../../lib/data.bases.constants";

import { defaultRow as defaultRow5D } from "../../lib/default.row.5D";

import {
  isolateObjectsInViewer,
  showAllObjects,
  hideObjectsInViewer,
  highlightObjectsInViewer,
  resetViewerView,
} from "../../lib/viewer.actions";

import { fetchBIM360FederatedModel } from "../../pages/services/bim360.services";

import {
  mapCategoryToElementType,
  reorderRowsByDiscipline,
  reorderRowsByDisciplineAndGroup,
} from "../../lib/general.functions";

import { useTableControls } from "../services/database.table";

import Database5DTable from "../../components/database_components/database.5D.table";
import ControlPanel from "../../components/database_components/control.panel";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const sampleQuestions = [
  "Tell me the total volume of structural foundations discipline",
  "Tell me the total volume of concrete structure discipline walls elements",
  "Isolate concrete structure",
  "Hide aluminium works",
  "dbId 31796 the planed start construction date",
  "Change dbId 31796 planned start construction date to 03/10/2025",
  "Tell me the construction start and finish dates of elements in the discipline concrete structure",
];

const BIM3605DDatabase = () => {
  const defaultRow = useMemo(() => defaultRow5D, []);
  const propertyMapping = useMemo(() => propertyMappings["5D"], []);
  const [federatedModel, setFederatedModel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);

  const [data, setData] = useState([defaultRow]);
  const [collapsedDisciplines, setCollapsedDisciplines] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [lastClickedRowNumber, setLastClickedRowNumber] = useState(null);
  const [collapsedCodes, setCollapsedCodes] = useState({});
  const [groupExtraData, setGroupExtraData] = useState({});
  const [newCode, setNewCode] = useState("");

  const [showViewer, setShowViewer] = useState(true);
  const [showAIpanel, setAIpanel] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [syncViewerSelection, setSyncViewerSelection] = useState(false);
  const syncViewerSelectionRef = useRef(false);
  const [selectedDisciplineForColor, setSelectedDisciplineForColor] =
    useState("");
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [isPullMenuOpen, setIsPullMenuOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleToggleFullScreen = () => {
    if (window.data5Dviewer) {
      window.data5Dviewer.setFullScreen(!isFullScreen);
      setIsFullScreen(!isFullScreen);
    }
  };

  //AI Chatbot
  const [userMessage, setUserMessage] = useState("");
  const [chatbotResponse, setChatbotResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState(
    JSON.parse(localStorage.getItem("conversationHistory")) || []
  );

  const { handleAddRow, handleRemoveRow } = useTableControls(
    setData,
    defaultRow,
    reorderRowsByDiscipline
  );

  const tableContainerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchBIM360FederatedModel(projectId, accountId),
    ])
      .then(([federatedModelResp]) => {
        setFederatedModel(federatedModelResp);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching federated model:", error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId, accountId]);

   const fieldsToCheck = useMemo(
        () => [
          "Description",
          "Length",
          "Width",
          "Height",
          "Perimeter",
          "Area",
          "Thickness",
          "Volume",
          "Level",
          "Material",
        ],
        []
      );

  useEffect(() => {
      const handleDataExtracted = (event) => {
        const { dbId, properties } = event.detail;
        if (!properties || typeof properties !== "object") {
          console.error("Invalid properties data:", properties);
          return;
        }
        
        const propertiesArray = Object.entries(properties).map(([k, v]) => ({
          displayName: k,
          displayValue: v || "",
        }));
  
        const mappedProperties = propertiesArray.reduce((acc, prop) => {
          const mappedKey = propertyMapping[prop.displayName];
          let value = prop.displayValue;
  
          if (mappedKey && mappedKey.toLowerCase().includes("date")) {
            if (value.toLowerCase() === "no especificado") {
              value = "";
            } else {
              const parts = value.split("/");
              if (parts.length === 3) {
                const [day, month, year] = parts;
                value = `20${year}-${month.padStart(2, "0")}-${day.padStart(
                  2,
                  "0"
                )}`;
              }
            }
          }
          if (mappedKey) {
            acc[mappedKey] = value;
          }
          return acc;
        }, {});
        // Aseguramos que existan campos necesarios
        fieldsToCheck.forEach((field) => {
          if (!mappedProperties[field]) mappedProperties[field] = "";
        });
  
        const elementType = mapCategoryToElementType(properties.Category) || "";
        const newRow = {
          ...defaultRow,
          dbId,
          ElementType: elementType,
          ...mappedProperties,
        };
  
        setData((prevData) => {
          if (prevData.some((row) => row.dbId === dbId)) {
            alert("This element is already in the table");
            return prevData;
          }
          const updatedData = [...prevData, newRow];
          return reorderRowsByDisciplineAndGroup(updatedData);
        });
      };
  
      window.addEventListener("dbIdDataExtracted", handleDataExtracted);
      return () =>
        window.removeEventListener("dbIdDataExtracted", handleDataExtracted);
    }, [defaultRow, propertyMapping, mapCategoryToElementType, fieldsToCheck]);
  
  const calculateTotals = (rows) => {
    const totals = {
      Length: 0,
      Width: 0,
      Height: 0,
      Perimeter: 0,
      Area: 0,
      Volume: 0,
    };
    rows.forEach((row) => {
      Object.keys(totals).forEach((key) => {
        totals[key] += parseFloat(row[key]) || 0;
      });
    });
    return totals;
  };

   const groupedData = useMemo(() => {
      return data.reduce((acc, row) => {
        const discipline = row.Discipline || "No Discipline";
        if (!acc[discipline]) acc[discipline] = [];
        acc[discipline].push(row);
        return acc;
      }, {});
    }, [data]);
  
    const totalsByDiscipline = useMemo(() => {
      return Object.keys(groupedData).reduce((acc, disc) => {
        acc[disc] = calculateTotals(groupedData[disc]);
        return acc;
      }, {});
    }, [groupedData]);

  const grandTotals = useMemo(() => calculateTotals(data), [data]);

  const handleDisciplineChange = (row, newValue) => {
    const index = data.findIndex((r) => r === row);
    if (index === -1) return;
    if (selectedRows.includes(row.dbId)) {
      setData((prev) => {
        const updatedData = prev.map((item) =>
          selectedRows.includes(item.dbId)
            ? { ...item, Discipline: newValue }
            : item
        );
        return reorderRowsByDisciplineAndGroup(updatedData);
      });
    } else {
      const clone = [...data];
      clone[index] = { ...clone[index], Discipline: newValue };
      setData(reorderRowsByDisciplineAndGroup(clone));
    }
  };

  const handleElementTypeChange = (row, newValue) => {
    const index = data.findIndex((r) => r === row);
    if (index === -1) return;
    if (selectedRows.includes(row.dbId)) {
      setData((prev) => {
        const updatedData = prev.map((item) =>
          selectedRows.includes(item.dbId)
            ? { ...item, ElementType: newValue }
            : item
        );
        return reorderRowsByDisciplineAndGroup(updatedData);
      });
    } else {
      const clone = [...data];
      clone[index] = { ...clone[index], ElementType: newValue };
      setData(reorderRowsByDisciplineAndGroup(clone));
    }
  };

  const handleInputChange = (row, event) => {
    const { name, value } = event.target;
    const index = data.findIndex((r) => r === row);

    if (index === -1) {
      console.error("Row not found in data.");
      return;
    }

    const currentRow = data[index];
    if (selectedRows.includes(currentRow.dbId)) {
      setData((prev) => {
        const updatedData = prev.map((item) =>
          selectedRows.includes(item.dbId) ? { ...item, [name]: value } : item
        );
        return reorderRowsByDisciplineAndGroup(updatedData);
      });
    } else {
      const newArr = [...data];
      newArr[index] = { ...currentRow, [name]: value };
      setData(newArr);
    }
  };

  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const handleViewerSelectionChanged = useCallback((dbIdArray) => {
        const currentDbIdsInTable = dataRef.current.map((row) => Number(row.dbId));
      
      const foundDbIds = dataRef.current
        .filter((row) => {
          const rowDbIdNum = Number(row.dbId);
          const matched = dbIdArray.includes(rowDbIdNum);
  
          return matched;
        })
        .map((row) => row.dbId);
  
      setSelectedRows(foundDbIds.length ? foundDbIds : []);
      setSelectionCount(dbIdArray.length);
    }, []);

  useEffect(() => {
    if (!federatedModel || window.viewerInitialized || !showViewer) return;

    const conditionalSelectionHandler = (dbIdArray) => {
      if (!syncViewerSelectionRef.current) {
        return;
      }
      handleViewerSelectionChanged(dbIdArray);
    };

    data5Dviewer({
      federatedModel,
      setSelectionCount,
      setSelection: conditionalSelectionHandler,
      setIsLoadingTree,
      setCategoryData,
    });

    window.viewerInitialized = true;
  }, [federatedModel, showViewer, handleViewerSelectionChanged]);

  const handleToggleViewer = () => {
    if (showViewer && window.data5Dviewer) {
      window.data5Dviewer.impl.unload();
      window.data5Dviewer = null;
      window.viewerInitialized = false;
    }

    setShowViewer((prev) => !prev);
  };

  useEffect(() => {
    syncViewerSelectionRef.current = syncViewerSelection;

    if (syncViewerSelection && window.data5Dviewer) {
      const currentDbIds = window.data5Dviewer.getSelection() || [];
      handleViewerSelectionChanged(currentDbIds);
    }
  }, [syncViewerSelection, handleViewerSelectionChanged]);

  const handleSubmit = async () => {
      try {
        const cleanedData = data.map((row) => {
          const cleanedRow = { ...row };
          numericFields.forEach((field) => {
            const value = cleanedRow[field];
            if (typeof value === "string") {
              if (
                value.toLowerCase() === "no especificado" ||
                value.trim() === ""
              ) {
                cleanedRow[field] = null;
              } else {
                const parsedValue = parseFloat(value);
                cleanedRow[field] = isNaN(parsedValue) ? null : parsedValue;
              }
            }
          });
          return cleanedRow;
        });
  
        const response = await fetch(
          `${backendUrl}/modeldata/${accountId}/${projectId}/data`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanedData),
          }
        );
  
        if (response.ok) {
          alert("Data sent successfully");
          //await handlePullData();
        } else {
          const errorData = await response.json();
          console.error("Error sending data:", errorData.message);
          alert(`Error sending data: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Request error:", error);
        alert(`Request error: ${error.message}`);
      }
    };
  
    const handlePullData = async (discipline = null) => {
      try {
        let url = `${backendUrl}/modeldata/${accountId}/${projectId}/data`;
        if (discipline && discipline.toLowerCase() !== "all disciplines") {
          url += `?discipline=${encodeURIComponent(discipline)}`;
        }
  
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
  
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            let tempRows = result.data.map((item) => {
              const value = item || {};
              return {
              dbId: value.dbId || "",
              Code: value.Code || "",
              Discipline: value.Discipline || "",
              ElementType: value.ElementType || "",
              TypeName: value.TypeName || "",
              Description: value.Description || "",
              TypeMark: value.TypeMark || "",
              Length: value.Length || "",
              Width: value.Width || "",
              Height: value.Height || "",
              Perimeter: value.Perimeter || "",
              Area: value.Area || "",
              Thickness: value.Thickness || "",
              Volume: value.Volume || "",
              Level: value.Level || "",
              Material: value.Material || "",
              Unit: value.Unit || "",
              Quantity: value.Quantity || "",
              UnitPrice: value.UnitPrice || "",
              TotalCost: value.TotalCost || "",
            };
          });
  
            tempRows = reorderRowsByDisciplineAndGroup(tempRows);
            setData(tempRows);
            alert("Datos cargados exitosamente");
  
          } else {
            alert("No se encontraron datos para este proyecto.");
          }
        } else {
          const errorData = await response.json();
          console.error("Error al obtener datos:", errorData.message);
          alert(`Error al obtener datos: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert(`Error en la solicitud: ${error.message}`);
      }
    };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setIsPullMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleApplyColorToDiscipline = async () => {
    if (!selectedDisciplineForColor || !selectedColor) return;

    try {
      const url = `${backendUrl}/modeldata/${accountId}/${projectId}/data?discipline=${encodeURIComponent(
        selectedDisciplineForColor
      )}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error fetching discipline data.");

      const result = await response.json();
      if (!result.data) return;
      const dbIds = result.data.map((item) => parseInt(item.dbId, 10));

      // Solo enviamos dbIds y color al visor:
      if (
        window.data5Dviewer &&
        typeof window.data5Dviewer.applyColorByDiscipline === "function"
      ) {
        window.data5Dviewer.applyColorByDiscipline(dbIds, selectedColor);
      } else {
        console.warn("applyColorByDiscipline no disponible en el viewer.");
      }
    } catch (error) {
      console.error("Error applying color:", error);
    }
  };

  const cleanprojectId = projectId.substring(2);

  useEffect(() => {
    localStorage.setItem(
      "conversationHistory",
      JSON.stringify(conversationHistory)
    );
  }, [conversationHistory]);

  const fetchAllData = async (projectId) => {
    let allData = [];
    let page = 1;
    let limit = 50;
    let hasMoreData = true;

    try {
      while (hasMoreData) {
        const response = await fetch(
          `${backendUrl}/modeldata/${accountId}/${projectId}/data?page=${page}&limit=${limit}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          console.error(
            `Error GET: ${response.status} ${response.statusText}`
          );
          throw new Error("Error fetching data");
        }

        const result = await response.json();
        const { data } = result;

        if (!Array.isArray(data)) {
          console.error("Unexpected data format:", result);
          throw new Error("Wrong data format");
        }

        allData = [...allData, ...data];
        if (data.length < limit) {
          hasMoreData = false;
        } else {
          page++;
        }
      }

      return allData;
    } catch (error) {
      console.error("Error fetching all data:", error);
      return [];
    }
  };

  const updateKeywords = [
  "change", "update", "modify", "transform", "upgrade", "adjust", // English
  "cambia", "modifica", "modificar", "sustituye", "sustituir", "adapta", "adaptar" // Español
];

  async function handleSendMessage() {
  setIsLoading(true);
  const msg = userMessage;
  const lower = msg.toLowerCase();
  let route = "/ai-modeldata";
  let mode = 'general';

  if (lower.includes('dbid') && updateKeywords.some(k=>lower.includes(k))) {
    route = '/ai-modeldata/update-field'; mode = 'update';
  } else if (lower.includes('dbid')) {
    route = '/ai-modeldata/dbid-question'; mode = 'dbid';
  } else if (/^(hide|isolate|highlight|aisla|oculta|resalta)/.test(lower)) {
    route = '/ai-modeldata/autodesk-command'; mode = 'viewer';
  } else if (lower.startsWith('date range:') || (lower.includes('construction') && lower.includes('dates'))) {
    route = '/ai-modeldata/date-range'; mode = 'daterange';
  }

  try {
    const body = { message: msg, accountId: accountId, projectId: projectId, contextData: mode==='general'? null : null };
    const res = await fetch(`${backendUrl}${route}`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
    const data = await res.json();
    setChatbotResponse(data.reply);

    if (mode==='viewer' && data.dbIds && data.action) {
      const fnMap = { isolate: isolateObjectsInViewer, hide: hideObjectsInViewer, highlight: highlightObjectsInViewer };
      fnMap[data.action]?.(window.data4Dviewer, data.dbIds);
    }

    if (mode==='update' && data.field && data.value) {
      // call backend update endpoint directly
      await fetch(`${backendUrl}/model/${projectId}/${accountId}/${data.dbIds[0]}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ field:data.field, value:data.value })
      });
      // refresh table
      handlePullData(data.discipline);
    }

  } catch(err) {
    console.error(err);
    setChatbotResponse('Error processing your request.');
  } finally { setIsLoading(false); }
}

  const handleGroupExtraDataChange = (group, field, value) => {
    setGroupExtraData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value,
      },
    }));
    
  };

  const calculateGroupTotal = (group) => {
    const extra = groupExtraData[group] || {};
    const quantity = parseFloat(extra.Quantity) || 0;
    const price = parseFloat(extra.UnitPrice) || 0;
    const total = quantity * price;
    return total ? total.toFixed(2) : "";
  };

  const nestedGroupData = useMemo(() => {
    const grouped = {};
    data.forEach((row) => {
      const discipline = row.Discipline || "No Discipline";
      const code = row.Code || "No Code";
      if (!grouped[discipline]) grouped[discipline] = {};
      if (!grouped[discipline][code]) grouped[discipline][code] = [];
      grouped[discipline][code].push(row);
    });
    return grouped;
  }, [data]);

  useEffect(() => {
    Object.entries(groupExtraData).forEach(([groupKey, extra]) => {
      const unit = extra.Unit;
      if (unit) {
        const [discipline, code] = groupKey.split("||");
        const rows =
          (nestedGroupData[discipline] && nestedGroupData[discipline][code]) ||
          [];
        let total = 0;
        if (unit === "m" || unit === "kg/m") {
          total = rows.reduce((sum, r) => sum + (parseFloat(r.Length) || 0), 0);
        } else if (unit === "m2") {
          total = rows.reduce((sum, r) => sum + (parseFloat(r.Area) || 0), 0);
        } else if (unit === "m3") {
          total = rows.reduce((sum, r) => sum + (parseFloat(r.Volume) || 0), 0);
        }
        const newQuantity = total.toFixed(2);
        if (newQuantity !== extra.Quantity) {
          setGroupExtraData((prev) => ({
            ...prev,
            [groupKey]: {
              ...prev[groupKey],
              Quantity: newQuantity,
            },
          }));
        }
      }
    });
  }, [groupExtraData, nestedGroupData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setIsPullMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const viewerWidthClass = useMemo(() => {
    if (!showViewer) return "w-0";
    return "w-2/5";
  }, [showViewer, showAIpanel]);

  const tableWidthClass = useMemo(() => {
    // Caso 1: No viewer, no IA => tabla = w-full
    if (!showViewer && !showAIpanel) return "w-full";

    // Caso 2: Viewer activo, IA NO activo => tabla=3/5
    if (showViewer && !showAIpanel) return "w-3/5";

    // Caso 3: Viewer + IA => tabla=2/5
    if (showViewer && showAIpanel) return "w-2/5";

    // Caso 4: IA activo, viewer NO => tabla=4/5
    if (!showViewer && showAIpanel) return "w-4/5";

    return "w-full"; // fallback
  }, [showViewer, showAIpanel]);

  const aiWidthClass = useMemo(() => {
    return showAIpanel ? "w-1/5" : "w-0";
  }, [showAIpanel]);

  return (
    <BIM360PlatformLayout projectId={projectId} accountId={accountId}>
      {loading && <LoadingOverlay />}

      {/* Contenedor principal: ocupa todo el viewport menos el header */}
      <div
        className="flex flex-col"
        style={{
          minHeight:
            "calc(100vh - 3.5rem)" /* Ajusta si tu header no mide 56px */,
        }}
      >
        {/* Sidebar + contenido desplazable */}
        <div className="flex flex-1">

          <div className="flex-1 p-4 bg-white overflow-auto">
            {/* Título */}
            <div className="mb-4">
              <h1 className="text-right text-xl text-black">
                Model Database 5D
              </h1>
            </div>
            <hr className="my-4 border-t border-gray-300" />

            {/* Control Panel */}
            <ControlPanel
              viewer={window.data5Dviewer}
              showViewer={showViewer}
              toggleViewer={handleToggleViewer}
              showAIpanel={showAIpanel}
              setAIpanel={setAIpanel}
              syncViewerSelection={syncViewerSelection}
              setSyncViewerSelection={setSyncViewerSelection}
              handleAddRow={handleAddRow}
              handleRemoveRow={handleRemoveRow}
              handleSubmit={handleSubmit}
              handlePullData={handlePullData}
              resetViewerView={resetViewerView}
              showAllObjects={showAllObjects}
              disciplineOptions={disciplineOptions}
              selectedDisciplineForColor={selectedDisciplineForColor}
              setSelectedDisciplineForColor={setSelectedDisciplineForColor}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              handleApplyColorToDiscipline={handleApplyColorToDiscipline}
              handleAddCustomRow={() => {}}
              handleRemoveCustomRow={() => {}}
              handleSubmitCustomTable={() => {}}
              handlePullCustomTableData={() => {}}
            />

            <div className="h-12"></div>

            {/* Viewer + Tabla + AI Panel */}
            <div className="flex" style={{ height: "650px" }}>
              {/* Viewer */}
              <div
                className={`
                  transition-all duration-300 overflow-hidden bg-white shadow-lg rounded-lg p-4 mr-2
                  ${viewerWidthClass}
                `}
              >
                {showViewer && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-bold">Model Viewer</h2>
                      <button
                        onClick={handleToggleFullScreen}
                        className="ml-2 px-2 py-1 text-xs bg-gray-200 text-black rounded hover:bg-[#2ea3e3] hover:text-white"
                      >
                        Expand Viewer
                      </button>
                    </div>
                    <hr className="my-4 border-t border-gray-300" />
                    <div className="relative" style={{ height: "550px" }}>
                      <div
                        className="absolute top-0 left-0 right-0 bottom-0"
                        id="TAD5DViwer"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Tabla */}
              <div
                className={`
                  transition-all duration-300 bg-white shadow-lg rounded-lg p-4 mr-2
                  flex flex-col
                  ${tableWidthClass}
                `}
              >
                <Database5DTable
                  viewer={window.data5Dviewer}
                  data={data}
                  totalsByDiscipline={totalsByDiscipline}
                  grandTotals={grandTotals}
                  handleInputChange={handleInputChange}
                  handleDisciplineChange={handleDisciplineChange}
                  handleElementTypeChange={handleElementTypeChange}
                  disciplineOptions={disciplineOptions}
                  elementtype={elementtype}
                  isolateObjectsInViewer={isolateObjectsInViewer}
                  hideObjectsInViewer={hideObjectsInViewer}
                  collapsedDisciplines={collapsedDisciplines}
                  setCollapsedDisciplines={setCollapsedDisciplines}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  lastClickedRowNumber={lastClickedRowNumber}
                  setLastClickedRowNumber={setLastClickedRowNumber}
                  groupExtraData={groupExtraData}
                  handleGroupExtraDataChange={handleGroupExtraDataChange}
                  calculateGroupTotal={calculateGroupTotal}
                />
              </div>

              {/* AI Panel */}
              <div
                className={`
                  transition-all duration-300 overflow-hidden bg-white shadow-lg rounded-lg p-4 mr-2
                  ${aiWidthClass}
                `}
              >
                {showAIpanel && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-bold text-right w-full">
                        AI Panel
                      </h2>
                    </div>
                    <hr className="my-4 border-t border-gray-300" />
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <textarea
                        className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                        rows="3"
                        placeholder="Write your question..."
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={userMessage.trim() === ""}
                        className={`w-full py-2 px-4 rounded text-xs ${
                          userMessage.trim() === ""
                            ? "bg-[#2ea3e3] text-white cursor-not-allowed"
                            : "btn-secondary"
                        }`}
                      >
                        Send
                      </button>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-xs">
                        <p className="text-gray-700 font-medium text-xs">
                          Answer:
                        </p>
                        <p className="mt-2 text-gray-800 text-xs">
                          {chatbotResponse}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700 font-medium text-[0.7rem]">
                        Sample Questions:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {sampleQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => setUserMessage(q)}
                            className="bg-gray-200 hover:bg-gray-300 text-[0.7rem] py-1 px-2 rounded"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="h-12"></div>
          </div>
        </div>

      </div>
    </BIM360PlatformLayout>
  );
};

export default React.memo(BIM3605DDatabase);
