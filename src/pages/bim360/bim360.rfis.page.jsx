import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import RFIsStatusChart from "../../components/rfis_page_components/rfis.status.chart";
import RFIsPriorityChart from "../../components/rfis_page_components/rfis.priority.chart";
import RFIsDisciplineChart from "../../components/rfis_page_components/rfis.discipline.chart";
import RFITable from "../../components/rfis_page_components/rfi.table";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import {
    fetchBIM360ProjectsData,
    fetchBIM360ProjectData,
    fetchBIM360ProjectRFI,
  } from "../../pages/services/bim360.services";

  const BIM360RFIPage = () => {
    const { projectId, accountId } = useParams();
    const [cookies] = useCookies(["access_token"]);
  
    // State variables
    const [projectsData, setProjectsData] = useState(null);
    const [project, setProject] = useState(null);
    const [rfis, setRFIs] = useState([]);
    const [rfiTotals, setRFITotals] = useState({ total: 0, open: 0, answered: 0, closed: 0 });
    const [statusCounts, setStatusCounts] = useState({ open: 0, answered: 0, closed: 0 });
    const [priorityCounts, setPriorityCounts] = useState({ high: 0, normal: 0, low: 0 });
    const [disciplineCounts, setDisciplineCounts] = useState({});
    const [activeFilters, setActiveFilters] = useState({ status: null, priority: null, discipline: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    // Combined data fetch
    useEffect(() => {
      setLoading(true);
      setError(null);
  
      Promise.all([
        fetchBIM360ProjectsData(cookies.access_token),
        fetchBIM360ProjectData(projectId, cookies.access_token, accountId),
        fetchBIM360ProjectRFI(projectId, cookies.access_token, accountId),
      ])
        .then(([projectsResp, projectResp, rfiResp]) => {
          setProjectsData(projectsResp);
          setProject(projectResp);
          const list = rfiResp.rfis || [];
          setRFIs(list);
          setRFITotals({
            total: list.length,
            open: list.filter(r => r.status === 'open').length,
            answered: list.filter(r => r.status === 'answered').length,
            closed: list.filter(r => r.status === 'closed').length,
          });
        })
        .catch(err => {
          console.error(err);
          setError(err);
        })
        .finally(() => setLoading(false));
    }, [projectId, accountId, cookies.access_token]);
  
    // Compute counts
    useEffect(() => {
      const newStatus = { open: 0, answered: 0, closed: 0 };
      const newPriority = { high: 0, normal: 0, low: 0 };
      const newDiscipline = {};
  
      rfis.forEach(r => {
        if (r.status === 'open') newStatus.open++;
        if (r.status === 'answered') newStatus.answered++;
        if (r.status === 'closed') newStatus.closed++;
  
        const p = r.priority?.toLowerCase();
        if (p === 'high') newPriority.high++;
        if (p === 'normal') newPriority.normal++;
        if (p === 'low') newPriority.low++;
  
        if (r.discipline) {
          newDiscipline[r.discipline] = (newDiscipline[r.discipline] || 0) + 1;
        }
      });
  
      setStatusCounts(newStatus);
      setPriorityCounts(newPriority);
      setDisciplineCounts(newDiscipline);
    }, [rfis]);
  
    // Filtered RFIs
    const displayedRFIs = rfis
      .filter(r => !activeFilters.status || r.status === activeFilters.status)
      .filter(r => !activeFilters.priority || r.priority?.toLowerCase() === activeFilters.priority)
      .filter(r => !activeFilters.discipline || r.discipline === activeFilters.discipline);
  
    const handleFilterClick = (type, val) => {
      setActiveFilters(prev => ({
        ...prev,
        [type]: prev[type] === val ? null : val,
      }));
    };
  
    const resetFilters = () => {
      setActiveFilters({ status: null, priority: null, discipline: null });
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
        title: 'RFI Status Chart',
        chart: RFIsStatusChart,
        content: statusCounts,
        data: statusCounts,
        onClickName: status => handleFilterClick('status', status.toLowerCase()),
      },
      {
        title: 'RFI Priority Chart',
        chart: RFIsPriorityChart,
        content: priorityCounts,
        data: priorityCounts,
        onClickName: pr => handleFilterClick('priority', pr),
      },
      {
        title: 'RFI Discipline Chart',
        chart: RFIsDisciplineChart,
        content: disciplineCounts,
        data: disciplineCounts,
        onClickName: d => handleFilterClick('discipline', d),
      },
    ];

    return (
        <>
          {loading && <LoadingOverlay />}      
          <BIM360PlatformprojectsHeader accountId={accountId} projectId={projectId} />
          <div className="flex h-screen mt-14">
          <BIM360SideBar />
            <div className="flex-1 p-2 px-4 bg-white">
              <h1 className="text-right text-xl text-black mt-2">RFI Report</h1>
            
            <hr className="my-4 border-t border-gray-300" />
    
            <div className="mb-4 text-right">
              <button onClick={resetFilters} className="bg-[#2ea3e3] text-white text-xs py-2 px-4 rounded mb-4 mx-2 hover:bg-[#aedb01] text-black">
                Reset Table Filters
              </button>
            </div>
    
            <div className="flex flex-1 p-2 px-4 bg-white">
              <div className="w-1/4 bg-gray-50 gap-4 mb-4 rounded-lg shadow-md mr-4">
                <Slider {...sliderSettings}>
                  {dataContainers.map((c, i) => (
                    <div key={i} className="p-4 h-[650px]">
                      <h2 className="text-lg text-black mb-4">{c.title}</h2>
                      <hr className="border-gray-300 mb-1 text-xs" />
                      <c.chart data={c.data} onSliceClick={c.onClickName} />
                      <div className="text-xs mt-3 pb-3 overflow-y-auto" style={{ maxHeight: '450px' }}>
                        <h3 className="font-semibold mb-3">Totals:</h3>
                        <hr className="border-gray-300 mb-3" />
                        {Object.entries(c.content).map(([k, v]) => (
                          <p key={k}>{`${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
                  
                {/* RFI Table */}
              <div className="w-3/4 bg-white gap-4 mb-4 p-4 rounded-lg shadow-md overflow-y-auto max-h-[650px]">
                <RFITable rfis={displayedRFIs} onViewDetails={() => {}} />
              </div>
              </div>
            </div>
          </div>
          <Footer />
        </>
      );
    };
    
    export default BIM360RFIPage;
    