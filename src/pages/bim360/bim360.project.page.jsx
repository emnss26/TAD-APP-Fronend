import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { simpleViewer } from "../../utils/Viewers/simple.viewer";
import { useCookies } from "react-cookie";

// Slider
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

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

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
  //Project Data
  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState(null);
  const { projectId } = useParams();
  const { accountId } = useParams();

  //Model Data
  const [urn, setUrn] = useState("");
  const [federatedModel, setFederatedModel] = useState(null);

  //General
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies] = useCookies(["access_token"]);

  //User Data
  const [users, setProjectUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  //Issues Data
  const [issues, setIssues] = useState([]);
  const [issuesTotals, setIssuesTotals] = useState({
    total: 0,
    open: 0,
    answered: 0,
    completed: 0,
    closed: 0,
  });

  // RFI Data
  const [rfis, setRFIs] = useState([]);
  const [rfiTotals, setRFITotals] = useState({
    total: 0,
    open: 0,
    aswered: 0,
    closed: 0,
  });

  //ProjectsData
  useEffect(() => {
    const getProjects = async () => {
      const projectsData = await fetchBIM360ProjectsData(cookies.access_token);

      setProjectsData(projectsData);
    };
    getProjects();
  }, [cookies.access_token]);

  //ProjectData
  useEffect(() => {
    const getProject = async () => {
      const projectData = await fetchBIM360ProjectData(
        projectId,
        cookies.access_token,
        accountId
      );
      setProject(projectData);
    };
    getProject();
  }, [projectId, cookies.access_token, accountId]);

  //Project Federated Model
  useEffect(() => {
    const getFederatedModel = async () => {
      const federatedModel = await fetchBIM360FederatedModel(
        projectId,
        cookies.access_token,
        accountId
      );

      setFederatedModel(federatedModel);
    };
    getFederatedModel();
  }, [projectId, cookies.access_token, accountId]);

  //Project Model Simple Viewer
  useEffect(() => {
    if (federatedModel) {
      simpleViewer(federatedModel, cookies.access_token);
    }
  }, [federatedModel, cookies.access_token]);

  //Project Users
  useEffect(() => {
    const getProjectUsers = async () => {
      const projectUsers = await fechBIM360ProjectUsers(
        projectId,
        cookies.access_token,
        accountId
      );
      setProjectUsers(projectUsers.users);

      let total = 0;

      projectUsers.users.forEach((user) => {
        total++;
      });

      setTotalUsers(total);
    };
    getProjectUsers();
  }, [projectId, cookies.access_token, accountId]);

  //Project Issues
  useEffect(() => {
    const getProjectIssues = async () => {
      const projectIssues = await fechBIM360ProjectIssues(
        projectId,
        cookies.access_token,
        accountId
      );
      
      setIssues(projectIssues.issues);
      setIssuesTotals({
        total: projectIssues.issues.length,
        open: projectIssues.issues.filter((issue) => issue.status === "open")
          .length,
        answered: projectIssues.issues.filter(
          (issue) => issue.status === "answered"
        ).length,
        closed: projectIssues.issues.filter(
          (issue) => issue.status === "closed"
        ).length,
        completed: projectIssues.issues.filter(
          (issue) => issue.status === "completed"
        ).length,
      });
    };
    getProjectIssues();
  }, [projectId, cookies.access_token, accountId]);

  //RFIs
  useEffect(() => {
    const getProjectRFIs = async () => {
      const projectRfis = await fetchBIM360ProjectRFI(
        projectId,
        cookies.access_token,
        accountId
      );

      setRFIs(projectRfis.rfis);
      setRFITotals({
        total: projectRfis.rfis.length,
        open: projectRfis.rfis.filter((rfi) => rfi.status === "open").length,
        answered: projectRfis.rfis.filter((rfi) => rfi.status === "answered")
          .length,
        closed: projectRfis.rfis.filter((rfi) => rfi.status === "closed")
          .length,
      });
    };
    getProjectRFIs();
  }, [projectId, cookies.access_token, accountId]);

  async function fetchAll(projectId, cookies, accountId) {
      await Promise.all([
        fetchBIM360ProjectData(projectId, cookies.access_token, accountId),
        fechBIM360ProjectUsers(projectId, cookies.access_token, accountId),
        fechBIM360ProjectIssues(projectId, cookies.access_token, accountId),
        fetchBIM360ProjectRFI(projectId, cookies.access_token, accountId),
        fetchBIM360FederatedModel(projectId, cookies.access_token, accountId),
      ]);
    }
    
    useEffect(() => {
      setLoading(true);
      fetchAll(projectId, cookies, accountId)
        .catch(console.error)   // maneja errores
        .finally(() => setLoading(false));
    }, [projectId, cookies, accountId]);

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
