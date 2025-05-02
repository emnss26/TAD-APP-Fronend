import { useNavigate } from "react-router-dom";
import { Header } from "../components/general_pages_components/general.pages.header";
import { Footer } from "../components/general_pages_components/general.pages.footer.jsx";
import Home_Image from "/Home_Image.png";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff]">
      {/*Header*/}
      <Header />

      {/*Main Content*/}
      <main className="flex flex-1 flex-row items-center justify-center px-8 py-8 mt-20">
        <div className="w-1/2 flex justify-center items-center">
          <img
            src={Home_Image}
            alt="Home Page Image"
            className="h-full rounded-lg "
            style={{ maxWidth: "75%", maxHeight: "90vh" }}
          />
        </div>
        <div className="w-1/2 flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text 6xl font-bold tracking-tigth leading-tight mb-4">
            Improve Your <span className="text-primary"> BIM </span> &{" "}
            <span className="text-primary"> VDC </span> Tools
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mb-6">
            TAD HUB is a digital platform where you can find the best tools to
            improve your projects, helped with AI and automation workflows.
          </p>
          <button
            className="btn-primary font-medium px-6 py-3 rounded-md shadow transition-colors"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>
      </main>

      {/*Footer*/}
      <Footer />
    </div>
  );
};

export default HomePage;
