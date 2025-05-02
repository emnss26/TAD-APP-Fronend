import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleClickOutsite = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsite);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsite);
    };
  }, []);

  return (
    <header className="app-header h-[65px] w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50 shadow-md">
      <div className="nav-link text - md">
        <Link to="/"> TAD | Taller de Arquitectura Digital</Link>
      </div>
      <nav className="hidden md:flex space-x-6">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/about" className="nav-link">
          About
        </Link>
        <Link to="/services" className="nav-link">
          Services
        </Link>
        <Link to="/login" className="nav-link">
          Login
        </Link>
      </nav>
    </header>
  );
}
