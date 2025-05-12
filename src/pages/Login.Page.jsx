import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import { Header } from "../components/general_pages_components/general.pages.header";
import { Footer } from "../components/general_pages_components/general.pages.footer.jsx";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";
const clientId = import.meta.env.VITE_CLIENT_ID;

const LoginPage = () => {
  const [cookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const getCsrfToken = async () => {
    try {
      const res = await fetch(`${backendUrl}/csrf-token`, {
        credentials: "include",
      });
      const { csrfToken } = await res.json();
      return csrfToken;
    } catch (error) {
      console.error("Failed to fetch CSRF token", error);
      return null;
    }
  };

  // Login function
  const login = () => {
    const options = {
      client_id: clientId,
      redirect_uri: `${backendUrl}/auth/three-legged`,
      scope: "data:read data:write data:create account:read",
      response_type: "code",
    };

    const url = `https://developer.api.autodesk.com/authentication/v2/authorize?response_type=${options.response_type}&client_id=${options.client_id}&redirect_uri=${options.redirect_uri}&scope=${options.scope}`;
    window.location.href = url;
  };

  // Logout function
  const logout = async () => {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) return;

    try {
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Particles configuration
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

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

  return (
    <div className="relative flex flex-col min-h-screen bg-white z-10">
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
      <main className="relative z-10 flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20">
        {/* Left Side */}
        <div className="w-1/2 flex items-center justify-center h-[60vh]">
          <h1 className="text-7xl font-semibold text-primary">T A D</h1>
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            TAD APP | Login
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mb-6">
            Authenticate to access your projects and tools. Use your Autodesk
            account to sign in.
          </p>

          {cookies.access_token ? (
            <div className="flex flex-col gap-y-4">
              <button
                className="btn-primary font-medium px-6 py-3 rounded-md shadow transition-colors"
                onClick={logout}
              >
                Logout
              </button>
              <button
                className="btn-primary font-medium px-6 py-3 rounded-md shadow transition-colors"
                onClick={login}
              >
                Select Platform
              </button>
            </div>
          ) : (
            <button
              className="btn-primary font-medium px-6 py-3 rounded-md shadow transition-colors"
              onClick={login}
            >
              Authenticate
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer className="relative z-10" />
    </div>
  );
};

export default LoginPage;
