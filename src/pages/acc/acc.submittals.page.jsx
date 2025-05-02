import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ACCPlatformprojectsHeader from "../../components/platform_page_components/acc.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import ACCSideBar from "../../components/platform_page_components/platform.acc.sidebar";

import submittalsSpecChart from "../../components/submittlas_page_components/submittals.spec.chart";
import submittalsStatusChart from "../../components/submittlas_page_components/submttals.status.chart";
import SubmittalsTable from "../../components/submittlas_page_components/submittals.table";
import { SubmittalsGanttChart } from "../../components/submittlas_page_components/submittals.gantt.chart";

import { fetchACCProjectSubmittals } from "../../pages/services/acc.services";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const ACCSubmittalsPage = () => {
  // Datos del proyecto
  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState({});
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Datos submittals
  const [submittals, setSubmittals] = useState([]);
  const [submittalsTotals, setSubmittalsTotals] = useState({
    total: 0,
    waitingforsubmission: 0,
    inreview: 0,
    reviewed: 0,
    submitted: 0,
    closed: 0,
  });
  const [filteredSubmittals, setFilteredSubmittals] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [specCounts, setSpecCounts] = useState({});

  // Filtros
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    spec: null,
  });

  //Submittals
  useEffect(() => {
    const getProjectSubmittals = async () => {
      const projectSubmittals = await fetchACCProjectSubmittals(
        projectId,
        cookies.access_token,
        accountId
      );

      setSubmittals(projectSubmittals.submittals);
      setSubmittalsTotals({
        total: projectSubmittals.submittals.length,
        waitingforsubmission: projectSubmittals.submittals.filter(
          (submittal) => submittal.stateId === "Waiting for submission"
        ).length,
        inreview: projectSubmittals.submittals.filter(
          (submittal) => submittal.stateId === "In review"
        ).length,
        reviewed: projectSubmittals.submittals.filter(
          (submittal) => submittal.stateId === "Reviewed"
        ).length,
        submitted: projectSubmittals.submittals.filter(
          (submittal) => submittal.stateId === "Submitted"
        ).length,
        closed: projectSubmittals.submittals.filter(
          (submittal) => submittal.stateId === "Closed"
        ).length,
      });
    };
    getProjectSubmittals();
  }, [projectId, cookies.access_token, accountId]);

  useEffect(() => {
    if (!submittals.length) {
      setStatusCounts({});
      setSpecCounts({});
      return;
    }

    // 1) Conteos por estado
    const status = submittals.reduce((acc, sub) => {
      const key = sub.stateId || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    setStatusCounts(status);

    // 2) Conteos por Spec
    const specs = submittals.reduce((acc, sub) => {
      const title = sub.specDetails?.title || "Not Specified";
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {});
    setSpecCounts(specs);
  }, [submittals]);

  async function fetchAll(projectId, cookies, accountId) {
    await Promise.all([
      fetchACCProjectSubmittals(projectId, cookies.access_token, accountId),
    ]);
  }

  useEffect(() => {
    setLoading(true);
    fetchAll(projectId, cookies, accountId)
      .catch(console.error) // maneja errores
      .finally(() => setLoading(false));
  }, [projectId, cookies, accountId]);

  useEffect(() => {
    if (submittals.length === 0) {
      setFilteredSubmittals([]);
      return;
    }

    let updated = [...submittals];

    // Filtrar por status
    if (activeFilters.status) {
      updated = updated.filter((sub) => sub.stateId === activeFilters.status);
    }

    // Filtrar por spec
    if (activeFilters.spec) {
      updated = updated.filter((sub) => {
        const specTitle = sub.specDetails?.title || "Unknown Spec";
        return specTitle === activeFilters.spec;
      });
    }

    setFilteredSubmittals(updated);
  }, [activeFilters, submittals]);

  const handleFilterClick = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: null,
      spec: null,
    });
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
  };

  const dataContainers = [
    {
      title: "Submittals Status Chart",
      content: statusCounts,
      chart: submittalsStatusChart,
      data: statusCounts,
      onClickName: (status) => handleFilterClick("status", status),
    },
    {
      title: "Submittals Spec Chart",
      content: specCounts,
      chart: submittalsSpecChart,
      data: specCounts,
      onClickName: (specTitle) => handleFilterClick("spec", specTitle),
    },
  ];

  const displayedSubmittals =
    filteredSubmittals.length > 0 ||
    Object.values(activeFilters).some((val) => val !== null)
      ? filteredSubmittals
      : submittals;

  return (
    <>
      {loading && <LoadingOverlay />}

      {/*Header*/}
      <ACCPlatformprojectsHeader accountId={accountId} projectId={projectId} />

      <div className="flex min-h-screen mt-14">
        {/* Sidebar */}
        <ACCSideBar />

        {/* Main Content */}
        <div className="flex-1 p-2 px-4 bg-white">
          <h1 className="text-right text-xl text-black mt-2">
            PROJECT SUBMITTALS REPORT
          </h1>
          <hr className="my-4 border-t border-gray-300" />

          {/* Botones */}
          <div className="mb-4 text-right">
            <button
              onClick={resetFilters}
              className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2"
            >
              Reset Table Filters
            </button>
          </div>

          {/* Layout Condicional */}

          <div className="flex max-h-[700px]">
            {/* Slider (1/4) */}
            <div className="w-1/4 bg-gray-50 mr-4 rounded-lg shadow-md chart-with-dots">
              <Slider {...sliderSettings}>
                {dataContainers.map((container, index) => (
                  <div key={index} className="p-4 h-[600px]">
                    <h2 className="text-xl font-bold mt-4 p-6">
                      {container.title}
                    </h2>
                    <hr className="border-gray-300 mb-1 text-xs" />

                    <container.chart
                      data={container.data}
                      onSliceClick={container.onClickName}
                    />

                    <div
                      className="text-xs mt-1 h-40 overflow-y-auto"
                      style={{ maxHeight: "450px" }}
                    >
                      <h3 className="font-semibold mb-3">Totals:</h3>
                      <hr className="border-gray-300 mb-1 text-xs" />
                      {Object.entries(container.content).map(([key, val]) => (
                        <p key={key}>{`${key}: ${val}`}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </Slider>
            </div>

            {/* Tabla (3/4) */}
            <div className="w-3/4 bg-white gap-4 mb-4 p-4 rounded-lg shadow-md overflow-y-auto h-[700px]">
              <SubmittalsTable
                submittals={displayedSubmittals}
                onViewDetails={(id) => handleFilterClick(id)()}
              />
            </div>

            
          </div>

          {/* ────── Diagrama de Gantt ────── */}
          <div className="mt-14 px-4 mb-8">
              <h2 className="text-xl font-semibold mb-2">Gantt Submittals</h2>
              <SubmittalsGanttChart submittals={displayedSubmittals} />
            </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ACCSubmittalsPage;
