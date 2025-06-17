import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import ACCPlatformLayout from "../../components/platform_page_components/acc.platform.layout";

import submittalsSpecChart from "../../components/submittlas_page_components/submittals.spec.chart";
import submittalsStatusChart from "../../components/submittlas_page_components/submttals.status.chart";
import SubmittalsTable from "../../components/submittlas_page_components/submittals.table";
import { SubmittalsGanttChart } from "../../components/submittlas_page_components/submittals.gantt.chart";

import { fetchACCProjectSubmittals } from "../../pages/services/acc.services";
import exportToExcel from "../../utils/exportToExcel";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const sampleQuestionsSubmittals = [
  "How many Submittals are in review?",
  "List Submittals waiting for submission.",
  "What is the total number of submittals?",
  "Show me submittals due this month.",
  "Generate a CSV report of all Submittals.",
];

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

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);

  //Submittals
  useEffect(() => {
    const getProjectSubmittals = async () => {
      const projectSubmittals = await fetchACCProjectSubmittals(
        projectId,
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
  }, [projectId, accountId]);

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
      fetchACCProjectSubmittals(projectId,  accountId),
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

  const handleExportSubmittals = () => {
    const fields = [
      "identifier",
      "title",
      "specTitle",
      "stateId",
      "managerName",
      "submittedByName",
    ];

    const mapped = displayedSubmittals.map((s) => ({
      identifier: s.identifier,
      title: s.title,
      specTitle: s.specDetails?.title ?? "",
      stateId: s.stateId,
      managerName: s.managerName,
      submittedByName: s.submittedByName,
    }));

    exportToExcel(mapped, fields, `project-${projectId}-submittals.xlsx`);
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

  const toggleChatSub = () => {
    setIsChatOpen((o) => {
      const next = !o;
      if (next && messages.length === 0)
        setMessages([
          {
            role: "assistant",
            content: "Hi! Ask me anything about Submittals.",
          },
        ]);
      return next;
    });
  };

  useEffect(() => {
    if (conversationRef.current)
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages]);

  const sendChatSub = async () => {
    if (!userMessage.trim() || isSendingMessage) return;
    setIsSendingMessage(true);
    const text = userMessage.trim();
    setMessages((m) => [...m, { role: "user", content: text }]);
    setUserMessage("");
    try {
      const res = await fetch(`${backendUrl}/ai-submittals/submittals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, accountId, projectId }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "" },
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

  const handleKeySub = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatSub();
    }
  };
  const pickSampleSub = (q) => setUserMessage(q);

  return (
    <ACCPlatformLayout projectId={projectId} accountId={accountId}>
      {loading && <LoadingOverlay />}

      <div className="flex min-h-screen">
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
          <button
            onClick={handleExportSubmittals}
            className="btn-primary text-xs font-bold py-2 px-4 rounded mx-2"
          >
            Export Submittals to Excel
          </button>
          <button
            onClick={toggleChatSub}
            className="btn-primary text-xs font-bold py-2 px-4 rounded"
          >
            {isChatOpen ? "Show Submittal Data" : "Ask AI Assistant"}
            </button>
          </div>

          {/* Layout Condicional */}
          {isChatOpen ? (
            <section className="w-full bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col max-h-[775px]">
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
                AI Submittals Assistant
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
                  {sampleQuestionsSubmittals.map((q) => (
                    <button
                      key={q}
                      onClick={() => pickSampleSub(q)}
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
                  onKeyPress={handleKeySub}
                  placeholder="Ask about submittals..."
                  className="flex-grow border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isSendingMessage}
                />
                <button
                  onClick={sendChatSub}
                  disabled={isSendingMessage || !userMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMessage ? "..." : "Send"}
                </button>
              </div>
            </section>
          ) : (
            <>
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
                          {Object.entries(container.content).map(
                            ([key, val]) => (
                              <p key={key}>{`${key}: ${val}`}</p>
                            )
                          )}
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
            </>
          )}
        </div>
      </div>
    </ACCPlatformLayout>
  );
};

export default React.memo(ACCSubmittalsPage);
