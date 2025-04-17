import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaFolder } from "react-icons/fa";

export const ProjectsDropdownMenu = ({
  label,
  options,
  onSelect,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Alternar abrir/cerrar
  const handleToggle = () => {
    setOpen(!open);
  };

  // Manejar selección de opción
  const handleOptionClick = (option) => {
    onSelect(option);
    setOpen(false);
  };

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Botón principal con flecha */}
      <button
        className="
          bg-gray-700
          text-white
          px-3
          py-2
          rounded
          hover:bg-gray-600
          focus:outline-none
          flex
          items-center
          text-xs
        "
        onClick={handleToggle}
      >
        <span className="mr-1">{label}</span>
        <FaChevronDown className="text-sm" />
      </button>

      {/* Listado de opciones */}
      {open && (
        <div className="absolute mt-2 bg-black border border-gray-600 rounded-md shadow-lg min-w-[250px] z-50">
          <ul className="flex flex-col text-white">
            {options.map((option, index) => (
              <li key={index}>
                <button
                  onClick={() => handleOptionClick(option)}
                  className="
                    flex
                    items-start
                    w-full
                    text-left
                    px-4
                    py-2
                    text-xs
                    hover:bg-gray-800
                    whitespace-normal
                    break-words
                  "
                >
                  {/* Ícono de carpeta con tamaño fijo */}
                  <FaFolder className="mr-2 w-4 h-4 flex-shrink-0" />
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
