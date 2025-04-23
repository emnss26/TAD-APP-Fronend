import { FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-[#2ea3e3] text-white py-2 px-2">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Sección Izquierda */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <h2 className="text-sm font-medium">
            TAD | Taller de Arquitectura Digital
          </h2>
          <div className="flex space-x-4">
            <a
              href="https://www.linkedin.com/in/taller-de-arquitectura-digital-363726185/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition"
            >
              <FaLinkedin size={22} />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-300 transition"
            >
              <FaInstagram size={22} />
            </a>
          </div>
        </div>
        {/* Sección Derecha */}
        <div className="flex flex-col items-center md:items-end mt-1 md:mt-0">
          <div className="flex items-center space-x-1">
            <FaEnvelope size={18} />
            <a
              href="mailto:taller.arq.dgtl@gmail.com"
              className="hover:text-blue-300 transition text-sm"
            >
              taller.arq.dgtl@gmail.com
            </a>
          </div>
          <p className="text-xs mt-1">
            &copy; {new Date().getFullYear()} TAD Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
