import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCommentDots, FaTimes } from "react-icons/fa";
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

import CompanyUsersChart from "../../components/users_page_components/company.users.chart";
import RoleUsersChart from "../../components/users_page_components/role.users.chart";
import UsersTable from "../../components/users_page_components/users.table";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const BIM360ProjectUsersPage = () => {
  //Project Data
  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState(null);
  const { projectId } = useParams();
  const { accountId } = useParams();

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

  //IA
  const [userMessage, setUserMessage] = useState("");
  const [chatbotResponse, setChatbotResponse] = useState("");

  //ProjectData
  useEffect(() => {
    const getProject = async () => {
      const projectData = await fetchBIM360ProjectData(
        projectId,
        cookies.access_token,
        accountId
      );

      //console.log("Project Name:", projectData.name);

      setProject(projectData);
    };
    getProject();
  }, [projectId, cookies.access_token, accountId]);

  //Project Users
  useEffect(() => {
    const getProjectUsers = async () => {
      const projectUsers = await fechBIM360ProjectUsers(
        projectId,
        cookies.access_token,
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
  }, [projectId, cookies.access_token, accountId]);

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

  async function fetchAll(projectId, cookies, accountId) {
    await Promise.all([
      fetchBIM360ProjectData(projectId, cookies.access_token, accountId),
      fechBIM360ProjectUsers(projectId, cookies.access_token, accountId),
    ]);
  }

  useEffect(() => {
    setLoading(true);
    fetchAll(projectId, cookies, accountId)
      .catch(console.error) // maneja errores
      .finally(() => setLoading(false));
  }, [projectId, cookies, accountId]);

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

          <div className="flex flex-wrap -mx-4 mt-4">
            {/* First block: total users */}
            <div className="w-full md:w-1/5 px-4 mb-4 h-[450px]">
              <div className="h-64 w-full bg-gray-50 rounded shadow flex flex-col items-center justify-center h-[450px]">
                <h3 className="text-lg">Total Users</h3>
                <p className="text-7xl text-black">{totalUsers}</p>
              </div>
            </div>

            {/* Second block: Company Chart */}
            <div className="w-full md:w-2/5 px-4 mb-4 h-[450px]">
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
            <div className="w-full md:w-2/5 px-4 mb-4 h-[450px]">
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
                Reset Filters
              </button>
            </div>

            <hr className="my-2 border-t border-gray-300" />

            <UsersTable users={filteredUsers} />
          </div>
        </div>
      </div>

      {/*Footer*/}
      <Footer />
    </>
  );
};

export default BIM360ProjectUsersPage;
