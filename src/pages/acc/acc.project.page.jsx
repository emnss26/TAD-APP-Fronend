import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { simpleViewer } from "../../utils/Viewers/simple.viewer";
import { useCookies } from "react-cookie";

// Slider
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ACCPlatformprojectsHeader from "../../components/platform_page_components/acc.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import ACCSideBar from "../../components/platform_page_components/platform.acc.sidebar";

import {
  fetchACCProjectsData,
  fetchACCProjectData,
  fetchACCFederatedModel,
  fechACCProjectUsers,
  fechACCProjectIssues,
  fetchACCProjectRFI,
  fetchACCProjectSubmittals,
} from "../../pages/services/acc.services";

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

const ACCProjectPage = () => {
  //Project Data
  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState(null);
  const { projectId, accountId } = useParams();

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

  // Submittals Data
  const [submittals, setSubmittals] = useState([]);
  const [submittalsTotals, setSubmittalsTotals] = useState({
    total: 0,
    waitingforsubmission: 0,
    inreview: 0,
    reviewed: 0,
    submitted: 0,
    closed: 0,
  });

  // Combined data fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchACCProjectsData(),
      fetchACCProjectData(projectId, accountId),
      fetchACCFederatedModel(projectId, accountId),
      fechACCProjectUsers(projectId, accountId),
      fechACCProjectIssues(projectId, accountId),
      fetchACCProjectRFI(projectId, accountId),
      fetchACCProjectSubmittals(projectId, accountId),
    ])
      .then(
        ([
          projectsResp,
          projectResp,
          federatedModelResp,
          projectUsersResp,
          projectIssuesResp,
          projectRfisResp,
          projectSubmittalsResp,
        ]) => {
          setProjectsData(projectsResp);
          setProject(projectResp);
          setFederatedModel(federatedModelResp);
          setProjectUsers(projectUsersResp.users);
          setTotalUsers(projectUsersResp.users.length);
          setIssues(projectIssuesResp.issues);
          setIssuesTotals({
            total: projectIssuesResp.issues.length,
            open: projectIssuesResp.issues.filter(
              (issue) => issue.status === "open"
            ).length,
            answered: projectIssuesResp.issues.filter(
              (issue) => issue.status === "answered"
            ).length,
            closed: projectIssuesResp.issues.filter(
              (issue) => issue.status === "closed"
            ).length,
            completed: projectIssuesResp.issues.filter(
              (issue) => issue.status === "completed"
            ).length,
          });
          setRFIs(projectRfisResp.rfis);
          setRFITotals({
            total: projectRfisResp.rfis.length,
            open: projectRfisResp.rfis.filter((rfi) => rfi.status === "open")
              .length,
            answered: projectRfisResp.rfis.filter(
              (rfi) => rfi.status === "answered"
            ).length,
            closed: projectRfisResp.rfis.filter(
              (rfi) => rfi.status === "closed"
            ).length,
          });
          setSubmittals(projectSubmittalsResp.submittals);
          setSubmittalsTotals({
            total: projectSubmittalsResp.submittals.length,
            waitingforsubmission: projectSubmittalsResp.submittals.filter(
              (submittal) => submittal.stateId === "Waiting for submission"
            ).length,
            inreview: projectSubmittalsResp.submittals.filter(
              (submittal) => submittal.stateId === "In review"
            ).length,
            reviewed: projectSubmittalsResp.submittals.filter(
              (submittal) => submittal.stateId === "Reviewed"
            ).length,
            submitted: projectSubmittalsResp.submittals.filter(
              (submittal) => submittal.stateId === "Submitted"
            ).length,
            closed: projectSubmittalsResp.submittals.filter(
              (submittal) => submittal.stateId === "Closed"
            ).length,
          });
        }
      )
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [projectId, accountId, cookies.access_token]);

  //Project Model Simple Viewer
  useEffect(() => {
    if (federatedModel) {
      simpleViewer(federatedModel);

      //console.log("Token:", cookies.access_token);
    }
  }, [federatedModel]);

  return (
    <>
      {loading && <LoadingOverlay />}
      {/*Header*/}
      <ACCPlatformprojectsHeader accountId={accountId} projectId={projectId} />

      <div className="flex min-h-screen mt-14">
        <ACCSideBar />

        {/*Main Content*/}
        <main className="flex-1 min-w-0 p-2 px-4 bg-white">
          <h1 className="text-right text-xl  text-black mt-2">PROJECT HOME</h1>
          <hr className="my-4 border-t border-gray-300" /> {/* Dividing line */}
          {/* Totals Overview (Slider) */}
          <div className="flex space-x-2 mt-2 items-center justify-center bg-white rounded shadow w-full min-w-0">
            <div className="w-full h-[195px] p-2 flex flex-col">
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

                {/* Submittals */}
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Total Submittals
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {submittalsTotals.total}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Waiting for Submission
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {submittalsTotals.waitingforsubmission}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    In Review
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {submittalsTotals.inreview}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Reviewed
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {submittalsTotals.reviewed}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">
                    Submitted
                  </h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {submittalsTotals.submitted}
                  </p>
                </div>
                <div className="w-[70px] h-[75px] bg-[#2ea3e3] text-white rounded shadow flex flex-col items-center justify-center mx-3 mb-2 p-2">
                  <h3 className="text-xs font-semibold text-center">Closed</h3>
                  <p className="text-3xl text-center mb-4 p-4">
                    {submittalsTotals.closed}
                  </p>
                </div>
              </Slider>
            </div>
          </div>
          {/* Model Viewer */}
          <div className="flex space-x-4 mt-4 w-full min-w-0">
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
        </main>
      </div>

      {/*Footer*/}
      <Footer />
    </>
  );
};

export default ACCProjectPage;
