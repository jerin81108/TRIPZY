import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

import SplashScreen from './pages/SplashScreen';
import AuthPage from './pages/AuthPage';
import TouristHome from './pages/TouristHome';
import ExploreMap from './pages/ExploreMap';
import DestinationDetails from './pages/DestinationDetails';
import AIRecommendations from './pages/AIRecommendations';
import LocalMarketplace from './pages/LocalMarketplace';
import FairPriceChecker from './pages/FairPriceChecker';
import BookingsPage from './pages/BookingsPage';
import AIAssistant from './pages/AIAssistant';
import SOSPage from './pages/SOSPage';
import ProfilePage from './pages/ProfilePage';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyDashboard from './pages/EmergencyDashboard';

// Social & Stranger features
import VlogFeed from './pages/VlogFeed';
import UploadMedia from './pages/UploadMedia';
import StreakRewards from './pages/StreakRewards';
import SearchConnect from './pages/SearchConnect';
import ChatPage from './pages/ChatPage';
import StrangerTrips from './pages/StrangerTrips';

function TouristNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { icon: '🏠', label: 'Home', path: '/home' },
    { icon: '🎒', label: 'Stranger', path: '/stranger-trips', highlight: true },
    { icon: '🎬', label: 'Feed', path: '/feed' },
    { icon: '🔍', label: 'Connect', path: '/search' },
    { icon: '🔥', label: 'Streak', path: '/rewards' },
    { icon: '🚨', label: 'SOS', path: '/sos', isSOS: true },
  ];

  const hideOn = ['/sos', '/assistant', '/map', '/chat'];
  if (hideOn.some(h => path.startsWith(h))) return null;

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`nav-item ${tab.isSOS ? 'nav-sos' : ''} ${!tab.isSOS && path === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
          style={tab.highlight && path !== tab.path ? { color: '#fda4af' } : {}}
        >
          <span className="nav-icon">{tab.icon}</span>
          {!tab.isSOS && (
            <span
              className="nav-label"
              style={tab.highlight && path === tab.path ? { color: '#f43f5e', fontWeight: 800 } : {}}
            >
              {tab.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

function BusinessNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { icon: '📊', label: 'Dashboard', path: '/business' },
    { icon: '📸', label: 'Upload', path: '/upload' },
    { icon: '🔍', label: 'Connect', path: '/search' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button key={tab.path} className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function AdminNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { icon: '📊', label: 'Dashboard', path: '/admin' },
    { icon: '🗺️', label: 'Map', path: '/map' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button key={tab.path} className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function ResponderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { icon: '🚨', label: 'Emergency', path: '/emergency' },
    { icon: '🗺️', label: 'Map', path: '/map' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button key={tab.path} className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`} onClick={() => navigate(tab.path)}>
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function AppLayout() {
  const { role, isLoggedIn } = useAuth();
  const location = useLocation();
  const publicPaths = ['/', '/auth'];
  const isPublic = publicPaths.includes(location.pathname);

  return (
    <div className="app-shell">
      <Routes>
        {/* Public */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Tourist */}
        <Route path="/home" element={<TouristHome />} />
        <Route path="/map" element={<ExploreMap />} />
        <Route path="/destination/:id" element={<DestinationDetails />} />
        <Route path="/recommendations" element={<AIRecommendations />} />
        <Route path="/marketplace" element={<LocalMarketplace />} />
        <Route path="/price-checker" element={<FairPriceChecker />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/sos" element={<SOSPage />} />

        {/* Highlighted Stranger Trips */}
        <Route path="/stranger-trips" element={<StrangerTrips />} />

        {/* New shared pages */}
        <Route path="/feed" element={<VlogFeed />} />
        <Route path="/upload" element={<UploadMedia />} />
        <Route path="/rewards" element={<StreakRewards />} />
        <Route path="/search" element={<SearchConnect />} />
        <Route path="/chat/:userId" element={<ChatPage />} />

        {/* Shared */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Business */}
        <Route path="/business" element={<BusinessDashboard />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Responder */}
        <Route path="/emergency" element={<EmergencyDashboard />} />
      </Routes>

      {/* Role-based Navigation */}
      {isLoggedIn && !isPublic && (
        <>
          {role === 'tourist' && <TouristNav />}
          {role === 'business' && <BusinessNav />}
          {role === 'admin' && <AdminNav />}
          {role === 'responder' && <ResponderNav />}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
