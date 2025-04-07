import {useEffect , useState} from 'react'

import {Link} from 'react-router-dom'

import PlatformHeader from '../../components/platform_page_components/platform.header'
import  {Footer } from '../../components/general_pages_components/footer';
import HomeImage from '/Home_Image.png'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const ACCProjectsPage = () => {

    const [projects, setProjects] = useState([])

    useEffect (() => {
        const getProjects = async () => {
            const response = await fetch (`${backendUrl}/acc/accprojects`, {
            credentials : 'include',
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
          }
    
          const { data } = await response.json();
    
          const accProjects = data.projects.filter(
            (project) => project.attributes.extension.data.projectType === "ACC"
          );
        
          console.log("ACC Projects:", accProjects);
    
          setProjects(accProjects);
        };

        getProjects()
    }, []);

    return (
    <div className="flex flex-col min-h-screen bg-[#fbfcfb]">
        <PlatformHeader />

        <main className = 'flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20'>
            {/*Left Side*/}
            <div className = 'w-1/2 flex justify-center items-center'>
                <img 
                    src = {HomeImage} 
                    alt = 'Home Page Image' 
                    className = "h-full rounded-lg"
                    style = {{ maxWidth: '75%', maxHeight: '90vh' }}
                />
            </div>
            
            
            {/*Rigth Side*/}
            <div className="w-1/2 flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
                    Select your project
                </h1>
                <p className="text-lg text-slate-600 max-w-xl mb-6">
                    These are the projects associated with your account, please select a project.
                </p>

            {/* Lista con altura fija y scroll */}
            <div className="w-full max-w-4xl" style={{ height: '450px', overflowY: 'auto' }}>
                {projects.length > 0 ? (
                <ul className="space-y-4">
                    {projects.map((project) => (
                    <li
                        key={project.id}
                        className="bg-gray-100 shadow-md rounded-lg p-4 flex justify-between items-center"
                    >
                        <div>
                        <h2 className="text-m font-semibold">
                            {project.attributes.name}
                        </h2>
                        <p>{project.attributes.description}</p>
                        </div>
                        <Link
                        to={`/accproject/${project.id}`}
                        className="bg-[#2ea3e3] text-white text-m font-semibold px-4 py-2 rounded-md shadow hover:bg-slate-200 hover:text-black transition-colors"
                        >
                        Project Home
                        </Link>
                    </li>
                    ))}
                </ul>
                ) : (
                <p>No projects found.</p>
                )}
            </div>
        </div>
      </main>

        {/*Footer*/}
        <Footer />   

    </div>
  );
};

export default ACCProjectsPage;
