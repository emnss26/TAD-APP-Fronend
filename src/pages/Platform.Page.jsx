import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import PlatformHeader from "../components/platform_page_components/platform.access.header.jsx";
import { Footer } from "../components/general_pages_components/general.pages.footer.jsx";

const PlatformPage = () => {
  const [cookies, setCookie] = useCookies(["access_token"]);
  const navigate = useNavigate();
  const { search } = useLocation();


  // Redirect handlers for BIM 360 and ACC
  const goToBim360 = () => navigate("/bim360projects");
  const goToAcc = () => navigate("/accprojects");

  // Initialize tsparticles engine
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  // Particle configuration
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
      move: {
        enable: true,
        speed: 1,
        outModes: { default: "bounce" },
      },
      size: {
        value: { min: 1, max: 4 },
        animation: {
          enable: true,
          speed: 3,
          minimumValue: 0.3,
        },
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

  // Render: Page layout with platform selector and particle background
  return (
    <div className="relative flex flex-col min-h-screen bg-background dark:bg-gray-900 text-foreground z-10">
      {/* Background Particles (non-blocking interaction) */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Header */}
      <PlatformHeader className="relative z-10" />

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col md:flex-row items-center justify-center px-4 md:px-8 py-8 mt-20 gap-6">
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center h-[60vh]">
          <h1 className="text-7xl font-semibold text-primary">T A D</h1>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            TAD APP | Select Your Platform
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mb-6">
            Select your platform to access your projects and tools. You can choose between BIM 360 and Autodesk Construction Cloud (ACC).
          </p>

          <div className="flex gap-x-4">
            <button
              className="btn-primary font-medium px-12 py-3 rounded-md shadow transition-colors"
              onClick={goToBim360}
            >
              BIM 360
            </button>
            <button
              className="btn-primary font-medium px-12 py-3 rounded-md shadow transition-colors"
              onClick={goToAcc}
            >
              ACC
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer className="relative z-10" />
    </div>
  );
};

export default React.memo(PlatformPage);
