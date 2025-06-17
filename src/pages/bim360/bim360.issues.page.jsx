import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import BIM360PlatformLayout from "../../components/platform_page_components/bim360.platform.layout";

import IssuesTable from "../../components/issues_page_components/issues.table";
import { IssuesGanttChart } from "../../components/issues_page_components/issues.gantt.chart";
import DonutChartGeneric from "../../components/issues_page_components/issues.generic.chart";

import { fechBIM360ProjectIssues } from "../../pages/services/bim360.services";
import exportToExcel from "../../utils/exportToExcel";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const sampleQuestions = [
  "How many open issues exist in the project?",
  "List all issues that are overdue.",
  "What is the percentage of open vs closed issues?",
  "Excel report assigned to ...., status closed.",
  "Which issues were created last week?",
  "What is the average time to close an issue?",
  "Which issues have a description containing 'puertas'?",
  "Tell me which 5 issues have been open the longest.",
  "Generate a CSV report for all issues.",
  "What is the due date of issue ...?",
  "Show me issues created by ......",
  "Excel report created by Michael Smith, status open.",
];

const BIM360IssuesPage = () => {
  /* ---------- Router / Auth ---------- */
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);

  /* ---------- UI State ---------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- Data State ---------- */
  const [issues, setIssues] = useState([]);

  /* ---------- Filter State ---------- */
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    issueTypeName: null,
  });

  /* ---------- Chat State (Ya lo tenías) ---------- */
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]); 
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null); 

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

  /* ---------- Data Fetching (Sin cambios) ---------- */
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fechBIM360ProjectIssues(projectId, accountId),
    ])
      .then(([issuesResp]) => {
        setIssues(issuesResp.issues || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  /* ---------- Derive counts & charts data ---------- */
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

  /* ---------- Apply filters ---------- */
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

  /* ---------- Filter Handlers ---------- */
  const handleFilterClick = (filterKey, value) =>
    setActiveFilters((prev) => ({ ...prev, [filterKey]: value }));

  const resetFilters = () =>
    setActiveFilters({ status: null, issueTypeName: null });

  const handleExportIssues = () => {
    const fields = [
      "displayId",
      "title",
      "description",
      "status",
      "createdAt",
      "dueDate",
      "updatedAt",
      "assignedTo",
    ];
    exportToExcel(displayedIssues, fields, `project-${projectId}-issues.xlsx`);
  };

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
      { 
        title: "Issue Status Chart",
        data: chartsData.status, 
        filterKey: "status" 
      },
      {
        title: "Issue Type Chart ",
        data: chartsData.type,
        filterKey: "issueTypeName",
      },
      ...Object.entries(chartsData.custom).map(([t, d]) => ({
        title: t,
        data: d,
        filterKey: t.toLowerCase(),
      })),
    ];
  }, [chartsData]);

    /* ---------- Chat Handlers ---------- */
    useEffect(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }
    }, [messages]); 
  
    const toggleChat = () => {
      setIsChatOpen((prevOpen) => {
        const nextOpen = !prevOpen;
        if (nextOpen && messages.length === 0) {
          setMessages([
            {
              role: "assistant",
              content: "Hi! Ask me anything about the project issues.", 
            }
          ]);
        }
        return nextOpen;
      });
    };
  
    const handleSendMessage = async () => {
      const text = userMessage.trim();
      if (!text || isSendingMessage) return;
  
      setIsSendingMessage(true);
      const currentMessages = [...messages, { role: "user", content: text }];
      setMessages(currentMessages); 
      setUserMessage(""); 
  
      try {
        const res = await fetch(`${backendUrl}/ai-issues/issues`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, accountId, projectId }),
        });
  
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Server error response" }));
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }
  
        const data = await res.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: data.reply || "Received empty reply." }, // Muestra la respuesta del asistente
        ]);
  
      } catch (err) {
          console.error("Error sending message:", err);
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: `Sorry, I encountered an error: ${err.message}` }, // Muestra el error en el chat
        ]);
      } finally {
        setIsSendingMessage(false); 
      }
    };
  
      const handleKeyPress = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            handleSendMessage();
          }
        };
  
      const handleSampleQuestionClick = (question) => {
          setUserMessage(question);
        };
  

  /* ---------- Render ---------- */
  return (
    <BIM360PlatformLayout projectId={projectId} accountId={accountId}>
      {loading && <LoadingOverlay />}

      <div className="flex min-h-screen">

        <main className="flex-1 p-2 px-4 bg-white">
          <h1 className="text-right text-xl mt-2">PROJECT ISSUES REPORT</h1>
          <hr className="my-4 border-t border-gray-300" />

          {/* ---------- Botones de Control: Reset y Toggle Chat ---------- */}
          <div className="mb-4 text-right space-x-2">
            {/* Botón Reset Filters (solo visible si el chat NO está abierto) */}
          {!isChatOpen && (
                <button
                    onClick={resetFilters}
                    className="btn-primary text-xs font-bold py-2 px-4 rounded" // Estilo secundario
                >
                    Reset Table Filters
                </button>
            )}
            {!isChatOpen && (
                <button
                    onClick={handleExportIssues}
                    className="btn-primary text-xs font-bold py-2 px-4 rounded"
                >
                    Export Issues to Excel
                </button>
            )}
            {/* Botón para Abrir/Cerrar Chat */}
            <button
              onClick={toggleChat}
              className="btn-primary text-xs font-bold py-2 px-4 rounded" // Estilo primario
            >
              {isChatOpen ? "Show Issues Data" : "Ask AI Assistant"}
            </button>
          </div>

          {/* ---------- Contenido Principal: Datos o Chat ---------- */}
          {isChatOpen ? (
            /* ───── Sección del Chat AI ───── */
            <section className="w-full bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col max-h-[775px]">
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">AI Issues Assistant</h2>

              {/* Historial de Conversación */}
              <div ref={conversationRef} className="flex-grow overflow-y-auto border p-3 mb-4 bg-gray-50 rounded min-h-[400px] max-h-[550px]">
                {messages.map((msg, index) => (
                  <div key={index} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}
                      style={{ maxWidth: '80%', whiteSpace: 'pre-wrap' }} // pre-wrap respeta saltos de línea
                    >
                      <strong className="block mb-1">{msg.role === 'user' ? 'You' : 'Assistant'}</strong>
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

              {/* Preguntas de Ejemplo */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.slice(0, 4).map((q) => ( // Mostrar algunas sugerencias
                    <button
                      key={q}
                      onClick={() => handleSampleQuestionClick(q)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition duration-150 ease-in-out"
                      disabled={isSendingMessage}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Área de Input */}
              <div className="flex items-end gap-2">
                <textarea
                  id="chat-input" // Añadido id si quieres enfocarlo
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about issues..."
                  className="flex-grow border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2} // Empezar con 2 filas, se ajustará si es necesario con CSS o JS
                  disabled={isSendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !userMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                  {isSendingMessage ? "..." : "Send"}
                </button>
              </div>
            </section>

          ) : (
            /* ───── Sección de Datos (Gráficos, Tabla, Gantt) ───── */
            <>
              {/* Carousel (Lista de filtros) y Tabla */}
              {chartsData && ( // Solo mostrar si hay datos para los gráficos
                <div className="flex max-h-[775px] mb-8">
                  <section className="w-1/4 bg-gray-50 mr-4 rounded-lg shadow-md chart-with-dots">
                    <Slider {...slider}>
                      {dataContainers.map((c) => (
                        <div
                          key={`${c.title}`}
                          className="text-xl font-bold mt-4 p-6"
                        >
                          <h2 className="text-lg mb-2">{c.title}</h2>
                          <hr className="border-gray-300 mb-1 text-xs" />
                          <DonutChartGeneric
                            counts={c.data}
                            onSliceClick={(v) => handleFilterClick(c.filterKey, v)}
                          />
                          <div className="text-xs mt-1 h-40 overflow-y-auto">
                            <h3 className="font-semibold mb-1">Totals:</h3>
                            <hr className="border-gray-300 mb-1 text-xs" />
                            {Object.entries(c.data).map(([k, v]) => (
                              <p key={k}>{`${k}: ${v}`}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </section>

                  {/* Tabla */}
                  <section className="w-3/4 bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[775px]">
                    <IssuesTable
                      issues={displayedIssues}
                      customColumns={customTitles}
                    />
                  </section>
                </div>
              )}
               {/* Mensaje si no hay datos */}
               {!chartsData && !loading && <p className="text-center text-gray-500 my-10">No issue data available to display charts or table.</p>}

              {/* Diagrama de Gantt (solo si hay issues) */}
              {displayedIssues.length > 0 && (
                  <div className="mt-8 px-4 mb-8">
                      <h2 className="text-xl font-semibold mb-4">Issues Timeline (Gantt)</h2>
                      <IssuesGanttChart issues={displayedIssues} />
                  </div>
              )}
               {displayedIssues.length === 0 && !loading && <p className="text-center text-gray-500 my-10">No issues match the current filters for the Gantt chart.</p>}
            </>
          )}
        </main>
      </div>

    </BIM360PlatformLayout>
  );
};

export default React.memo(BIM360IssuesPage);
