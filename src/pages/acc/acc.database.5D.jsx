import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import ACCPlatformprojectsHeader from "../../components/platform_page_components/acc.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import ACCSideBar from "../../components/platform_page_components/platform.acc.sidebar";

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

import { fetchACCFederatedModel } from "../../pages/services/acc.services";

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

const ACC5DDatabase = () => {
  const defaultRow = useMemo(() => defaultRow5D, []);
  const propertyMapping = useMemo(() => propertyMappings["4D"], []);
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
      fetchACCFederatedModel(projectId, cookies.access_token, accountId),
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
  }, [projectId, accountId, cookies.access_token]);

  useEffect(() => {
    const handleDataExtracted = (event) => {
      const { dbId, properties } = event.detail;
      if (typeof properties !== "object" || properties === null) return;
      const propertiesArray = Object.entries(properties).map(
        ([key, value]) => ({
          displayName: key,
          displayValue: value || "",
        })
      );
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
      [
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
      ].forEach((field) => {
        if (!mappedProperties[field]) {
          mappedProperties[field] = "";
        }
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
  }, [defaultRow, propertyMapping, mapCategoryToElementType]);

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
    //console.log("handleViewerSelectionChanged() → dbIdArray:", dbIdArray);
    //console.log("data (just length):", dataRef.current.length);

    // Imprimir los dbId actuales en la tabla
    const currentDbIdsInTable = dataRef.current.map((row) => Number(row.dbId));
    //console.log("Current dbIds in table:", currentDbIdsInTable);

    const foundDbIds = dataRef.current
      .filter((row) => {
        const rowDbIdNum = Number(row.dbId);
        const matched = dbIdArray.includes(rowDbIdNum);

        //console.log("Row dbId:", rowDbIdNum, "Matched:", matched);
        return matched;
      })
      .map((row) => row.dbId);

    //console.log("foundDbIds:", foundDbIds);

    setSelectedRows(foundDbIds.length ? foundDbIds : []);
    setSelectionCount(dbIdArray.length);
  }, []);

  useEffect(() => {
    if (!federatedModel || window.viewerInitialized) return;

    //console.log("viwer", federatedModel);

    const conditionalSelectionHandler = (dbIdArray) => {
      if (!syncViewerSelectionRef.current) {
        //console.log("Viewer selection changed pero sync está OFF → ignoramos");
        return;
      }
      //console.log( "Viewer selection changed → sync ON → handleViewerSelectionChanged" );
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
  }, [federatedModel, handleViewerSelectionChanged]);

  useEffect(() => {
    //console.log("syncViewerSelection cambió a →", syncViewerSelection);
    syncViewerSelectionRef.current = syncViewerSelection;

    if (syncViewerSelection && window.data5Dviewer) {
      //console.log( "Sincronización ACTIVADA: se llama getSelection() para forzar resaltado en tabla." );
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedData),
        }
      );

      if (response.ok) {
        alert("Data sent successfully");
        await handlePullData();
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
        if (result.data) {
          let tempRows = result.data.map((item) => ({
            dbId: item.dbId || "",
            Code: item.Code || "",
            Discipline: item.Discipline || "",
            ElementType: item.ElementType || "",
            TypeName: item.TypeName || "",
            Description: item.Description || "",
            TypeMark: item.TypeMark || "",
            Length: item.Length || "",
            Width: item.Width || "",
            Height: item.Height || "",
            Perimeter: item.Perimeter || "",
            Area: item.Area || "",
            Thickness: item.Thickness || "",
            Volume: item.Volume || "",
            level: item.Level || "",
            Material: item.Material || "",
            Unit: item.Unit || "",
            Quantity: item.Quantity || "",
            UnitPrice: item.UnitPrice || "",
            TotalCost: item.TotalCost || "",
          }));

          tempRows = reorderRowsByDisciplineAndGroup(tempRows);
          setData(tempRows);
          alert("Datos cargados exitosamente");

          // Actualizar el visor 4D si es necesario
          if (
            window.planningViewer &&
            typeof window.planningViewer.setFourDData === "function"
          ) {
            const fourDData = tempRows.map((item) => ({
              dbId: parseInt(item.dbId), // o Number(item.dbId)
              startDate: item.PlanedConstructionStartDate,
              endDate: item.PlanedConstructionEndDate,
            }));
            window.planningViewer.setFourDData(fourDData);
            //console.log("4D data from DB:", fourDData);
          }
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
            `Error en la solicitud GET a la API: ${response.status} ${response.statusText}`
          );
          throw new Error("Error fetching data");
        }

        const result = await response.json();
        const { data } = result;

        if (!Array.isArray(data)) {
          console.error("Respuesta inesperada del servidor:", result);
          throw new Error("Formato de datos incorrecto");
        }

        allData = [...allData, ...data];

        if (data.length < limit) {
          hasMoreData = false; // Si hay menos datos que el límite, terminamos la paginación
        } else {
          page++; // Continuar a la siguiente página
        }
      }

      return allData;
    } catch (error) {
      console.error("Error fetching all data:", error);
      return [];
    }
  };

  const handleSendMessage = async () => {
    setIsLoading(true);
    try {
      const lowerMsg = userMessage.toLowerCase();
      let endpoint = `${backendUrl}/accprojectdatabase`;
      let isViewerCommand = false;
      let isDBIDCommand = false;
      let isUpdateCommand = false;
      let isDateRangeCommand = false;

      // Palabras clave para "update"
      const updateKeywords = [
        "change",
        "update",
        "modify",
        "transform",
        "upgrade",
        "adjust",
        "cambia",
        "modifica",
        "modificar",
        "sustituye",
        "sustituir",
        "adapta",
        "adaptar",
      ];
      const containsDBID = lowerMsg.includes("dbid");
      const containsUpdateKeyword = updateKeywords.some((k) =>
        lowerMsg.includes(k)
      );

      if (containsDBID && !containsUpdateKeyword) {
        endpoint = `${backendUrl}/accprojectdatabase/dbid-question`;
        isDBIDCommand = true;
      } else if (containsDBID && containsUpdateKeyword) {
        endpoint = `${backendUrl}/accprojectdatabase/update-field`;
        isUpdateCommand = true;
      } else if (
        lowerMsg.startsWith("aisla") ||
        lowerMsg.startsWith("oculta") ||
        lowerMsg.startsWith("resalta") ||
        lowerMsg.startsWith("isolate") ||
        lowerMsg.startsWith("hide") ||
        lowerMsg.startsWith("highlight")
      ) {
        endpoint = `${backendUrl}/accprojectdatabase/autodesk-command`;
        isViewerCommand = true;
      } else if (
        lowerMsg.startsWith("date range:") ||
        (lowerMsg.includes("construction") && lowerMsg.includes("dates"))
      ) {
        endpoint = `${backendUrl}/accprojectdatabase/date-range`;
        isDateRangeCommand = true;
      }

      let response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          projectId: cleanprojectId,
          contextData: null,
        }),
      });

      let data = await response.json();

      if (isDBIDCommand) {
        setChatbotResponse(`${data.reply}\nData: ${JSON.stringify(data.data)}`);
      } else if (isUpdateCommand) {
        setChatbotResponse(data.reply);
        const affectedDiscipline = data.discipline;
        if (affectedDiscipline) {
          await handlePullData(affectedDiscipline);
        } else {
          await handlePullData();
        }
      } else if (isDateRangeCommand) {
        setChatbotResponse(data.reply);
      } else if (!isViewerCommand) {
        if (data.reply.includes("ha sido actualizado")) {
          setChatbotResponse(data.reply);
          setIsLoading(false);

          const affectedDiscipline = data.discipline;
          if (affectedDiscipline) {
            await handlePullData(affectedDiscipline);
          } else {
            await handlePullData();
          }
          return;
        }
        if (!data.reply.includes("No encontré elementos")) {
          setChatbotResponse(data.reply);
          setIsLoading(false);
          return;
        }
        // Reintentar con todo el contexto
        const allData = await fetchAllData(cleanprojectId);
        response = await fetch(`${backendUrl}/accprojectdatabase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            projectId: cleanprojectId,
            contextData: allData,
          }),
        });

        data = await response.json();
        setChatbotResponse(data.reply);
      } else {
        // Comando para el visor
        setChatbotResponse(data.reply);
        if (data.dbIds && data.action) {
          switch (data.action) {
            case "isolate":
              isolateObjectsInViewer(window.data5Dviewer, data.dbIds);
              break;
            case "hide":
              hideObjectsInViewer(window.data5Dviewer, data.dbIds);
              break;
            case "highlight":
              highlightObjectsInViewer(window.data5Dviewer, data.dbIds);
              break;
            default:
              break;
          }
        }
      }
    } catch (error) {
      console.error("Error en el chatbot:", error);
      setChatbotResponse("Hubo un error al procesar tu solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupExtraDataChange = (group, field, value) => {
    setGroupExtraData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value,
      },
    }));
    // Llamada a la actualización del visor
    updateViewerWithNewCodeDebounced();
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

  const groupedData = useMemo(() => {
    return data.reduce((acc, row) => {
      const discipline = row.Discipline || "No Discipline";
      if (!acc[discipline]) acc[discipline] = [];
      acc[discipline].push(row);
      return acc;
    }, {});
  }, [data]);

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

  const totalsByDiscipline = useMemo(() => {
    return Object.keys(groupedData).reduce((acc, disc) => {
      acc[disc] = calculateTotals(groupedData[disc]);
      return acc;
    }, {});
  }, [groupedData]);

  return (
    <>
      {loading && <LoadingOverlay />}

      {/* Header */}
      <ACCPlatformprojectsHeader accountId={accountId} projectId={projectId} />

      {/* Contenedor principal: ocupa todo el viewport menos el header */}
      <div
        className="flex flex-col mt-14"
        style={{
          minHeight:
            "calc(100vh - 3.5rem)" /* Ajusta si tu header no mide 56px */,
        }}
      >
        {/* Sidebar + contenido desplazable */}
        <div className="flex flex-1">
          <ACCSideBar />

          <div className="flex-1 p-4 bg-white overflow-auto">
            {/* Título */}
            <div className="mb-4">
              <h1 className="text-right text-xl text-black">
                Model Database 4D
              </h1>
            </div>
            <hr className="my-4 border-t border-gray-300" />

            {/* Control Panel */}
            <ControlPanel
              viewer={window.data5Dviewer}
              showViewer={showViewer}
              setShowViewer={setShowViewer}
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
                            : "bg-[#F19A3E] text-white hover:bg-[#FE7F2D]"
                        }`}
                      >
                        Send
                      </button>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-xs">
                      <p className="text-gray-700 font-medium text-xs">
                        Answer:
                      </p>
                      <p className="mt-2 text-gray-800 text-xs">
                        {chatbotResponse}
                      </p>
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

        {/* Footer siempre al final */}
        <Footer />
      </div>
    </>
  );
};

export default ACC5DDatabase;
