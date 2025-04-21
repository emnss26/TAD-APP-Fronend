import  {useState, useRef, useEffect} from 'react'
import {Link, useNavigate} from 'react-router-dom'

export function Header () {

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const navigate = useNavigate()
    const dropdownRef = useRef(null)

    const  handleClickOutsite = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false)
        }
    }

    useEffect (() => {
        document.addEventListener('mousedown', handleClickOutsite)
        return () => {
            document.removeEventListener('mousedown', handleClickOutsite)
        }
    }, [])

    return (
        <header className= 'bg-[#3c3c3c] text-white w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50 shadow-md'>
            <div className = 'textt - md'>
                <Link to = '/'> TAD | Taller de Arquitectura Digital</Link>
            </div>
            <nav className= 'hidden md:flex space-x-6'>
                <Link to = '/' className = 'hover:text-gray-300 transition'>Home</Link>
                <Link to = '/about' className = 'hover:text gray-300 transition'>About</Link>
                <Link to = '/services' className = 'hover:text gray-300 transition'>Services</Link>
                <Link to = '/login' className = 'hover:text gray-300 transition'>Login</Link>
            </nav>
        </header>
    )
}