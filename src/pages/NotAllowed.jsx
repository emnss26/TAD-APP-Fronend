import React from "react";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import { Header } from "../components/general_pages_components/general.pages.header";
import { Footer } from "../components/general_pages_components/general.pages.footer.jsx";

const NotAuthorizedPage = () => {
  const navigate = useNavigate();

  // Initializes the tsparticles engine with slim bundle
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  // Particle animation configuration
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

  // Render: Particle background + Unauthorized Message layout
  return (
    <div className="relative flex flex-col min-h-screen bg-background dark:bg-gray-900 text-foreground">
      {/* Background Particles (non-blocking interaction) */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Header */}
      <Header className="relative z-10" />

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col md:flex-row items-center justify-center px-4 md:px-8 py-8 mt-20 gap-6">
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center h-[60vh]">
          <h1 className="text-7xl font-semibold text-primary">T A D</h1>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Not Authorized<br />
            Please Contact the Administrator
          </h1>
        </div>
      </main>

      {/* Footer */}
      <Footer className="relative z-10" />
    </div>
  );
};

export default React.memo(NotAuthorizedPage);
