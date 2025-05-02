// npm install react-tsparticles tsparticles-slim

import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import PlatformHeader from "../components/platform_page_components/platform.access.header.jsx";
import { Footer } from "../components/general_pages_components/general.pages.footer.jsx";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const PlatformPage = () => {
  const [cookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const goToBim360 = () => navigate("/bim360projects");
  const goToAcc = () => navigate("/accprojects");

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
      {/* Partículas cubriendo todo, sin bloquear interacciones */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Header */}
      <PlatformHeader className="relative z-10" />

      {/* Main */}
      <main className="relative z-10 flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20">
        {/* Left */}
        <div className="w-1/2 flex items-center justify-center h-[60vh]">
          <h1 className="text-7xl font-semibold text-primary">T A D</h1>
        </div>

        {/* Right */}
        <div className="w-1/2 flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            TAD APP | Select Your Platform
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mb-6">
            Select your platform to access your projects and tools. You can
            choose between BIM 360 and Autodesk Construction Cloud (ACC).
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

export default PlatformPage;
