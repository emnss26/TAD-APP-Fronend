import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import HomePage from "./pages/Home.Page";
import LoginPage from "./pages/Login.Page";
import PlatformPage from "./pages/Platform.Page";
import AboutPage from "./pages/About.Page";
import ServicesPage from "./pages/Services.Page";
import NotFoundPage from "./pages/NotFound.Page";
import NotAuthorizedPage from "./pages/NotAllowed";

//ACC Pages
import ACCProjectsPage from "./pages/acc/acc.projects.page.jsx";
import ACCProjectPage from "./pages/acc/acc.project.page.jsx";
import ACCProjectUsers from "./pages/acc/acc.users.page.jsx";
import ACCIssuesPage from "./pages/acc/acc.issues.page.jsx";
import ACCRFIsPage from "./pages/acc/acc.rfis.page.jsx";
import ACCSubmittalsPage from "./pages/acc/acc.submittals.page";
import ACC4DDatabase from "./pages/acc/acc.database.4D";
import ACC5DDatabase from "./pages/acc/acc.database.5D";
import ACC6DDatabase from "./pages/acc/acc.database.6D";
import ACCProjectPlansPage from "./pages/acc/acc.project.plans.jsx";
import ACCProjectTaskManagementPage from "./pages/acc/acc.task.management.page.jsx";
import ACCModelLODCheckerPage from "./pages/acc/acc.model.lod.checker.page.jsx";

//BIM360 Pages
import BIM360ProjectsPage from "./pages/bim360/bim360.projects.page.jsx";
import BIM360ProjectPage from "./pages/bim360/bim360.project.page.jsx";
import BIM360ProjectUsers from "./pages/bim360/bim360.users.page.jsx";
import BIM360IssuesPage from "./pages/bim360/bim360.issues.page.jsx";
import BIM360RFIsPage from "./pages/bim360/bim360.rfis.page.jsx";
import BIM3604DDatabase from "./pages/bim360/bim360.database.4D";
import BIM3605DDatabase from "./pages/bim360/bim360.database.5D";
import BIM3606DDatabase from "./pages/bim360/bim360.database.6D";
import BIM360ProjectPlansPage from "./pages/bim360/bim360.project.plans.jsx";
import BIM360ProjectTaskManagementPage from "./pages/bim360/bim360.task.management.page.jsx";
import BIM360ModelLODCheckerPage from "./pages/bim360/bim360.model.lod.checker.page.jsx";

//Protected Route
import ProtectedRoute from "./components/general_pages_components/protected.route";

function App() {
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/not-authorized" element={<NotAuthorizedPage />} />

          <Route path="/platform" element={<PlatformPage />} />

          <Route element={<ProtectedRoute />}>
            {/* ACC Pages */}
            <Route path="/accprojects" element={<ACCProjectsPage />} />
            <Route
              path="/accprojects/:accountId/:projectId"
              element={<ACCProjectPage />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/accusers"
              element={<ACCProjectUsers />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/accissues"
              element={<ACCIssuesPage />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/accrfis"
              element={<ACCRFIsPage />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/accsubmittals"
              element={<ACCSubmittalsPage />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/acc4ddata"
              element={<ACC4DDatabase />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/acc5ddata"
              element={<ACC5DDatabase />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/acc6ddata"
              element={<ACC6DDatabase />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/plans"
              element={<ACCProjectPlansPage />}
            />
            <Route
              path="/accprojects/:accountId/:projectId/task-manager"
              element={<ACCProjectTaskManagementPage />}
            />

            <Route
              path="/accprojects/:accountId/:projectId/lod-checker"
              element={<ACCModelLODCheckerPage />}
            />

            {/* BIM360 Pages */}
            <Route path="/bim360projects" element={<BIM360ProjectsPage />} />
            <Route
              path="/bim360projects/:accountId/:projectId"
              element={<BIM360ProjectPage />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/bim360users"
              element={<BIM360ProjectUsers />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/bim360issues"
              element={<BIM360IssuesPage />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/bim360rfis"
              element={<BIM360RFIsPage />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/bim3604ddata"
              element={<BIM3604DDatabase />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/bim3605ddata"
              element={<BIM3605DDatabase />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/bim3606ddata"
              element={<BIM3606DDatabase />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/plans"
              element={<BIM360ProjectPlansPage />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/task-manager"
              element={<BIM360ProjectTaskManagementPage />}
            />
            <Route
              path="/bim360projects/:accountId/:projectId/lod-checker"
              element={<BIM360ModelLODCheckerPage />}
            />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
