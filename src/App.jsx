import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie';

import HomePage from './pages/Home.Page'
import LoginPage from './pages/Login.Page'
import PlatformPage from './pages/Platform.Page';
import AboutPage from './pages/About.Page';

//ACC Pages
import ACCProjectsPage from './pages/acc/acc.projects.page.jsx'
import ACCProjectPage from './pages/acc/acc.project.page.jsx'
import ACCProjectUsers from './pages/acc/acc.users.page.jsx';
import ACCIssuesPage from './pages/acc/acc.issues.page.jsx'


//BIM360 Pages
import BIM360ProjectsPage from './pages/bim360/bim360.projects.page.jsx'
import BIM360ProjectPage from './pages/bim360/bim360.project.page.jsx'
import BIM360ProjectUsers from './pages/bim360/bim360.users.page.jsx';
import BIM360IssuesPage from './pages/bim360/bim360.issues.page.jsx'

function App() {
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/platform" element={<PlatformPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* ACC Pages */}
          <Route path="/accprojects" element={<ACCProjectsPage />} />
          <Route path="/accprojects/:accountId/:projectId" element={<ACCProjectPage />} />
          <Route path="/accprojects/:accountId/:projectId/accusers" element={<ACCProjectUsers />} />
          <Route path="/accprojects/:accountId/:projectId/accissues" element={<ACCIssuesPage />} />

          {/* BIM360 Pages */}
          <Route path="/bim360projects" element={<BIM360ProjectsPage />} />
          <Route path="/bim360projects/:accountId/:projectId" element={<BIM360ProjectPage />} />
          <Route path="/bim360projects/:accountId/:projectId/bim360users" element={<BIM360ProjectUsers />} />
          <Route path="/bim360projects/:accountId/:projectId/bim360issues" element={<BIM360IssuesPage />} />
          {/* 404 Not Found */}

        </Routes>
      </Router>
    </CookiesProvider>
  )
}

export default App
