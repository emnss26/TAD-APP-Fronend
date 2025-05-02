import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import PlatformHeader from "../components/platform_page_components/platform.access.header.jsx";
import { Footer } from "../components/general_pages_components/general.pages.footer.jsx";
import HomeImage from "/Home_Image.png";

const PlatformPage = () => {
  const [cookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

  const goToBim360 = () => {
    navigate("/bim360projects");
  };

  const goToAcc = () => {
    navigate("/accprojects");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff]">
      {/*Header*/}
      <PlatformHeader />

      <main className="flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20">
        {/*Left Side*/}
        <div className="w-1/2 flex justify-center items-center">
          <img
            src={HomeImage}
            alt="Home Page Image"
            className="h-full rounded-lg"
            style={{ maxWidth: "75%", maxHeight: "90vh" }}
          />
        </div>

        {/*Right Side*/}
        <div className="w-1/2 flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            TAD APP | Select Your Platform
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mb-6">
            Select your platform to access your projects and tools. You can
            choose between BIM 360 and Autodesk Construction Cloud (ACC).
          </p>

          <div className="flex gap-x-4">
            <button
              className="btn-primary flex font-medium px-12 py-3 rounded-md shadow transition-colors"
              onClick={goToBim360}
            >
              BIM 360
            </button>
            <button
              className="btn-primary flex font-medium px-12 py-3 rounded-md shadow transition-colors"
              onClick={goToAcc}
            >
              ACC
            </button>
          </div>
        </div>
      </main>

      {/*Footer*/}
      <Footer />
    </div>
  );
};

export default PlatformPage;
