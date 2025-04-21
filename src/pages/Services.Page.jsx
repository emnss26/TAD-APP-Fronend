
import { Header } from '../components/general_pages_components/general.pages.header'
import { Footer } from '../components/general_pages_components/general.pages.footer.jsx'
import Home_Image from '/Home_Image.png'

const ServicesPage = () => {

return (
    <div className = 'flex flex-col min-h-screen bg-[#fbfcfb]'>

        {/*Header*/}
        <Header />

        {/*Main Content*/}
        <main className = 'flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20'>
            <div className = 'w-1/2 flex justify-center items-center'>
                <img 
                    src = {Home_Image} 
                    alt = 'Home Page Image' 
                    className = "h-full rounded-lg "
                    style = {{ maxWidth: '75%', maxHeight: '90vh' }}
                />
            </div>
            <div className = 'w-1/2 flex flex-col justify-center items-center text-center'>
                <h1 className = 'text-4xl md:text-5xl lg:text 6xl font-bold tracking-tigth leading-tight mb-4'>
                    Services
                </h1>
                <p className="text-s text-gray-700 text-center">
                    - Revit API Plugins
                    - Autodesk Platform Services (APS) APPS
                    - Artificial Intelligence (AI) Tools for AEC
                </p>
                <p className="text-s text-gray-700 text-center">
                    
                </p>
                <p className="text-s text-gray-700 text-center">
                    Let us know if you have any questions or if you would like to discuss a project with us.
                </p>
                             
            </div>
        </main>

        {/*Footer*/}
        <Footer />
    </div>
    )
}

export default ServicesPage;