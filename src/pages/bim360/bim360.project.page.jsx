import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

import {
  fetchBIM360ProjectsData,
  fetchBIM360ProjectData,
  fetchBIM360FederatedModel,
  fechBIM360ProjectUsers,
  fechBIM360ProjectIssues,
  fetchBIM360ProjectRFI,
} from "../../pages/services/bim360.services";

import { simpleViewer } from "../../utils/Viewers/simple.viewer";

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 4,
  initialSlide: 0,
  arrows: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const BIM360ProjectPage = () => {
  
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);
  const token = cookies.access_token;

  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState(null);

  const [urn, setUrn] = useState("");
  const [federatedModel, setFederatedModel] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setProjectUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [issues, setIssues] = useState([]);
  const [issuesTotals, setIssuesTotals] = useState({
    total: 0,
    open: 0,
    answered: 0,
    completed: 0,
    closed: 0,
  });

  const [rfis, setRFIs] = useState([]);
  const [rfiTotals, setRFITotals] = useState({
    total: 0,
    open: 0,
    aswered: 0,
    closed: 0,
  });

  useEffect(() => {
      const loadAll = async () => {
        setLoading(true);
        try {
          const [
            projectsDataRes,
            projectRes,
            federatedModelRes,
            usersRes,
            issuesRes,
            rfiRes,
          ] = await Promise.all([
            fetchBIM360ProjectsData(token),
            fetchBIM360ProjectData(projectId, token, accountId),
            fetchBIM360FederatedModel(projectId, token, accountId),
            fechBIM360ProjectUsers(projectId, token, accountId),
            fechBIM360ProjectIssues(projectId, token, accountId),
            fetchBIM360ProjectRFI(projectId, token, accountId),
          ]);
  
          setProjectsData(projectsDataRes);
          setProject(projectRes);
  
          setFederatedModel(federatedModelRes);
  
          setProjectUsers(usersRes.users);
          setTotalUsers(usersRes.users.length);
  
          setIssues(issuesRes.issues);
          setIssuesTotals({
            total: issuesRes.issues.length,
            open: issuesRes.issues.filter(i => i.status === "open").length,
            answered: issuesRes.issues.filter(i => i.status === "answered").length,
            completed: issuesRes.issues.filter(i => i.status === "completed").length,
            closed: issuesRes.issues.filter(i => i.status === "closed").length,
          });
  
          setRFIs(rfiRes.rfis);
          setRFITotals({
            total: rfiRes.rfis.length,
            open: rfiRes.rfis.filter(r => r.status === "open").length,
            answered: rfiRes.rfis.filter(r => r.status === "answered").length,
            closed: rfiRes.rfis.filter(r => r.status === "closed").length,
          });
  
        } catch (err) {
          console.error("Error loading project page data:", err);
          setError(err.message || "Error loading data");
        } finally {
          setLoading(false);
        }
      };
  
      if (token && projectId && accountId) {
        loadAll();
      }
    }, [token, projectId, accountId]);
  
    useEffect(() => {
      if (federatedModel) {
        simpleViewer(federatedModel);
      }
    }, [federatedModel]);
  
    if (error) {
      return <div className="p-4 text-red-600">Error: {error}</div>;
    }

  return (
    <>
    {loading && <LoadingOverlay />}
      {/*Header*/}
      <BIM360PlatformprojectsHeader
        accountId={accountId}
        projectId={projectId}
      />

      <div className="flex h-screen mt-14">
        <BIM360SideBar />

        {/*Main Content*/}
        <div className="flex-1 p-2 px-4 bg-white w -full ">
          <h1 className="text-right text-xl  text-black mt-2">PROJECT HOME</h1>
          <hr className="my-4 border-t border-gray-300" /> {/* Dividing line */}
          
          {/* Totals Overview (Slider) */}
          <div className="flex space-x-2 mt-2 items-center justify-center bg-white rounded shadow w-full">
            <div className="max-w-[1700px] h-[195px] p-2 flex flex-col">
              <h1 className="text-lg mb-1 font-semibold">Totals Overview</h1>
              <hr className="my-4 border-t border-gray-300" />

              <Slider {...sliderSettings}>
                {/* Users */}
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Total Users
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">{totalUsers}</p>
                </div>

                {/* Issues */}
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Total Issues
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {issuesTotals.total}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Open Issues
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {issuesTotals.open}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Answered Issues
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {issuesTotals.answered}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Completed Issues
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {issuesTotals.completed}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Closed Issues
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {issuesTotals.closed}
                  </p>
                </div>

                {/* RFIs */}
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Total RFIs
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {rfiTotals.total}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Open RFIs
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {rfiTotals.open}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Answered RFIs
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {rfiTotals.answered}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Closed RFIs
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {rfiTotals.closed}
                  </p>
                </div>
              </Slider>
            </div>
          </div>
          
          {/* Model Viewer */}
          <div className="flex space-x-4 mt-4">
            <div className="w-full h-[550px] bg-white rounded shadow p-4 flex flex-col">
              <h1 className="text-lg mb-1 font-semibold">
                Project Federated Model Viewer
              </h1>
              <hr className="my-4 border-t border-gray-300" />
              <div
                className="flex-1 w-full h-[450px] relative"
                id="TADSimpleViwer"
              ></div>
            </div>
          </div>
        </div>
      </div>
      {/*Footer*/}
      <Footer />
    </>
  );
};

export default BIM360ProjectPage;
