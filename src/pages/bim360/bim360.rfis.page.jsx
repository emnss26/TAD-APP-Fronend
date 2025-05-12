import { useEffect, useState, useRef } from "react";
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
import { RFIsGanttChart } from "../../components/rfis_page_components/rfi.gantt.chart";

import {
  fetchBIM360ProjectsData,
  fetchBIM360ProjectData,
  fetchBIM360ProjectRFI,
} from "../../pages/services/bim360.services";

const sampleQuestionsRFI = [
  "How many RFIs are open?",
  "List closed RFIs.",
  "Which RFIs have high priority?",
  "Show me RFIs answered this week.",
  "Generate a CSV report of all RFIs.",
];

const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

const BIM360RFIPage = () => {
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);

  // State variables
  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState(null);
  const [rfis, setRFIs] = useState([]);
  const [rfiTotals, setRFITotals] = useState({
    total: 0,
    open: 0,
    answered: 0,
    closed: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    open: 0,
    answered: 0,
    closed: 0,
  });
  const [priorityCounts, setPriorityCounts] = useState({
    high: 0,
    normal: 0,
    low: 0,
  });
  const [disciplineCounts, setDisciplineCounts] = useState({});
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    priority: null,
    discipline: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

  // Combined data fetch
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchBIM360ProjectsData(),
      fetchBIM360ProjectData(projectId, accountId),
      fetchBIM360ProjectRFI(projectId, accountId),
    ])
      .then(([projectsResp, projectResp, rfiResp]) => {
        setProjectsData(projectsResp);
        setProject(projectResp);
        const list = rfiResp.rfis || [];
        setRFIs(list);
        setRFITotals({
          total: list.length,
          open: list.filter((r) => r.status === "open").length,
          answered: list.filter((r) => r.status === "answered").length,
          closed: list.filter((r) => r.status === "closed").length,
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  // Compute counts
  useEffect(() => {
    const newStatus = { open: 0, answered: 0, closed: 0 };
    const newPriority = { high: 0, normal: 0, low: 0 };
    const newDiscipline = {};

    rfis.forEach((r) => {
      if (r.status === "open") newStatus.open++;
      if (r.status === "answered") newStatus.answered++;
      if (r.status === "closed") newStatus.closed++;

      const p = r.priority?.toLowerCase();
      if (p === "high") newPriority.high++;
      if (p === "normal") newPriority.normal++;
      if (p === "low") newPriority.low++;

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
    .filter((r) => !activeFilters.status || r.status === activeFilters.status)
    .filter(
      (r) =>
        !activeFilters.priority ||
        r.priority?.toLowerCase() === activeFilters.priority
    )
    .filter(
      (r) =>
        !activeFilters.discipline || r.discipline === activeFilters.discipline
    );

  const handleFilterClick = (type, val) => {
    setActiveFilters((prev) => ({
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
      title: "RFI Status Chart",
      chart: RFIsStatusChart,
      content: statusCounts,
      data: statusCounts,
      onClickName: (status) =>
        handleFilterClick("status", status.toLowerCase()),
    },
    {
      title: "RFI Priority Chart",
      chart: RFIsPriorityChart,
      content: priorityCounts,
      data: priorityCounts,
      onClickName: (pr) => handleFilterClick("priority", pr),
    },
    {
      title: "RFI Discipline Chart",
      chart: RFIsDisciplineChart,
      content: disciplineCounts,
      data: disciplineCounts,
      onClickName: (d) => handleFilterClick("discipline", d),
    },
  ];

  const toggleChat = () => {
    setIsChatOpen((o) => {
      const next = !o;
      if (next && messages.length === 0) {
        setMessages([
          { role: "assistant", content: "Hi! Ask me anything about RFIs." },
        ]);
      }
      return next;
    });
  };

  useEffect(() => {
    if (conversationRef.current)
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages]);

  const sendChat = async () => {
    if (!userMessage.trim() || isSendingMessage) return;
    setIsSendingMessage(true);
    const text = userMessage.trim();
    setMessages((m) => [...m, { role: "user", content: text }]);
    setUserMessage("");
    try {
      const res = await fetch(`${backendUrl}/ai-rfis/rfis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, accountId, projectId }),
      });
      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "No reply." },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };
  const pickSample = (q) => setUserMessage(q);

  return (
    <>
      {loading && <LoadingOverlay />}
      <BIM360PlatformprojectsHeader
        accountId={accountId}
        projectId={projectId}
      />
      <div className="flex h-screen mt-14">
        <BIM360SideBar />
        <main className="flex-1 p-2 px-4 bg-white">
          <h1 className="text-right text-xl mt-2">PROJECT RFI REPORT</h1>
          <hr className="my-4 border-t border-gray-300" />

          {/* Reset filters */}
          <div className="mb-4 text-right">
            <button
              onClick={resetFilters}
              className="btn-primary font-bold text-xs py-2 px-4 rounded mx-2"
            >
              Reset Table Filters
            </button>
            <button
              onClick={toggleChat}
              className="btn-primary text-xs font-bold py-2 px-4 rounded"
            >
              {isChatOpen ? "Show RFI Data" : "Ask AI Assistant"}
            </button>
          </div>

          {/* ────── Carousel (Lista de filtros) ────── */}
          {isChatOpen ? (
            <section className="w-full bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col max-h-[775px]">
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
                AI RFI Assistant
              </h2>
              <div
                ref={conversationRef}
                className="flex-grow overflow-y-auto border p-3 mb-4 bg-gray-50 rounded min-h-[400px] max-h-[550px]"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-3 flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <strong className="block mb-1">
                        {msg.role === "user" ? "You" : "Assistant"}
                      </strong>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isSendingMessage && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-lg bg-gray-200 text-gray-500 italic">
                      Assistant is thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestionsRFI.map((q) => (
                    <button
                      key={q}
                      onClick={() => pickSample(q)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      disabled={isSendingMessage}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={handleKey}
                  placeholder="Ask about RFIs..."
                  className="flex-grow border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isSendingMessage}
                />
                <button
                  onClick={sendChat}
                  disabled={isSendingMessage || !userMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMessage ? "..." : "Send"}
                </button>
              </div>
            </section>
          ) : (
            <>
              <div className="flex max-h-[775px]">
                <section className="w-1/4 bg-gray-50 mr-4 rounded-lg shadow-md chart-with-dots">
                  <Slider {...sliderSettings}>
                    {dataContainers.map((c) => (
                      <div
                        key={`${c.title}`}
                        className="text-xl font-bold mt-4 p-6"
                      >
                        <h2 className="text-lg mb-2">{c.title}</h2>
                        <hr className="border-gray-300 mb-1 text-xs" />

                        <c.chart
                          data={c.data}
                          onSliceClick={(v) =>
                            handleFilterClick(c.filterKey, v)
                          }
                        />
                        <div className="text-xs mt-1 h-40 overflow-y-auto">
                          <h3 className="font-semibold mb-3">Totals:</h3>
                          <hr className="border-gray-300 mb-1 text-xs" />
                          {Object.entries(c.data).map(([k, v]) => (
                            <p key={k}>{`${k}: ${v}`}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </section>

                {/* ────── Tabla RFIs ────── */}
                <section className="w-3/4 bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[775px]">
                  <RFITable rfis={displayedRFIs} onViewDetails={() => {}} />
                </section>
              </div>

              {/* ────── Diagrama de Gantt ────── */}
              <div className="mt-14 px-4 mb-8">
                <h2 className="text-xl font-semibold mb-2">Gantt RFIs</h2>
                <RFIsGanttChart rfis={displayedRFIs} />
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default BIM360RFIPage;
