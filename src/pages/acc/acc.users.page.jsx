import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import ACCPlatformprojectsHeader from "../../components/platform_page_components/acc.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import ACCSideBar from "../../components/platform_page_components/platform.acc.sidebar";

import {
  fechACCProjectUsers,
} from "../../pages/services/acc.services";

import CompanyUsersChart from "../../components/users_page_components/company.users.chart";
import RoleUsersChart from "../../components/users_page_components/role.users.chart";
import UsersTable from "../../components/users_page_components/users.table";

const ACCProjectUsersPage = () => {
 
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);
  const token = cookies.access_token;

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [companyCounts, setCompanyCounts] = useState({});
  const [roleCounts, setRoleCounts] = useState({});
  const [notSpecifiedCompanyCount, setNotSpecifiedCompanyCount] = useState(0);
  const [notSpecifiedRoleCount, setNotSpecifiedRoleCount] = useState(0);
  const [error, setError] = useState(null);
  
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [ usersRes] = await Promise.all([
  
          fechACCProjectUsers(projectId, token, accountId),
        ]);

        const userList = usersRes.users || [];
        setUsers(userList);
        setFilteredUsers(userList);
        setTotalUsers(userList.length);

        const companies = {};
        let unspecifiedCo = 0;
        userList.forEach(u => {
          if (u.companyName) {
            companies[u.companyName] = (companies[u.companyName] || 0) + 1;
          } else {
            unspecifiedCo++;
          }
        });
        setCompanyCounts(companies);
        setNotSpecifiedCompanyCount(unspecifiedCo);

        const rolesMap = {};
        let unspecifiedRole = 0;
        userList.forEach(u => {
          if (u.roles && u.roles.length) {
            u.roles.forEach(r => {
              rolesMap[r.name] = (rolesMap[r.name] || 0) + 1;
            });
          } else {
            unspecifiedRole++;
          }
        });
        
        setRoleCounts(
          Object.entries(rolesMap).map(([id, value]) => ({ id, value }))
        );
        setNotSpecifiedRoleCount(unspecifiedRole);
      } catch (err) {
        console.error("Error loading users page:", err);
        setError(err.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    if (token && projectId && accountId) {
      loadData();
    }
  }, [token, projectId, accountId]);

  useEffect(() => {
    let list = users;
    if (selectedCompany) {
      list = list.filter(u => u.companyName === selectedCompany);
    }
    if (selectedRole) {
      list = list.filter(u =>
        u.roles?.some(r => r.name === selectedRole)
      );
    }
    setFilteredUsers(list);
  }, [users, selectedCompany, selectedRole]);

  const handleCompanyClick = company => setSelectedCompany(company);
  const handleRoleClick = role => setSelectedRole(role);
  const resetFilters = () => {
    setSelectedCompany(null);
    setSelectedRole(null);
    setFilteredUsers(users);
  };

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <>
    {loading && <LoadingOverlay />}
      {/* Navigation Bar */}
      <ACCPlatformprojectsHeader 
      accountId={accountId} 
      projectId={projectId} 
      />

      <div className="flex min-h-screen mt-14">
        {/* Sidebar */}
        <ACCSideBar />

        {/* Main Content */}
        <div className="flex-1 p-2 px-4 bg-white">
          <h1 className="text-right text-xl text-black mt-2">
            Project Users Report
          </h1>

          <hr className="my-4 border-t border-gray-300" />

          <div className="flex flex-wrap -mx-4 mt-4">
            {/* First block: total users */}
            <div className="w-full md:w-1/5 px-4 mb-4 h-[450px]">
              <div className="h-64 w-full bg-gray-200 rounded shadow flex flex-col items-center justify-center h-[450px]">
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
              {/* <button
              onClick={exportToExcel}
              className="bg-[#2ea3e3] text-white text-xs py-2 px-4 rounded mb-4 hover:bg-[#aedb01] text-black"
            >
              Export to Excel
            </button> */}
              <button
                onClick={resetFilters}
                className="bg-[#2ea3e3] text-white text-xs py-2 px-4 rounded mb-4 hover:bg-[#aedb01] text-black"
              >
                Reset Filters
              </button>
            </div>

            <h3 className="text-left text-lg mb-2">User Schedule</h3>
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

export default ACCProjectUsersPage;
