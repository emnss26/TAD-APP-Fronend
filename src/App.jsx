import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie';

import HomePage from './pages/Home.Page'
import LoginPage from './pages/Login.Page'
import PlatformPage from './pages/Platform.Page';

//ACC Pages
import ACCProjectsPage from './pages/acc/acc.projects.page.jsx'

//BIM360 Pages
import BIM360ProjectsPage from './pages/bim360/bim360.projects.page.jsx'

function App() {
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/platform" element={<PlatformPage />} />

          {/* ACC Pages */}
          <Route path="/accprojects" element={<ACCProjectsPage />} />

          {/* BIM360 Pages */}
          <Route path="/bim360projects" element={<BIM360ProjectsPage />} />
        </Routes>
      </Router>
    </CookiesProvider>
  )
}

export default App
