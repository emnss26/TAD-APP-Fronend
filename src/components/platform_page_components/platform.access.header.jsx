import React, {useEffect, useRef, useState} from 'react'
import {useCookies} from 'react-cookie'
import {Link, useNavigate} from 'react-router-dom'
import {FaUser} from 'react-icons/fa'

const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL || 'http://localhost:3000'

const PlatformHeader = () => {

    const [userProfile, setUserProfile] = useState(null)
    const [error, setError] = useState(null)

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const navigate = useNavigate()
    const dropdownRef = useRef(null)

    const containerRef = useRef(null);

    useEffect (() => {
        const getUserProfile =async () => {
            try{
                const response = await fetch ( `${backendUrl}/general/userprofile`, {
                    credentials :'include',
                })

                if (!response.ok) {
                    console.error ('Error fetching user profile:')
                    setError('Error fetching user profile')
                    return;
                }

                const data = await response.json()
                setUserProfile(data.user)
            } catch (error) {
                setError(error?.response?.data?.message || 'Error fetching user profile');
                
            }
        }
        getUserProfile()
    }, [])

    useEffect (() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = async () => {
        await fetch (`${backendUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        })
        window.location.href = '/'
    }

    const handleGoPlatform = () => {
        navigate('/platform');
      };
    
    
    const handleGoAuth = () => {
    navigate('/Login');
    };

    return (
        <header className="bg-[#3c3c3c] h-[65px] text-white w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50 shadow-md">
          {/* Branding (izquierda) */}
          <div className="text-md">
            <Link to="/">TAD | Taller de Arquitectura Digital</Link>
          </div>
    
          {/* Contenedor derecho: nav + user profile */}
          <div 
            className="flex items-center gap-6"
            ref={containerRef}
          >
            {/* Navegación */}
            <nav className="flex items-center space-x-6">
              <Link to="/" className="hover:text-gray-300 transition">
                Home
              </Link>
              <Link to="/about" className="hover:text-gray-300 transition">
                About
              </Link>
              <Link to="/services" className="hover:text-gray-300 transition">
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
      )
    }

export default PlatformHeader;