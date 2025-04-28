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
          // <-- aquí extraemos item.value
          const doc = item.value || item;
          return {
            id: doc._key || doc.Id || `plan-${Date.now()}-${idx}`,
            SheetName: doc.SheetName || "",
            SheetNumber: doc.SheetNumber || "",
            Discipline: doc.Discipline || "Unassigned",
            Revision: doc.Revision || "",
            RevisionDate: doc.RevisionDate || "",
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
        const discipline = plan.Discipline || "Unassigned";
        disciplines[discipline] = (disciplines[discipline] || 0) + 1;
        const rev = plan.Revision || "N/A";
        revisions[rev] = (revisions[rev] || 0) + 1;
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
    if (!selectedDiscipline || !Array.isArray(plans)) {
      return plans ?? [];
    }
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
          headers: { "Content-Type": "application/json" /* Auth */ },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        alert("Plan data sent successfully!");
        // fetchPlansData(); // Opcional: recargar
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: `Request failed: ${response.status}` }));
        const errorMessage =
          errorData?.message ||
          response.statusText ||
          `HTTP error ${response.status}`;
        setError(errorMessage);
        alert(`Error sending data: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error.message || "Unexpected error during submission.";
      setError(errorMessage);
      alert(`Request error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePullData = () => {
    fetchPlansData();
  };

  // Usar useCallback si la función se pasa como prop y causa re-renders innecesarios
  const handleDisciplineClick = useCallback((disciplineDatum) => {
    const disciplineId = disciplineDatum?.id;
    if (disciplineId) {
      setSelectedDiscipline((prev) =>
        prev === disciplineId ? null : disciplineId
      );
    }
  }, []); // Vacío si no depende de nada más del scope exterior que cambie

  const resetChartFilter = () => {
    setSelectedDiscipline(null);
  };

  // ======> DECLARACIÓN MOVIDA AQUÍ <======
  /* ---------- Build Chart Slides ---------- */
  const chartSlides = useMemo(() => {
    const slides = [];
    if (Array.isArray(disciplineCounts) && disciplineCounts.length > 0) {
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
    if (Array.isArray(revisionCounts) && revisionCounts.length > 0) {
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
  }, [disciplineCounts, revisionCounts, handleDisciplineClick]); // Dependencias correctas

  // ======> FIN DE LA DECLARACIÓN MOVIDA <======

  /* ---------- Slick settings (Ahora puede usar chartSlides) ---------- */
  const sliderSettings = {
    dots: true,
    infinite: chartSlides?.length > 1, // Ahora esto funciona
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

  /* ---------- Render ---------- */
  return (
    <>
      {loading && (
        <LoadingOverlay message={error ? `Error: ${error}` : "Loading..."} />
      )}
      <BIM360PlatformprojectsHeader accountId={accountId} projectId={projectId} />

      <div className="flex min-h-screen mt-14">
        <BIM360SideBar />

        <main className="flex-1 p-4 bg-gray-100">
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {" "}
              Project Plans Management{" "}
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={handlePullData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {" "}
                Pull Data{" "}
              </Button>
              <Button
                onClick={handleSubmit}
                variant="default"
                size="sm"
                disabled={loading}
              >
                {" "}
                Send Data{" "}
              </Button>
            </div>
          </div>
          <hr className="my-4 border-t border-gray-200" />

          {/* Reset y Error */}
          <div className="mb-4 text-right">
            {error && (
              <p className="text-xs text-red-600 mt-1 text-right mr-2 inline-block">
                Error: {error}
              </p>
            )}
            <button
              onClick={resetChartFilter}
              disabled={!selectedDiscipline || loading}
              className={`text-xs py-1 px-3 rounded ml-2 transition-colors duration-150 ease-in-out ${
                selectedDiscipline && !loading
                  ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Reset Chart Filter
            </button>
          </div>

          {/* Layout Principal */}
          <div
            className="flex flex-col lg:flex-row gap-4"
            style={{ height: "calc(100vh - 220px)" }}
          >
            {" "}
            {/* Ajusta 220px según necesites */}
            {/* Gráficos (1/4) */}
            <section className="w-full lg:w-1/4 bg-white rounded-lg shadow-md overflow-hidden flex flex-col chart-with-dots">
              <h2 className="text-base font-semibold p-3 border-b text-gray-700 flex-shrink-0">
                {" "}
                Data Overview{" "}
              </h2>
              <div className="flex-1 relative min-h-0">
                {chartSlides.length > 0 ? (
                  <Slider {...sliderSettings} className="h-full">
                    {chartSlides.map((slide, index) => (
                      <div
                        key={slide.title + index}
                        className="px-2 pt-2 pb-10 h-full flex flex-col outline-none focus:outline-none"
                      >
                        <h3 className="text-sm font-medium mb-1 text-center flex-shrink-0">
                          {slide.title}
                        </h3>
                        <div className="flex-1 relative">
                          {" "}
                          <slide.Component {...slide.props} />{" "}
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm h-full flex items-center justify-center">
                    {" "}
                    {loading ? "Loading..." : "No chart data."}{" "}
                  </div>
                )}
              </div>
            </section>
            {/* Tabla (3/4) */}
            <section className="w-full lg:w-3/4 flex flex-col">
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