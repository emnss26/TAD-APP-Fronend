import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import useUserProfile from "../../hooks/useUserProfile";
import useLogout from "../../hooks/useLogout";
import useProjectData from "../../hooks/useProjectData";

import {
  fetchBIM360ProjectsData,
  fetchBIM360ProjectData,
} from "../../pages/services/bim360.services";

import { ProjectsDropdownMenu } from "./drop.down.menu";

const BIM360PlatformprojectsHeader = ({ accountId, projectId }) => {
  const { userProfile } = useUserProfile();
  const handleLogout = useLogout();
  const { projectsData, project } = useProjectData({
    accountId,
    projectId,
    fetchProjects: fetchBIM360ProjectsData,
    fetchProject: fetchBIM360ProjectData,
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  //console.log("Project ID Header:", projectId);
  //console.log("Account ID Header:", accountId);



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleGoPlatform = () => {
    navigate("/platform");
  };

  const handleGoAuth = () => {
    navigate("/Login");
  };

  return (
    <header className="app-header h-[65px] w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50 shadow-md">
      {/* Branding (izquierda) */}
      <div className="nav-link flex items-center gap-6 text-md">
        {/* Principal Text */}
        <Link to="/">TAD | Taller de Arquitectura Digital</Link>

        {/* Drop Down projects */}
        {projectsData?.projects?.length > 0 && (
          <ProjectsDropdownMenu
            label={project?.name || "Select a project"}
            options={projectsData.projects.map((proj) => ({
              label: proj.attributes.name,
              value: proj.id,
            }))}
            onSelect={(option) => {
              navigate(`/bim360projects/${accountId}/${option.value}`);
            }}
          />
        )}
      </div>

      {/* Contenedor derecho: nav + user profile */}
      <div className="flex items-center gap-6" ref={containerRef}>
        {/* Navegación */}
        <nav className="flex items-center space-x-6">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/services" className="nav-link">
            Services
          </Link>
        </nav>

        {/* Información de usuario y menú desplegable */}
        <div className="relative flex items-center gap-2 text-sm">
          {userProfile ? (
            <>
              <span>{userProfile.emailId}</span>
              <button
                className="focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaUser className="h-5 w-5" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-10 right-0 mt-2 bg-black border border-gray-600 rounded-md shadow-lg w-48 z-50 text-white">
                  <ul className="flex flex-col">
                    <li>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800"
                        onClick={handleGoPlatform}
                      >
                        Select Platform
                      </button>
                    </li>
                    <li>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800"
                        onClick={handleGoAuth}
                      >
                        Signin Page
                      </button>
                    </li>
                    <li>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-800"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={handleGoAuth}
              className="hover:text-gray-300 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default BIM360PlatformprojectsHeader;
