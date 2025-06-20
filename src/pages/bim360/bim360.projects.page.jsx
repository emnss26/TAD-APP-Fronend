import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import PlatformHeader from "../../components/platform_page_components/platform.access.header";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const BIM360ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProjects = async () => {
      setLoading(true);
      const response = await fetch(`${backendUrl}/bim360/bim360projects`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { data } = await response.json();

      const accProjects = data.projects.filter(
        (project) => project.attributes.extension.data.projectType === "BIM360"
      );

      //console.log("BIM360 Projects:", accProjects);

      setProjects(accProjects);
      setLoading(false);
    };

    getProjects();
  }, []);

  const particlesInit = async (engine) => await loadSlim(engine);

  const particlesOptions = {
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      color: { value: "#2ea3e3" },
      links: {
        enable: true,
        distance: 200,
        color: "#2ea3e3",
        opacity: 0.6,
        width: 1.5,
      },
      move: { enable: true, speed: 1, outModes: { default: "bounce" } },
      size: {
        value: { min: 1, max: 4 },
        animation: { enable: true, speed: 3, minimumValue: 0.3 },
      },
      shape: { type: ["circle"] },
      number: { value: 85 },
      opacity: { value: 0.9 },
    },
    detectRetina: true,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { quantity: 4 },
      },
    },
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#ffffff] z-10">
          {loading && <LoadingOverlay />}
          {/* Partículas cubriendo todo, sin bloquear interacciones */}
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesOptions}
            className="absolute inset-0 z-0 pointer-events-none"
          />

    {/* Header */}
      <PlatformHeader className="relative z-10" />

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20">
        {/* Left */}
        <div className="w-1/2 flex items-center justify-center h-[60vh]">
          <h1 className="text-7xl font-semibold text-primary">T A D</h1>
        </div>

        {/* Right */}
        <div className="w-1/2 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Select your project
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mb-6">
            These are the projects associated with your account, please select
            one.
          </p>

          <div className="w-full max-w-4xl" style={{ height: "450px", overflowY: "auto" }}>
            {projects.length > 0 ? (
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="bg-gray-100 shadow-md rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h2 className="text-m font-semibold">
                        {project.attributes.name}
                      </h2>
                      <p>{project.attributes.description}</p>
                    </div>
                    <Link
                      to={`/bim360projects/${project.relationships.hub.data.id}/${project.id}`}
                      className="bg-[#2ea3e3] text-white text-m font-semibold px-4 py-2 rounded-md shadow hover:bg-slate-200 hover:text-black transition-colors"
                    >
                      Project Home
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No projects found.</p>
            )}
          </div>
        </div>
      </main>

     {/* Footer */}
     <Footer className="relative z-10" />
    </div>
  );
};

export default React.memo(BIM360ProjectsPage);
