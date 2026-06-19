import { useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import WorkDetail from './pages/WorkDetail';
import AccountSettings from './pages/AccountSettings';
import CreatorDashboard from './pages/CreatorDashboard';
import './App.css';

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const isCreatorStudioRoute = location.pathname.startsWith('/creator');

  return (
    <div className="App">
      <style>{`
        #root {
          width: 100%;
          max-width: none;
          min-height: 100svh;
          border: 0;
          background: #090909;
          text-align: initial;
        }

        .App {
          min-height: 100svh;
          background: #090909;
          color: #f7f8fb;
          font-family: Inter, Pretendard, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          letter-spacing: 0;
        }

        .app-shell {
          display: grid;
          grid-template-columns: auto 1fr;
          min-height: calc(100svh - 56px);
        }

        .app-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          min-height: calc(100svh - 56px);
          background: #090909;
        }

        .app-main {
          min-width: 0;
          flex: 1 0 auto;
          background: #090909;
        }

        @media (max-width: 640px) {
          .app-shell {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {isCreatorStudioRoute ? (
        <Routes>
          <Route path="/creator/upload" element={<CreatorDashboard />} />
        </Routes>
      ) : (
        <>
        <Header onToggleSidebar={() => setIsSidebarOpen((current) => !current)} />

        <div className="app-shell">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen((current) => !current)}
          />

          <div className="app-content">
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth/callback/:provider" element={<OAuthCallback />} />
                <Route path="/works/:workId" element={<WorkDetail />} />
                <Route path="/settings" element={<AccountSettings />} />
                <Route path="/creator/upload" element={<CreatorDashboard />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
