import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  use,
} from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import BIM360PlatformLayout from "../../components/platform_page_components/bim360.platform.layout";

import RevisionPlansPieChart from "../../components/plans_components/plans.revision.chart";
import DisciplinePlansPieChart from "../../components/plans_components/plans.discipline.chart";
import * as XLSX from "xlsx";

import PlansTable from "../../components/plans_components/plans.table";
import FolderMappingModal from "../../components/plans_components/plans.tree.selection";

const defaultPlanRow = {
  Id: Date.now(),
  Number: "",
  SheetName: "",
  SheetNumber: "",
  Discipline: "",
  Revision: "",
  RevisionDate: "",
};

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const BIM360ProjectPlansPage = () => {
  /* ---------- Router / Auth ---------- */
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);

  /* ---------- UI State ---------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- Data State ---------- */
  const [plans, setPlans] = useState([]);
  const [disciplineCounts, setDisciplineCounts] = useState([]);
  const [revisionCounts, setRevisionCounts] = useState([]);

  /* ---------- Filter State ---------- */
  const [tableFilter, setTableFilter] = useState({ discipline: null, revision: null });
  const [selectedRows, setSelectedRows] = useState([]);

  /* ---------- Folder Mapping States ---------- */
  const [showMapping, setShowMapping] = useState(false);
  const [folderTree, setFolderTree] = useState(null);
  const [mappedPlans, setMappedPlans] = useState([]);

  /* ---------- Data Fetching Function (Reusable) ---------- */
  const fetchPlansData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${backendUrl}/plans/${accountId}/${projectId}/plans`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (res.status === 404) {
        setPlans([]);
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const result = await res.json();
      if (Array.isArray(result.data)) {
        const pulledPlans = result.data.map((item, idx) => {
          const doc = item.value || item;
          return {
            id: doc._key || doc.Id || `plan-${Date.now()}-${idx}`,
            SheetName: doc.SheetName || "",
            SheetNumber: doc.SheetNumber || "",
            Discipline: doc.Discipline || "Unassigned",
            Revision: doc.Revision || "",
            lastModifiedTime: doc.LastModifiedDate
              ? doc.LastModifiedDate.split("T")[0]
              : "",
            exists: doc.InFolder ?? false,
            revisionProcess: doc.InARevisionProcess || "",
            revisionStatus: doc.RevisionStatus || "",
          };
        });
        setPlans(pulledPlans);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Failed to fetch plan data:", err);
      setError(err.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [accountId, projectId]);

  /* ---------- Initial Data Load ---------- */
  useEffect(() => {
    fetchPlansData();
  }, [fetchPlansData]);

  /* ---------- Derive counts & filtered data ---------- */
  useEffect(() => {
    if (!Array.isArray(plans) || plans.length === 0) {
      setDisciplineCounts([]);
      setRevisionCounts([]);
      return;
    }

    const disciplines = {};
    const revisions = {};
    plans.forEach((plan) => {
      if (!plan.isPlaceholder) {
        const d = plan.Discipline || "Unassigned";
        disciplines[d] = (disciplines[d] || 0) + 1;
        const r = plan.Revision || "N/A";
        revisions[r] = (revisions[r] || 0) + 1;
      }
    });

    setDisciplineCounts(
      Object.entries(disciplines).map(([id, value]) => ({ id, value }))
    );
    setRevisionCounts(
      Object.entries(revisions).map(([id, value]) => ({ id, value }))
    );
  }, [plans]);

  const filteredPlansForTable = useMemo(() => {
    let data = mappedPlans.length ? mappedPlans : plans;
    if (!Array.isArray(data)) return [];
    if (tableFilter.discipline) {
      data = data.filter(
        (p) => (p.Discipline || "Unassigned") === tableFilter.discipline
      );
    }
    if (tableFilter.revision) {
      data = data.filter(
        (p) => (p.Revision || "N/A") === tableFilter.revision
      );
    }
    return data;
  }, [plans, mappedPlans, tableFilter]);

   /* ---------- Event Handlers ---------- */
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const validPlans = Array.isArray(plans) ? plans : [];
      const dataToSend = validPlans.filter(
        (p) => !p.isPlaceholder && (p.SheetNumber || p.SheetName)
      );
      if (dataToSend.length === 0) {
        alert("No valid plan data to send.");
        return;
      }
      const payload = dataToSend.map((plan) => ({
        Id: plan.id,
        SheetName: plan.SheetName,
        SheetNumber: plan.SheetNumber,
        Discipline: plan.Discipline,
        Revision: plan.Revision,
        LastModifiedDate: plan.lastModifiedTime,
        InFolder: plan.exists,
        InARevisionProcess: plan.revisionProcess,
        RevisionStatus: plan.revisionStatus,
      }));
      const response = await fetch(
        `${backendUrl}/plans/${accountId}/${projectId}/plans`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        alert("Plan data sent successfully!");
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: `Request failed: ${response.status}` }));
        const msg =
          errorData?.message ||
          response.statusText ||
          `HTTP error ${response.status}`;
        setError(msg);
        alert(`Error sending data: ${msg}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      const msg = err.message || "Unexpected error during submission.";
      setError(msg);
      alert(`Request error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePullData = () => {
    fetchPlansData();
  };

  const handleDisciplineClick = useCallback((value) => {
    setTableFilter((prev) => ({ ...prev, discipline: value }));
  }, []);

  const handleRevisionClick = useCallback((value) => {
    setTableFilter((prev) => ({ ...prev, revision: value }));
  }, []);

  const resetChartFilter = () => {
    setTableFilter({ discipline: null, revision: null });
  };

  /* ---------- Chart Slides ---------- */
  const chartSlides = useMemo(() => {
    const slides = [];
    if (disciplineCounts.length) {
      slides.push({
        title: "Plans by Discipline",
        Component: DisciplinePlansPieChart,
        props: {
          data: disciplineCounts,
          onSliceClick: handleDisciplineClick,
          innerRadius: 0.5,
          padAngle: 0.7,
          cornerRadius: 3,
          margin: { top: 30, right: 50, bottom: 70, left: 50 },
          legends: [
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 80,
              itemHeight: 18,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 14,
              symbolShape: "circle",
              effects: [{ on: "hover", style: { itemTextColor: "#000" } }],
            },
          ],
        },
      });
    }
    if (revisionCounts.length) {
      slides.push({
        title: "Plans by Revision",
        Component: RevisionPlansPieChart,
        props: {
          data: revisionCounts,
          onSliceClick: handleRevisionClick,
          innerRadius: 0.5,
          padAngle: 0.7,
          cornerRadius: 3,
          margin: { top: 30, right: 50, bottom: 70, left: 50 },
        },
      });
    }
    return slides;
  }, [disciplineCounts, revisionCounts, handleDisciplineClick, handleRevisionClick]);

  const sliderSettings = {
    dots: true,
    infinite: chartSlides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    adaptiveHeight: false,
  };

  const handleInputChange = (planId, field, value) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, [field]: value, isPlaceholder: false } : p
      )
    );
  };

  const handleAddRow = () => {
    setPlans((prev) => [
      ...prev,
      {
        ...defaultPlanRow,
        Id: Date.now().toString(),
        id: Date.now().toString(),
        isPlaceholder: false,
      },
    ]);
  };

  const handleRemoveRows = async (ids) => {
    if (!ids.length) return;

    // 1️⃣ Dispara el DELETE al backend
    try {
      const res = await fetch(
        `${backendUrl}/plans/${accountId}/${projectId}/plans`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }), // ids = SheetNumber (_key)
        }
      );

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || `HTTP ${res.status}`);
      }

      // 2️⃣ Actualiza la UI solo si el backend respondió OK
      setPlans((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelectedRows([]);
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Error al borrar: ${err.message}`);
    }
  };

   const handleFolderChosen = async (folderId, tree) => {
  // 1️⃣ Encuentra la carpeta seleccionada en el árbol
  const findNode = (nodes) => {
    for (const n of nodes) {
      if (n.id === folderId) return n;
      if (n.children) {
        const found = findNode(n.children);
        if (found) return found;
      }
    }
  };
  const root = findNode(tree);
  if (!root) {
    //console.warn("Carpeta no encontrada en el árbol:", folderId);
    return;
  }

  // 2️⃣ Aplana el árbol para obtener sólo los nodos de tipo "file"
  const flattenFiles = (nodes) => {
    let out = [];
    nodes.forEach((n) => {
      if (n.type === "file") {
        out.push({
          itemId: n.id,
          versionUrn: n.version_urn,
          name: n.name,
        });
      }
      if (n.children) {
        out = out.concat(flattenFiles(n.children));
      }
    });
    return out;
  };
  const fileNodes = flattenFiles(root.children || []);
  const lineageIds = fileNodes.map((f) => f.itemId);
  const versionedUrns = fileNodes.map((f) => f.versionUrn);

  // 3️⃣ Trae los detalles de los archivos (lastModifiedTime)
  let details = [];
  try {
    const resp = await fetch(
      `${backendUrl}/datamanagement/items/${accountId}/${projectId}/file-data`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: lineageIds }),
      }
    );
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || resp.statusText);
    details = json.data;
  } catch (err) {
    console.error("Error fetch item details:", err);
    alert(`No pude cargar detalles de archivos: ${err.message}`);
  }

  // 4️⃣ Trae las revisiones de los archivos (process + status)
  let filesRevisions = [];
  try {
    const resp = await fetch(
      `${backendUrl}/datamanagement/items/${accountId}/${projectId}/file-revisions`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: versionedUrns }),
      }
    );
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || resp.statusText);
    filesRevisions = json.data;
  } catch (err) {
    console.error("Error fetch files revisions:", err);
    alert(`No pude cargar revisiones de archivos: ${err.message}`);
  }

  // 5️⃣ Mapea UNA VEZ el estado con la info nueva
  const updated = plans.map((plan) => {
    const matchNode = fileNodes.find((f) =>
      f.name.toLowerCase().includes((plan.SheetNumber || "").toLowerCase())
    );
    const exists = !!matchNode;
    const lineageId = matchNode?.itemId;
    const detail = details.find((d) => d.data?.id === lineageId);
    const rawTS = detail?.data?.attributes?.lastModifiedTime;
    const lastModifiedTime = rawTS ? rawTS.split("T")[0] : "";
    const versionUrn = matchNode?.versionUrn;
    const fileRev = filesRevisions.find((fr) => fr.itemId === versionUrn) || {};
    const revisionProcess = fileRev.label || "";
    const revisionStatus = fileRev.reviewStatus || "";

    return {
      ...plan,
      exists,
      lastModifiedTime,
      revisionProcess,
      revisionStatus,
    };
  });

  // 6️⃣ Solo aquí volcamos los dos estados (planes “crudos” y mapeados)
  setMappedPlans(updated);
  setPlans(updated);
};

  //console.log("mappedPlans", mappedPlans);

  // ——— IMPORT / EXPORT EXCEL ———

  const exportToExcel = (data, filename = "export.xlsx") => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plans");
    XLSX.writeFile(wb, filename);
  };

  const handleExportPlans = () => {
    exportToExcel(plans, `project-${projectId}-plans.xlsx`);
  };

  const handleImportPlans = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const imported = rows.map((row, idx) => {
        // 1) Revision: forzamos string para que "0" no sea falsy
        const rev =
          row.Revision !== null && row.Revision !== undefined
            ? String(row.Revision)
            : "";

        // 2) Fecha: detectamos "DD/MM/YYYY" y la convertimos a "YYYY-MM-DD"
        let revDate = row.RevisionDate;
        if (
          typeof revDate === "string" &&
          /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(revDate)
        ) {
          const [d, m, y] = revDate.split("/");
          revDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        } else if (revDate instanceof Date) {
          revDate = revDate.toISOString().split("T")[0];
        } else {
          revDate = "";
        }

        return {
          id: String(row.id ?? row.Id ?? `import-${Date.now()}-${idx}`),
          SheetName: row.SheetName,
          SheetNumber: row.SheetNumber,
          Discipline: row.Discipline,
          Revision: rev,
          RevisionDate: revDate,
        };
      });

      setPlans(imported);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  }, []);

  const displayedPlans = mappedPlans.length ? mappedPlans : plans;

  /* ---------- Render ---------- */
  return (
    <BIM360PlatformLayout projectId={projectId} accountId={accountId}>
      {loading && (
        <LoadingOverlay message={error ? `Error: ${error}` : "Loading..."} />
      )}

      <div className="flex min-h-screen">

         <main className="flex-1 p-2 px-4 bg-white">
                  <h1 className="text-right text-xl mt-2">PROJECT PLANS MANAGEMENT</h1>
                  <hr className="my-4 border-t border-gray-300" />
                  <div className="mb-4 text-right">
                    <button
                      onClick={() => setShowMapping(true)}
                      className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2"
                    >
                      Files – Folder mapping
                    </button>
                    <button
                      onClick={handlePullData}
                      className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2"
                    >
                      Pull Data
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2"
                    >
                      Send Data
                    </button>
                    <button
                      onClick={resetChartFilter}
                      className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2"
                    >
                      Reset Chart Filter
                    </button>
                    <button
                      onClick={handleExportPlans}
                      className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2"
                    >
                      Export Plans List
                    </button>
                    <label className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2 cursor-pointer">
                      Importar Excel
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleImportPlans}
                        className="hidden"
                      />
                    </label>
                  </div>
        
                  {/* modal */}
                  <FolderMappingModal
                    open={showMapping}
                    onClose={() => setShowMapping(false)}
                    accountId={accountId}
                    projectId={projectId}
                    backendUrl={backendUrl}
                    onFolderChosen={handleFolderChosen}
                  />
        
                  <div className="flex h-[700px]">
                    <section className="w-1/4 bg-gray-50 mr-4 rounded-lg shadow-md chart-with-dots">
                      <h2 className="text-xl font-bold mt-4 p-6">Plans Data Charts</h2>
                      <hr className="border-gray-300 mb-1 text-xs" />
                      <Slider
                        key={chartSlides.length}
                        {...sliderSettings}
                        className="h-full"
                      >
                        {chartSlides.map((slide, index) => (
                          <div
                            key={slide.title + index}
                            className="px-2 pt-2 pb-10 h-full flex flex-col outline-none focus:outline-none"
                          >
                            <h3 className="text-sm font-medium mb-1 text-center flex-shrink-0">
                              {slide.title}
                            </h3>
                            <div className="flex-1 relative">
                              <slide.Component {...slide.props} />
                            </div>
                          </div>
                        ))}
                      </Slider>
                    </section>
        
                    <section className="w-3/4 bg-white p-4 rounded-lg shadow-md overflow-y-auto h-[700px]">
                      <PlansTable
                        plans={filteredPlansForTable}
                        onInputChange={handleInputChange}
                        onAddRow={handleAddRow}
                        onRemoveRows={handleRemoveRows}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                      />
                    </section>
                  </div>
                </main>
              </div>

    </BIM360PlatformLayout>
  );
};

export default React.memo(BIM360ProjectPlansPage);
