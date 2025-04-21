import { useEffect, useState } from "react";
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

import {
  fetchACCProjectSubmittals,
} from "../../pages/services/acc.services";

  const ACCSubmittalsPage = () => {
    const { projectId, accountId } = useParams();
    const [cookies] = useCookies(["access_token"]);
    const token = cookies.access_token;
  
    // Estados
    const [projectsData, setProjectsData] = useState(null);
    const [project, setProject] = useState({});
    const [submittals, setSubmittals] = useState([]);
    const [submittalsTotals, setSubmittalsTotals] = useState({
      total: 0,
      waitingforsubmission: 0,
      inreview: 0,
      reviewed: 0,
      submitted: 0,
      closed: 0,
    });
    const [statusCounts, setStatusCounts] = useState({});
    const [specCounts, setSpecCounts] = useState({});
    const [activeFilters, setActiveFilters] = useState({ status: null, spec: null });
    const [filteredSubmittals, setFilteredSubmittals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const [submittalsRes] = await Promise.all([
            fetchACCProjectSubmittals(projectId, token, accountId),
          ]);

          const subs = submittalsRes.submittals || [];
          setSubmittals(subs);
  
          const totals = {
            total: subs.length,
            waitingforsubmission: subs.filter(s => s.stateId === "Waiting for submission").length,
            inreview: subs.filter(s => s.stateId === "In review").length,
            reviewed: subs.filter(s => s.stateId === "Reviewed").length,
            submitted: subs.filter(s => s.stateId === "Submitted").length,
            closed: subs.filter(s => s.stateId === "Closed").length,
          };
          setSubmittalsTotals(totals);
  
          const stateCountsTmp = {};
          const specCountsTmp = {};
          subs.forEach(sub => {
            stateCountsTmp[sub.stateId] = (stateCountsTmp[sub.stateId] || 0) + 1;
            const title = sub.specDetails?.title || 'Unknown Spec';
            specCountsTmp[title] = (specCountsTmp[title] || 0) + 1;
          });
          setStatusCounts(stateCountsTmp);
          setSpecCounts(specCountsTmp);
        } catch (err) {
          console.error('Error loading data:', err);
          setError(err.message || 'Error fetching data');
        } finally {
          setLoading(false);
        }
      };
  
      if (token && projectId && accountId) {
        loadData();
      }
    }, [token, projectId, accountId]);

    useEffect(() => {
      if (!submittals.length) {
        setFilteredSubmittals([]);
        return;
      }
      let updated = [...submittals];
      if (activeFilters.status) {
        updated = updated.filter(s => s.stateId === activeFilters.status);
      }
      if (activeFilters.spec) {
        updated = updated.filter(
          s => (s.specDetails?.title || 'Unknown Spec') === activeFilters.spec
        );
      }
      setFilteredSubmittals(updated);
    }, [submittals, activeFilters]);
  
    const handleFilterClick = (filterType, value) => {
      setActiveFilters(prev => ({ ...prev, [filterType]: value }));
    };
  
    const resetFilters = () => {
      setActiveFilters({ status: null, spec: null });
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
        onClickName: status => handleFilterClick('status', status),
      },
      {
        title: "Submittals Spec Chart",
        content: specCounts,
        chart: submittalsSpecChart,
        data: specCounts,
        onClickName: specTitle => handleFilterClick('spec', specTitle),
      },
    ];
  
    const displayedSubmittals =
      filteredSubmittals.length || activeFilters.status || activeFilters.spec
        ? filteredSubmittals
        : submittals;
  
    return (
      <>
        {loading && <LoadingOverlay />}
        {error && <p className="text-red-500">{error}</p>}
  
        <ACCPlatformprojectsHeader accountId={accountId} projectId={projectId} />
        <div className="flex h-screen mt-14">
          <ACCSideBar />
          <div className="flex-1 p-2 px-4 bg-white">
            <h1 className="text-right text-xl text-black mt-2">Submittals Report</h1>
            <hr className="my-4 border-t border-gray-300" />
  
            <div className="mb-4 text-right">
              <button
                onClick={resetFilters}
                className="bg-[#2ea3e3] text-white text-xs py-2 px-4 rounded mb-4 mx-2 hover:bg-[#aedb01] text-black"
              >
                Reset Table Filters
              </button>
            </div>
  
            <div className="flex flex-1 p-2 px-4 bg-white h-[650px]">
              <div className="w-1/4 bg-gray-50 gap-4 mb-4 rounded-lg shadow-md mr-4">
                <Slider {...sliderSettings}>
                  {dataContainers.map((container, idx) => (
                    <div key={idx} className="p-4 h-[650px]">
                      <h2 className="text-lg text-black mb-4">{container.title}</h2>
                      <hr className="border-gray-300 mb-1 text-xs" />
                      <container.chart
                        data={container.data}
                        onSliceClick={container.onClickName}
                      />
                      <div className="text-xs mt-3 pb-3 overflow-y-auto" style={{ maxHeight: '450px' }}>
                        <h3 className="font-semibold mb-3">Totals:</h3>
                        <hr className="border-gray-300 mb-3" />
                        {Object.entries(container.content).map(([key, val]) => (
                          <p key={key}>{`${key}: ${val}`}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
              <div className="w-3/4 bg-white gap-4 mb-4 p-4 rounded-lg shadow-md overflow-y-auto max-h-[650px]">
                <SubmittalsTable
                  submittals={displayedSubmittals}
                  onViewDetails={id => handleFilterClick('status', id)}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  };
  
  export default ACCSubmittalsPage;
  
