import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  FaBars,
  FaHome,
  FaThLarge,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaEnvelope,
  FaCubes,
  FaCalculator,
  FaFilm,
  FaClock,
  FaClipboardCheck,
  FaProjectDiagram,
  FaDatabase,
  FaLayerGroup,
  FaMoneyCheckAlt,
  FaTools,
} from "react-icons/fa";

const ACCSideBar = () => {
  const { projectId } = useParams();
  const { accountId } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`min-h-screen lg:sticky lg:top-0  bg-[#f6f6f6] text-[#6b7474] p-4 flex flex-col relative 
        ${isCollapsed ? "w-16" : "w-1/7"} transition-all duration-300`}
    >
      <button
        onClick={toggleSidebar}
        className="mb-4 text-[#6b7474] bg-transparent hover:bg-gray-200 px-2 py-2 rounded flex items-left justify-left"
      >
        <FaBars size={10} />
      </button>

      {/* Home (ACC Projects) */}
      <Link
        to="/accprojects"
        className="mb-4 flex items-center text-[#6b7474] bg-transparent hover:text-[#0077b7] hover:bg-gray-200 p-2 rounded"
      >
        <FaHome size={10} />
        {!isCollapsed && <span className="ml-2 text-xs">Home Projects</span>}
      </Link>

      {/* Project Page */}
      <Link
        to={`/accprojects/${accountId}/${projectId}`}
        className="mb-4 flex items-center text-[#6b7474] bg-transparent hover:text-[#0077b7] hover:bg-gray-200 p-2 rounded"
      >
        <FaThLarge size={10} />
        {!isCollapsed && <span className="ml-2 text-xs">Project Page</span>}
      </Link>

      {/* Users Report */}
      <Link
        to={`/accprojects/${accountId}/${projectId}/accusers`}
        className="mb-4 flex items-center text-[#6b7474] bg-transparent hover:text-[#0077b7] hover:bg-gray-200 p-2 rounded"
      >
        <FaUsers size={10} />
        {!isCollapsed && <span className="ml-2 text-xs">Users Report</span>}
      </Link>

      {/* Issues Report */}
      <Link
        to={`/accprojects/${accountId}/${projectId}/accissues`}
        className="mb-4 flex items-center text-[#6b7474] bg-transparent hover:text-[#2ea3e3] hover:bg-gray-50 p-2 rounded"
      >
        <FaClipboardList size={10} />
        {!isCollapsed && <span className="ml-2 text-xs">Issues Report</span>}
      </Link>

      {/* RFI Report */}
      <Link
        to={`/accprojects/${accountId}/${projectId}/accrfis`}
        className="mb-4 flex items-center text-[#6b7474] bg-transparent hover:text-[#2ea3e3] hover:bg-gray-50 p-2 rounded"
      >
        <FaEnvelope size={10} />
        {!isCollapsed && <span className="ml-2 text-xs">RFI Report</span>}
      </Link>

      {/* Submittals Report */}
      <Link
        to={`/accprojects/${accountId}/${projectId}/accsubmittals`}
        className="mb-4 flex items-center text-[#6b7474] bg-transparent hover:text-[#2ea3e3] hover:bg-gray-50 p-2 rounded"
      >
        <FaFileAlt size={10} />
        {!isCollapsed && <span className="ml-2 text-xs">Submittals Report</span>}
      </Link>

    </div>
  );
};

export default ACCSideBar;
