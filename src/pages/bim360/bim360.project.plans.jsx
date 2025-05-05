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

import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import { Button } from "../../components/ui/button";
import RevisionPlansPieChart from "../../components/plans_components/plans.revision.chart";
import DisciplinePlansPieChart from "../../components/plans_components/plans.discipline.chart";

import PlansTable from "../../components/plans_components/plans.table";

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
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

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
            RevisionDate: doc.RevisionDate
              ? doc.RevisionDate.split("T")[0]
              : "",
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
    if (!selectedDiscipline || !Array.isArray(plans)) return plans ?? [];
    return plans.filter(
      (plan) => (plan.Discipline || "Unassigned") === selectedDiscipline
    );
  }, [plans, selectedDiscipline]);

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
        RevisionDate: plan.RevisionDate,
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

  const handleDisciplineClick = useCallback((d) => {
    setSelectedDiscipline((prev) => (prev === d.id ? null : d.id));
  }, []);

  const resetChartFilter = () => {
    setSelectedDiscipline(null);
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
          innerRadius: 0.5,
          padAngle: 0.7,
          cornerRadius: 3,
          margin: { top: 30, right: 50, bottom: 70, left: 50 },
        },
      });
    }
    return slides;
  }, [disciplineCounts, revisionCounts, handleDisciplineClick]);

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

  const handleRemoveRows = (ids) => {
    setPlans((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedRows([]);
  };

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

  /* ---------- Render ---------- */
  return (
    <>
      {loading && (
        <LoadingOverlay message={error ? `Error: ${error}` : "Loading..."} />
      )}
      <BIM360PlatformprojectsHeader accountId={accountId} projectId={projectId} />

      <div className="flex min-h-screen mt-14">
        <BIM360SideBar />

        <main className="flex-1 p-2 px-4 bg-white">
          <h1 className="text-right text-xl mt-2">PROJECT PLANS MANAGEMENT</h1>
          <hr className="my-4 border-t border-gray-300" />

          <div className="mb-4 text-right">
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
                plans={plans}
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

      <Footer />
    </>
  );
};

export default BIM360ProjectPlansPage;