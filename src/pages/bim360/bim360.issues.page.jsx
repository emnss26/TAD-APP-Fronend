import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import IssuesTable from "../../components/issues_page_components/issues.table";
import DonutChartGeneric from "../../components/issues_page_components/issues.generic.chart";

import {
    fetchBIM360ProjectData,
    fetchBIM360FederatedModel,
    fechBIM360ProjectIssues,
  } from "../../pages/services/bim360.services";

  import { simpleViewer } from "../../utils/Viewers/simple.viewer";

  const BIM360IssuesPage = () => {
    /* ---------- Router / Auth ---------- */
    const { projectId, accountId } = useParams();
    const [cookies] = useCookies(["access_token"]);
  
    /* ---------- UI State ---------- */
    const [loading, setLoading] = useState(true);
  
    /* ---------- Data State ---------- */
    const [project, setProject] = useState(null);
    const [federatedModel, setFederatedModel] = useState(null);
    const [issues, setIssues] = useState([]);
  
    /* ---------- Filter State ---------- */
    const [activeFilters, setActiveFilters] = useState({
      status: null,
      issueTypeName: null,
      // atributos personalizados llegarán dinámicamente
    });
  
    /* ---------- Helper ---------- */
    const buildCounts = (list, keyFn) => {
      const out = {};
      list.forEach((i) => {
        const k = keyFn(i);
        if (!k) return;
        out[k] = (out[k] || 0) + 1;
      });
      return out;
    };
  
    /* ---------- Load Project + Model ---------- */
    useEffect(() => {
      (async () => {
        const [proj, model] = await Promise.all([
          fetchBIM360ProjectData(projectId, cookies.access_token, accountId),
          fetchBIM360FederatedModel(projectId, cookies.access_token, accountId),
        ]);
        setProject(proj);
        setFederatedModel(model);
      })();
    }, [projectId, accountId, cookies.access_token]);
  
    /* ---------- Init Viewer once model ready ---------- */
    useEffect(() => {
      if (federatedModel) simpleViewer(federatedModel, cookies.access_token);
    }, [federatedModel, cookies.access_token]);
  
    /* ---------- Load Issues ---------- */
    useEffect(() => {
      (async () => {
        setLoading(true);
        const { issues: raw } = await fechBIM360ProjectIssues(
          projectId,
          cookies.access_token,
          accountId
        );
        setIssues(raw);
        setLoading(false);
      })();
    }, [projectId, accountId, cookies.access_token]);
  
    /* ---------- Derive counts & charts data ---------- */
    const { chartsData, customTitles } = useMemo(() => {
      if (!issues.length) return { chartsData: null, customTitles: [] };
    
      // status & type
      const status = buildCounts(issues, (i) => i.status);
      const type   = buildCounts(issues, (i) => i.issueTypeName);
    
      // custom
      const custom = {};
      issues.forEach((i) =>
        i.customAttributes?.forEach((a) => {
          if (!custom[a.title]) custom[a.title] = {};
          const key = a.readableValue || "Not specified";
          custom[a.title][key] = (custom[a.title][key] || 0) + 1;
        })
      );
    
      return { chartsData: { status, type, custom }, customTitles: Object.keys(custom) };
    }, [issues]);
  
    /* ---------- Apply filters ---------- */
    const displayedIssues = useMemo(() => {
      let list = issues;
      Object.entries(activeFilters).forEach(([key, val]) => {
        if (!val) return;
  
        if (key === "status" || key === "issueTypeName") {
          list = list.filter((i) => i[key] === val);
        } else {
          // custom attribute
          list = list.filter((i) =>
            i.customAttributes?.some(
              (a) => a.title.toLowerCase() === key && a.readableValue === val
            )
          );
        }
      });
      return list;
    }, [issues, activeFilters]);
  
    const handleFilterClick = (filterKey, value) =>
      setActiveFilters((prev) => ({ ...prev, [filterKey]: value }));
  
    const resetFilters = () => setActiveFilters({ status: null, issueTypeName: null });
  
    /* ---------- Slick settings ---------- */
    const slider = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      vertical: true,
      verticalSwiping: true,
    };
  
    /* ---------- Build carousel items ---------- */
    const dataContainers = useMemo(() => {
      if (!chartsData) return [];
  
      return [
        { title: "Issue Status", data: chartsData.status, filterKey: "status" },
        { title: "Issue Type", data: chartsData.type, filterKey: "issueTypeName" },
        ...Object.entries(chartsData.custom).map(([t, d]) => ({
          title: t,
          data: d,
          filterKey: t.toLowerCase(),
        })),
      ];
    }, [chartsData]);
  
    /* ---------- Render ---------- */
    return (
      <>
        {loading && <LoadingOverlay />}
  
        <BIM360PlatformprojectsHeader accountId={accountId} projectId={projectId} />
  
        <div className="flex min-h-screen mt-14">
          <BIM360SideBar />
  
          <main className="flex-1 p-2 px-4 bg-white">
            <h1 className="text-right text-xl mt-2">Issues Report</h1>
            <hr className="my-4 border-t border-gray-300" />
  
            <div className="mb-4 text-right">
              <button
                onClick={resetFilters}
                className="bg-[#2ea3e3] text-white text-xs py-2 px-4 rounded mx-2 hover:bg-[#aedb01] text-black"
              >
                Reset Table Filters
              </button>
            </div>
  
            <div className="flex">
              {/* ────── Carousel ────── */}
              <section className="w-1/4 bg-gray-50 mr-4 rounded-lg shadow-md">
                <Slider {...slider}>
                  {dataContainers.map((c) => (
                    <div key={c.title} className="p-4">
                      <h2 className="text-lg mb-2">{c.title}</h2>
                      <DonutChartGeneric
                        counts={c.data}
                        onSliceClick={(v) => handleFilterClick(c.filterKey, v)}
                      />
                      <div className="text-xs mt-3 h-40 overflow-y-auto">
                        {Object.entries(c.data).map(([k, v]) => (
                          <p key={k}>{`${k}: ${v}`}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </Slider>
              </section>
  
              {/* ────── Table ────── */}
              <section className="w-3/4 bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[650px]">
                <IssuesTable issues={displayedIssues}
                customColumns={customTitles}
                 />
              </section>
            </div>
          </main>
        </div>
  
        <Footer />
      </>
    );
  };
  
  export default BIM360IssuesPage;
  
