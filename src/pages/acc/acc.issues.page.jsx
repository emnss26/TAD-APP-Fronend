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

import IssuesTable from "../../components/issues_page_components/issues.table";
import { IssuesGanttChart } from "../../components/issues_page_components/issues.gantt.chart";
import DonutChartGeneric from "../../components/issues_page_components/issues.generic.chart";

import { fechACCProjectIssues } from "../../pages/services/acc.services";

const ACCIssuesPage = () => {
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);
  const token = cookies.access_token;

  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);

  const [activeFilters, setActiveFilters] = useState({
    status: null,
    issueTypeName: null,
    customAttribute: null,
  });

  const buildCounts = (list, keyFn) => {
    const out = {};
    list.forEach((i) => {
      const k = keyFn(i);
      if (!k) return;
      out[k] = (out[k] || 0) + 1;
    });
    return out;
  };

  useEffect(() => {
    const loadIssues = async () => {
      setLoading(true);
      try {
        const { issues: rawIssues } = await fechACCProjectIssues(
          projectId,
          token,
          accountId
        );
        setIssues(rawIssues || []);
      } catch (err) {
        console.error("Error cargando issues:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token && projectId && accountId) {
      loadIssues();
    }
  }, [projectId, token, accountId]);

  const { chartsData, customTitles } = useMemo(() => {
    if (!issues.length) return { chartsData: null, customTitles: [] };

    const status = buildCounts(issues, (i) => i.status);
    const type = buildCounts(issues, (i) => i.issueTypeName);

    const custom = {};
    issues.forEach((i) =>
      i.customAttributes?.forEach((a) => {
        if (!custom[a.title]) custom[a.title] = {};
        const key = a.readableValue || "Not specified";
        custom[a.title][key] = (custom[a.title][key] || 0) + 1;
      })
    );

    return {
      chartsData: { status, type, custom },
      customTitles: Object.keys(custom),
    };
  }, [issues]);

  const displayedIssues = useMemo(() => {
    let list = issues;
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (!val) return;
      if (key === "status" || key === "issueTypeName") {
        list = list.filter((i) => i[key] === val);
      } else {
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

  const resetFilters = () =>
    setActiveFilters({ status: null, issueTypeName: null });

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
  };

  const dataContainers = useMemo(() => {
    if (!chartsData) return [];
    return [
      { title: "Issue Status", data: chartsData.status, filterKey: "status" },
      {
        title: "Issue Type",
        data: chartsData.type,
        filterKey: "issueTypeName",
      },
      ...Object.entries(chartsData.custom).map(([title, data]) => ({
        title,
        data,
        filterKey: title.toLowerCase(),
      })),
    ];
  }, [chartsData]);

  return (
    <>
      {loading && <LoadingOverlay />}

      <ACCPlatformprojectsHeader 
      accountId={accountId} 
      projectId={projectId} 
      />

      <div className="flex min-h-screen mt-14">
        <ACCSideBar />
        
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

          {/*Carousel */}
          <div className="flex max-h-[775px]">
            <section className="w-1/4 bg-white mr-4 rounded-lg shadow-md chart-with-dots">
              <Slider {...sliderSettings}>
                {dataContainers.map((c) => (
                  <div
                    key={`${c.title} Chart`}
                    className="text-xl font-bold mt-4 p-6"
                  >
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

            {/* Table */}
            <section className="w-3/4 bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[775px]">
              <IssuesTable
                issues={displayedIssues}
                customColumns={customTitles}
              />
            </section>
          </div>

          {/* Gantt */}
          <div className="mt-14 px-4 mb-8">
            {" "}
            <h2 className="text-xl font-semibold mb-2">Gantt Issues</h2>
            <IssuesGanttChart issues={displayedIssues} />
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};
export default ACCIssuesPage;
