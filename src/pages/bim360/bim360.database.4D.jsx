import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import { data4Dviewer } from "../../utils/Viewers/4D.viewer";

import {
  disciplineOptions,
  elementtype,
  propertyMappings,
  numericFields,
} from "../../lib/data.bases.constants";

import { defaultRow as defaultRow4D } from "../../lib/default.row.4D";

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
} from "../../lib/general.functions";

import { useTableControls } from "../services/database.table";

import Database4DTable from "../../components/database_components/database.4D.table";
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

const BIM3604DDatabase = () => {
  const defaultRow = useMemo(() => defaultRow4D, []);
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

  const updateRowNumbers = (rows) => {
    return rows.map((row, idx) => ({ ...row, rowNumber: idx + 1 }));
  };

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
        const existsDbId = prevData.some((r) => r.dbId === dbId);
        if (existsDbId) {
          alert("This element is already in the table");
          return prevData;
        }
        const updatedData = [...prevData, newRow];
        return updateRowNumbers(updatedData);
      });
    };

    window.addEventListener("dbIdDataExtracted", handleDataExtracted);
    return () => {
      window.removeEventListener("dbIdDataExtracted", handleDataExtracted);
    };
  }, [defaultRow, propertyMapping, fieldsToCheck]);

  const groupedData = useMemo(() => {
    return data.reduce((acc, row) => {
      const discipline = row.Discipline || "No Discipline";
      if (!acc[discipline]) acc[discipline] = [];
      acc[discipline].push(row);
      return acc;
    }, {});
  }, [data]);

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
      setData((prev) =>
        prev.map((item) => {
          if (selectedRows.includes(item.dbId)) {
            return { ...item, Discipline: newValue };
          }
          return item;
        })
      );
    } else {
      const clone = [...data];
      clone[index] = { ...clone[index], Discipline: newValue };
      setData(clone);
    }
  };

  const handleElementTypeChange = (row, newValue) => {
    const index = data.findIndex((r) => r === row);
    if (index === -1) return;

    if (selectedRows.includes(row.dbId)) {
      setData((prev) =>
        prev.map((item) => {
          if (selectedRows.includes(item.dbId)) {
            return { ...item, ElementType: newValue };
          }
          return item;
        })
      );
    } else {
      const clone = [...data];
      clone[index] = { ...clone[index], ElementType: newValue };
      setData(clone);
    }
  };

  const handleInputChange = (row, event) => {
    const { name, value } = event.target;
    const index = data.findIndex((r) => r === row);
    if (index === -1) return;

    const currentRow = data[index];
    if (selectedRows.includes(currentRow.dbId)) {
      setData((prev) =>
        prev.map((item) => {
          if (selectedRows.includes(item.dbId)) {
            return { ...item, [name]: value };
          }
          return item;
        })
      );
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
    if (!federatedModel || window.viewerInitialized) return;

    const conditionalSelectionHandler = (dbIdArray) => {
      if (!syncViewerSelectionRef.current) {
        return;
      }

      handleViewerSelectionChanged(dbIdArray);
    };

    data4Dviewer({
      federatedModel,
      setSelectionCount,
      setSelection: conditionalSelectionHandler,
      setIsLoadingTree,
      setCategoryData,
    });

    window.viewerInitialized = true;
  }, [federatedModel, handleViewerSelectionChanged]);

  useEffect(() => {
    syncViewerSelectionRef.current = syncViewerSelection;

    if (syncViewerSelection && window.data4Dviewer) {
      const currentDbIds = window.data4Dviewer.getSelection() || [];
      handleViewerSelectionChanged(currentDbIds);
    }
  }, [syncViewerSelection, handleViewerSelectionChanged]);

  useEffect(() => {
    if (
      !window.data4Dviewer ||
      typeof window.data4Dviewer.set4DData !== "function"
    ) {
      return;
    }

    const validData = data.filter(
      (item) => item.dbId && !isNaN(parseInt(item.dbId, 10))
    );
    const fourDData = validData.map((item) => ({
      dbId: parseInt(item.dbId, 10),
      startDate: item.PlanedConstructionStartDate,
      endDate: item.PlanedConstructionEndDate,
    }));

    window.data4Dviewer.set4DData(fourDData);
  }, [data]);

  const handleSubmit = async () => {
      // Definición de los campos numéricos (asegúrate que esta variable esté definida en tu componente)
      // Ejemplo: const numericFields = ["Length", "Area", "Volume", "Width"];
      // Si 'data', 'backendUrl', 'accountId', 'projectId' son props o vienen del estado, asegúrate que estén accesibles.
    
      try {
        // 1) Limpiar y parsear valores numéricos
        const cleanedData = data.map((row) => {
          const cleanedRow = { ...row };
          // Asegúrate que numericFields esté definido y accesible aquí
          if (typeof numericFields !== 'undefined' && Array.isArray(numericFields)) {
            numericFields.forEach((field) => {
              const v = cleanedRow[field];
              if (typeof v === "string") {
                if (v.trim() === "" || v.toLowerCase() === "not specified") {
                  cleanedRow[field] = null;
                } else {
                  const n = parseFloat(v);
                  cleanedRow[field] = isNaN(n) ? null : n;
                }
              } else if (v === undefined) { // Si el campo no existe en el row, puedes definirlo como null
                cleanedRow[field] = null;
              }
            });
          }
          return cleanedRow;
        });
    
        // 2) Parámetros de chunking y reintentos
        const CHUNK_SIZE = 500; // REDUCIDO: Prueba con 20-30. Ajusta según sea necesario.
        const MAX_RETRIES = 3; // Número máximo de reintentos por lote
        const INITIAL_RETRY_DELAY = 1000; // 1 segundo de espera inicial para reintento
        const PROGRESS_UPDATE_INTERVAL = 200; // Pequeña pausa entre lotes exitosos
    
        const url = `${backendUrl}/modeldata/${accountId}/${projectId}/data`;
        const totalChunks = Math.ceil(cleanedData.length / CHUNK_SIZE);
        let successfulChunks = 0;
        let processedItems = 0;
        const failedBatchesInfo = []; // Para guardar información de lotes que fallaron permanentemente
    
        // 3) Enviar lotes secuencialmente con reintentos
        for (let i = 0; i < cleanedData.length; i += CHUNK_SIZE) {
          const chunk = cleanedData.slice(i, i + CHUNK_SIZE);
          const currentChunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
          let retries = 0;
          let successInCurrentChunk = false;
    
          while (retries < MAX_RETRIES && !successInCurrentChunk) {
            console.log(
              `🚀 Enviando lote ${currentChunkNumber}/${totalChunks} (${chunk.length} items). Intento ${retries + 1}/${MAX_RETRIES}...`
            );
    
            try {
              const resp = await fetch(url, {
                method: "POST",
                credentials: "include", // Asegúrate que esto es necesario y está configurado correctamente en el backend (CORS)
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(chunk),
              });
    
              if (resp.ok) { // resp.ok es true para status HTTP 200-299
                const responseData = await resp.json(); // Leer el cuerpo de la respuesta
                console.log(`✅ Lote ${currentChunkNumber} completado con status ${resp.status}. Respuesta:`, responseData);
                successInCurrentChunk = true;
                successfulChunks++;
                processedItems += chunk.length; // O podrías usar responseData.data.processed si el backend lo devuelve
              } else {
                // Errores HTTP como 400, 401, 500, 504, etc.
                let errMsg = `HTTP ${resp.status}: ${resp.statusText}`;
                let errorDetails = null;
                try {
                  // Intenta parsear el error como JSON
                  errorDetails = await resp.json();
                  errMsg = errorDetails.message || JSON.stringify(errorDetails);
                } catch (e) {
                  // Si no es JSON, intenta leer como texto (puede ser HTML de error de Vercel)
                  const textError = await resp.text();
                  errMsg = textError.substring(0, 200); // Mostrar solo una parte si es HTML largo
                  if (resp.status === 504 && textError.toLowerCase().includes("vercel")) {
                    errMsg = `Gateway Timeout (504). El servidor de Vercel tardó demasiado en responder.`;
                  }
                }
                console.error(`Error en lote ${currentChunkNumber}, Intento ${retries + 1}: ${errMsg}`);
                
                // Solo reintentar para errores de servidor (5xx, incluido 504) o algunos errores específicos
                if (resp.status >= 500 && resp.status <= 599) { // 500, 502, 503, 504, etc.
                  retries++;
                  if (retries < MAX_RETRIES) {
                    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1); // Backoff exponencial
                    console.log(`Reintentando lote ${currentChunkNumber} en ${delay / 1000}s...`);
                    await new Promise((r) => setTimeout(r, delay));
                  } else {
                    // Máximo de reintentos alcanzado para este lote
                    const finalErrorMsg = `Lote ${currentChunkNumber} falló después de ${MAX_RETRIES} intentos: ${errMsg}`;
                    console.error(finalErrorMsg);
                    failedBatchesInfo.push({ batch: currentChunkNumber, error: errMsg, items: chunk.length });
                    // No lanzamos un error aquí para permitir que otros lotes continúen, se informará al final.
                    break; // Salir del bucle while de reintentos para este lote
                  }
                } else {
                  // Para errores 4xx (Bad Request, Unauthorized, etc.), no tiene sentido reintentar.
                  const clientErrorMsg = `Lote ${currentChunkNumber} falló con error cliente (status ${resp.status}): ${errMsg}`;
                  console.error(clientErrorMsg);
                  failedBatchesInfo.push({ batch: currentChunkNumber, error: clientErrorMsg, items: chunk.length });
                  break; // Salir del bucle while de reintentos
                }
              }
            } catch (networkError) { // Captura errores de red (fetch falló por completo, ej. sin conexión)
              console.error(`Error de red en lote ${currentChunkNumber}, Intento ${retries + 1}: ${networkError.message}`);
              retries++;
              if (retries < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries - 1);
                console.log(`Reintentando lote ${currentChunkNumber} en ${delay / 1000}s (error de red)...`);
                await new Promise((r) => setTimeout(r, delay));
              } else {
                const finalNetErrorMsg = `Lote ${currentChunkNumber} falló por error de red después de ${MAX_RETRIES} intentos: ${networkError.message}`;
                console.error(finalNetErrorMsg);
                failedBatchesInfo.push({ batch: currentChunkNumber, error: finalNetErrorMsg, items: chunk.length });
                break; // Salir del bucle while de reintentos
              }
            }
          } // Fin while (reintentos)
    
          // Pequeña pausa entre la finalización de un lote (o sus reintentos) y el inicio del siguiente.
          // Solo si no es el último lote.
          if (currentChunkNumber < totalChunks) {
              await new Promise((r) => setTimeout(r, PROGRESS_UPDATE_INTERVAL));
          }
        } // Fin for (lotes)
    
        // 6) Informar resultado final
        if (failedBatchesInfo.length > 0) {
          console.error("Algunos lotes no pudieron ser procesados:", failedBatchesInfo);
          let failureSummary = failedBatchesInfo.map(f => `Lote ${f.batch} (${f.items} items) falló: ${f.error}`).join("\n");
          alert(
            `Proceso completado con errores.\nLotes exitosos: ${successfulChunks}/${totalChunks} (${processedItems} items).\n\nLotes fallidos:\n${failureSummary}`
          );
        } else {
          alert(`¡Todos los datos (${processedItems} items en ${successfulChunks} lotes) enviados exitosamente!`);
        }
    
      } catch (error) { // Captura errores inesperados en la lógica de handleSubmit fuera del bucle de lotes.
        console.error("Error general en handleSubmit:", error);
        alert(`Error crítico al procesar los datos: ${error.message}`);
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
              Discipline: value.Discipline || "",
              ElementType: value.ElementType || "",
              TypeName: value.TypeName || "",
              Description: value.Description || "",
              TypeMark: value.TypeMark || "",
              Length: value.Length ?? "",
              Width: value.Width ?? "",
              Height: value.Height ?? "",
              Perimeter: value.Perimeter ?? "",
              Area: value.Area ?? "",
              Thickness: value.Thickness ?? "",
              Volume: value.Volume ?? "",
              Level: value.Level || "",
              Material: value.Material || "",
              PlanedConstructionStartDate: value.PlanedConstructionStartDate
                ? value.PlanedConstructionStartDate.substring(0, 10)
                : "",
              PlanedConstructionEndDate: value.PlanedConstructionEndDate
                ? value.PlanedConstructionEndDate.substring(0, 10)
                : "",
              RealConstructionStartDate: value.RealConstructionStartDate
                ? value.RealConstructionStartDate.substring(0, 10)
                : "",
              RealConstructionEndDate: value.RealConstructionEndDate
                ? value.RealConstructionEndDate.substring(0, 10)
                : "",
            };
          });

          tempRows = reorderRowsByDiscipline(tempRows);
          setData(tempRows);
          alert("Data successfully loaded");

          if (
            window.data4Dviewer &&
            typeof window.data4Dviewer.set4DData === "function"
          ) {
            const fourDData = tempRows.map((item) => ({
              dbId: parseInt(item.dbId, 10),
              startDate: item.PlanedConstructionStartDate,
              endDate: item.PlanedConstructionEndDate,
            }));
            window.data4Dviewer.set4DData(fourDData);
          }
        } else {
          alert("No data was found for this project.");
        }
      } else {
        const errorData = await response.json();
        console.error("Error fetching data:", errorData.message);
        alert(`Error fetching data: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Request error:", error);
      alert(`Request error: ${error.message}`);
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
        window.data4Dviewer &&
        typeof window.data4Dviewer.applyColorByDiscipline === "function"
      ) {
        window.data4Dviewer.applyColorByDiscipline(dbIds, selectedColor);
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
          console.error(`Error GET: ${response.status} ${response.statusText}`);
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
              isolateObjectsInViewer(window.data4Dviewer, data.dbIds);
              break;
            case "hide":
              hideObjectsInViewer(window.data4Dviewer, data.dbIds);
              break;
            case "highlight":
              highlightObjectsInViewer(window.data4Dviewer, data.dbIds);
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
    <>
      {loading && <LoadingOverlay />}

      {/* Header */}
      <BIM360PlatformprojectsHeader
        accountId={accountId}
        projectId={projectId}
      />

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
          <BIM360SideBar />

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
              viewer={window.data4Dviewer}
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
                        id="TAD4DViwer"
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
                <Database4DTable
                  viewer={window.data4Dviewer}
                  data={data}
                  groupedData={groupedData}
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

            {/* Slider 4D */}
            <div className="mt-4 bg-white shadow-lg rounded-lg p-4 mb-4">
              <h3 className="text-md mb-2">4D Sequence Control</h3>
              <input
                type="range"
                id="dateSlider"
                min="0"
                max="100"
                step="1"
                defaultValue="0"
                className="w-full"
              />
              <div id="currentDateDisplay" className="mt-2 text-sm">
                Current date:
              </div>
            </div>
          </div>
        </div>

        {/* Footer siempre al final */}
        <Footer />
      </div>
    </>
  );
};

export default BIM3604DDatabase;
