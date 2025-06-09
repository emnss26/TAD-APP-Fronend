import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import { utils, writeFile } from "xlsx";

import {
  fetchBIM360ProjectData,
  fechBIM360ProjectUsers,
} from "../../pages/services/bim360.services";

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M3.105 3.105a.75.75 0 01.814-.102l14.04 7.02a.75.75 0 010 1.34l-14.04 7.02a.75.75 0 01-.814-.102l-.935-.936a.75.75 0 01.028-1.038L11.8 10 2.2 4.988a.75.75 0 01-.028-1.038l.935-.935z" />
  </svg>
);

import CompanyUsersChart from "../../components/users_page_components/company.users.chart";
import RoleUsersChart from "../../components/users_page_components/role.users.chart";
import UsersTable from "../../components/users_page_components/users.table";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const sampleQuestions = [
  "How many users are there in total?",
  "What is the status of user example@email.com?",
  "Which users are from 'Example Company'?",
  "List users with the 'Admin' role.",
];

const BIM360ProjectUsersPage = () => {
  //Project Data
  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState(null);
  const { projectId, accountId } = useParams();

  //User Data
  const [users, setProjectUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [companyCounts, setCompanyCounts] = useState({});
  const [roleCounts, setRoleCounts] = useState({});
  const [notSpecifiedCompanyCount, setNotSpecifiedCompanyCount] = useState(0);
  const [notSpecifiedRoleCount, setNotSpecifiedRoleCount] = useState(0);

  //General
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [cookies] = useCookies(["access_token"]);
  const [loading, setLoading] = useState(true);

  ///IA
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const conversationRef = useRef(null);
  const [chatbotResponse, setChatbotResponse] = useState("");

  //ProjectData
  useEffect(() => {
    const getProject = async () => {
      const projectData = await fetchBIM360ProjectData(
        projectId,
        accountId
      );

      //console.log("Project Name:", projectData.name);

      setProject(projectData);
    };
    getProject();
  }, [projectId, accountId]);

  //Project Users
  useEffect(() => {
    const getProjectUsers = async () => {
      const projectUsers = await fechBIM360ProjectUsers(
        projectId,
        accountId
      );

      setProjectUsers(projectUsers.users);

      const companies = {};
      const roles = {};
      let total = 0;
      let notSpecifiedCompany = 0;
      let notSpecifiedRole = 0;

      projectUsers.users.forEach((user) => {
        total++;

        if (user.companyName) {
          companies[user.companyName] = (companies[user.companyName] || 0) + 1;
        } else {
          notSpecifiedCompany++;
        }

        if (user.roles && user.roles.length > 0) {
          user.roles.forEach((role) => {
            roles[role.name] = (roles[role.name] || 0) + 1;
          });
        } else {
          notSpecifiedRole++;
        }
      });

      const roleCountsArray = Object.entries(roles).map(([name, count]) => ({
        id: name,
        value: count,
      }));

      setCompanyCounts(companies);
      setRoleCounts(roleCountsArray);
      setNotSpecifiedCompanyCount(notSpecifiedCompany);
      setNotSpecifiedRoleCount(notSpecifiedRole);
      setTotalUsers(total);
    };
    getProjectUsers();
  }, [projectId, accountId]);

  useEffect(() => {
    let filtered = users;

    if (selectedCompany) {
      filtered = filtered.filter(
        (user) => user.companyName === selectedCompany
      );
    }

    if (selectedRole) {
      filtered = filtered.filter((user) =>
        user.roles.some((role) => role.name === selectedRole)
      );
    }

    setFilteredUsers(filtered);
  }, [users, selectedCompany, selectedRole]);

  // Handle role click
  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  // Handle company click
  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
  };

  // Reset filters
  const resetFilters = () => {
    setFilteredUsers(users);
    setSelectedCompany(null);
    setSelectedRole(null);
  };

  async function fetchAll(projectId,  accountId) {
    await Promise.all([
      fetchBIM360ProjectData(projectId, accountId),
      fechBIM360ProjectUsers(projectId, accountId),
    ]);
  }

  useEffect(() => {
    setLoading(true);
    fetchAll(projectId, accountId)
      .catch(console.error) // maneja errores
      .finally(() => setLoading(false));
  }, [projectId, accountId]);

  const exportToExcel = (data, filename = "export.xlsx") => {
    // Sólo estos campos
    const fields = [
      "email",
      "name",
      "firstName",
      "lastName",
      "country",
      "jobTitle",
      "companyName",
      "status",
    ];

    const payload = data.map((user) => {
      const row = {};
      fields.forEach((f) => {
        row[f] = user[f] ?? "";
      });
      return row;
    });

    const ws = utils.json_to_sheet(payload, { header: fields });
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Users");
    writeFile(wb, filename);
  };

  const handleExportUsers = () => {
      exportToExcel(filteredUsers, `project-${projectId}-users.xlsx`);
    };
  
    const handleSampleQuestionClick = (question) => {
      setUserMessage(question);
    };
  
    //Conversation Ref
    useEffect(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }
    }, [messages]);
  
    const toggleChat = () => {
      setIsChatOpen((o) => {
        if (!o && messages.length === 0) {
          setMessages([
            {
              role: "assistant",
              content: "Ask me anything about the project users!",
            },
          ]);
        }
        return !o;
      });
    };
  
    const handleSendMessage = async () => {
      const text = userMessage.trim();
      if (!text || isSendingMessage) return;
      setIsSendingMessage(true);
      setMessages((m) => [...m, { role: "user", content: text }]);
      setUserMessage("");
      try {
        const res = await fetch(`${backendUrl}/ai-users/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, accountId, projectId }),
        });
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Error: ${err.message}` },
        ]);
      } finally {
        setIsSendingMessage(false);
      }
    };
  
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

  return (
    <>
      {loading && <LoadingOverlay />}
      {/* Navigation Bar */}
      <BIM360PlatformprojectsHeader
        accountId={accountId}
        projectId={projectId}
      />

      <div className="flex min-h-screen mt-14">
        {/* Sidebar */}
        <BIM360SideBar />

        {/* Main Content */}
        <div className="flex-1 p-2 px-4 bg-white">
          <h1 className="text-right text-xl text-black mt-2">
            PROJECT USERS REPORT
          </h1>

          <hr className="my-4 border-t border-gray-300" />

          {/* Firs Block charts*/}
          <div className="flex flex-wrap -mx-4 mt-4">
            {/* First block: total users */}
            <div className="w-full md:w-1/5 px-4 mb-4 h-[350px]">
              <div className="h-64 w-full bg-gray-50 rounded shadow flex flex-col items-center justify-center h-[350px]">
                <h3 className="text-lg">Total Users</h3>
                <p className="text-6xl font-bold text-blue-600 mt-2">{totalUsers}</p>
              </div>
            </div>

            {/* Second block: Company Chart */}
            <div className="w-full md:w-2/5 px-4 mb-4 h-[350px]">
              <div className="h-full bg-white rounded shadow p-4">
                <h3 className="text-lg mb-2">Company Chart</h3>
                <hr className="my-4 border-1 borde1-gray-300" />
                <CompanyUsersChart
                  companyCounts={companyCounts}
                  onCompanyClick={handleCompanyClick}
                />
              </div>
            </div>

            {/* Third block: Role Chart */}
            <div className="w-full md:w-2/5 px-4 mb-4 h-[350px]">
              <div className="h-full bg-white rounded shadow p-4">
                <h3 className="text-lg mb-2">Role Chart</h3>
                <hr className="my-4 border-1 borde1-gray-300" />
                <RoleUsersChart
                  roleCounts={roleCounts}
                  onRoleClick={handleRoleClick}
                />
              </div>
            </div>
          </div>

          <div className="w-full mt-4">
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleExportUsers}
                className="btn-primary text-xs font-bold py-2 px-4 rounded mb-4 "
              >
                Export Users to Excel
              </button>
              <button
                onClick={resetFilters}
                className="btn-primary text-xs font-bold py-2 px-4 rounded mb-4 "
              >
                Reset Chart Filters
              </button>
              <button
                onClick={toggleChat}
                className="btn-primary text-xs font-bold py-2 px-4 rounded mb-4"
              >
                {isChatOpen ? "Show Users Table" : "Ask AI Assistant"}
              </button>
            </div>

            <hr className="my-2 border-t border-gray-300" />

            {isChatOpen ? (
              // *** ÁREA DEL CHAT MEJORADA ***
              <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50"> {/* Contenedor del chat */}

                {/* 1. Conversation Area */}
                <div
                  ref={conversationRef}
                  className="p-3 bg-white border rounded h-72 overflow-y-auto shadow-inner mb-4" // Más altura, margen inferior
                >
                  {messages.map((m, i) => (
                    <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`p-2.5 rounded-lg max-w-[85%] text-sm shadow-sm ${ // Padding y sombra sutil
                          m.role === 'user'
                            ? 'bg-blue-500 text-white' // Mensaje de usuario más destacado
                            : 'bg-gray-200 text-gray-800' // Mensaje asistente
                          } ${m.content.startsWith('Error:') ? 'bg-red-100 text-red-700 border border-red-300' : ''}` // Estilo de error más claro
                        }
                      >
                        <strong className={`block text-xs mb-1 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {m.role === 'user' ? 'You' : 'Assistant'}:
                        </strong>
                        <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                      </div>
                    </div>
                  ))}
                  {/* Typing Indicator */}
                  {isSendingMessage && messages[messages.length - 1]?.role === 'user' && ( // Mostrar solo si el último fue user
                     <div className="flex justify-start mt-2">
                       <div className="p-2 rounded-lg bg-gray-200 text-gray-500 text-sm italic animate-pulse"> {/* Animación sutil */}
                         Assistant is thinking...
                       </div>
                     </div>
                  )}
                </div>

                {/* 2. Input Area con Botón Integrado */}
                <div className="flex items-center space-x-2">
                   <textarea
                     id="chat-textarea"
                     className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                     rows={2} // Menos filas por defecto
                     placeholder="Type your question here..."
                     value={userMessage}
                     onChange={(e) => setUserMessage(e.target.value)}
                     onKeyPress={handleKeyPress}
                     disabled={isSendingMessage}
                   />
                   <button
                     onClick={handleSendMessage}
                     disabled={!userMessage.trim() || isSendingMessage}
                     className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <SendIcon />
                   </button>
                 </div>

                {/* 3. Sample Questions Fijas */}
                 <div className="mt-4 pt-4 border-t border-gray-200">
                   <p className="text-sm font-medium text-gray-600 mb-2">Need inspiration? Try asking:</p>
                   <div className="flex flex-wrap gap-2">
                     {sampleQuestions.map((q, i) => (
                       <button
                         key={i}
                         onClick={() => handleSampleQuestionClick(q)}
                         className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                       >
                         {q}
                       </button>
                     ))}
                   </div>
                 </div>

              </div>
            ) : (
              // Mostrar la tabla si el chat no está abierto
              <UsersTable users={filteredUsers} />
            )}
          </div>
        </div>
      </div>

      {/*Footer*/}
      <Footer />
    </>
  );
};

export default BIM360ProjectUsersPage;
