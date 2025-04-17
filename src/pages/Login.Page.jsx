import {useCookies} from 'react-cookie';
import {redirect, useNavigate} from 'react-router-dom';
import { Header } from '../components/general_pages_components/general.pages.header';
import { Footer } from '../components/general_pages_components/general.pages.footer.jsx';
import HomeImage from '/Home_Image.png';

const bakendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL || 'http://localhost:3000';
const clientId = import.meta.env.VITE_CLIENT_ID;

const LoginPage = () => {   

    const [cookies, removeCookie] = useCookies(['access_token']);
    const navigate = useNavigate();

    const Login = () => {
        const options = {
            client_id: clientId,
            redirect_uri: `${bakendUrl}/auth/three-legged`,
            scope : 'data:read data:write data:create account:read',
            response_type: 'code',
        }

        const url = `https://developer.api.autodesk.com/authentication/v2/authorize?response_type=${options.response_type}&client_id=${options.client_id}&redirect_uri=${options.redirect_uri}&scope=${options.scope}`;
        window.location.href = url;
    }

    const Logout = async () => {
        await fetch (`${bakendUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        })
        window.location.href = '/'
    }

    return (
        <div className = 'flex flex-col min-h-screen bg-[#fbfcfb]'>

            {/*Header*/}
            <Header />

            {/*Main Content*/}
            <main className = 'flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20'>

                {/*Left Side*/}
                <div className = 'w-1/2 flex justify-center items-center'>
                    <img 
                        src = {HomeImage} 
                        alt = 'Home Page Image' 
                        className = "h-full rounded-lg "
                        style = {{ maxWidth: '75%', maxHeight: '90vh' }}
                    />
                </div>

                {/*Right Side*/}
                <div className = 'w-1/2 flex flex-col justify-center items-center text-center'>
                    <h1 className = 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6'>
                        TAD APP | Login 
                    </h1>
                    <p className = 'text-lg text-slate-600 max-w-xl mb-6'>
                        Authenticate to access your projects and tools. You can use your Autodesk account to log in.
                    </p>

                    {cookies.access_token ? (
                        <div className = 'flex flex-col gap-y-4'>
                            <button 
                                className = 'bg-[#2ea3e3] text-white font-medium px-6 py-3 rounded-md shadow hover:bg-slate-200 hover:text-black transition-colors'
                                onClick = {Logout}
                            >
                                Logout
                            </button>
                            <button 
                                className = 'bg-[#2ea3e3] text-white font-medium px-6 py-3 rounded-md shadow hover:bg-slate-200 hover:text-black transition-colors'
                                onClick = {Login}
                                >
                                Select Platform
                            </button>
                        </div>
                        ) : (
                        <button
                            className="bg-[#2ea3e3] text-white font-medium px-6 py-3 rounded-md shadow hover:bg-slate-200 hover:text-black transition-colors"
                            onClick={Login}
                            >
                            Authenticate
                        </button>
                    )}
                </div>
            </main>

                
            {/*Footer*/} 
            <Footer />
        </div>     

    )
}

export default LoginPage;