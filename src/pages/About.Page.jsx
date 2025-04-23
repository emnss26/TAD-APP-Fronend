import { Header } from "../components/general_pages_components/general.pages.header";
import { Footer } from "../components/general_pages_components/general.pages.footer.jsx";
import Home_Image from "/Home_Image.png";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbfcfb]">
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
            About Us
          </h1>
          <p className="text-s text-gray-700 text-center">
            TAD HUB is a digital platform for architects and engineers, where
            you can find the best courses and tools to improve your skills and
            boost your career and projects. Our mission is to provide
            high-quality content and resources to help professionals in the AEC
            industry to grow and succeed in their projects and careers. We are
            constantly updating our platform with new courses, tools, and
            resources to help you stay up-to-date with the latest trends and
            technologies in the industry.
          </p>
          <p className="text-s text-gray-700 text-center"></p>
          <p className="text-s text-gray-700 text-center">
            Join TAD HUB today and take your career to the next level!
          </p>
        </div>
      </main>

      {/*Footer*/}
      <Footer />
    </div>
  );
};

export default AboutPage;
