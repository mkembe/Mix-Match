import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import SpotifyLogin from './components/SpotifyLogin';
import MixMatch from './components/MixMatch';
import { AuthenticationContext } from './context/AuthenticationContext';
import { useContext } from "react";
import Callback from './components/Callback';
import Profile from './components/app/Profile';
import Settings from './components/Settings';
import Friends from './components/Friends';
import Feed from './components/app/Feed';

function App() {
  // To prevent problems later on, users that are logged in should not be able to access the Login or register pages
  const { currentUser } = useContext(AuthenticationContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const AltProtectedRoute = ({ children }) => {
    if (currentUser) {
      return <Navigate to="/app" />;
    }

    return children;
  };

  const ProfileProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route index element={<LandingPage />} />
          <Route path="login" element={<AltProtectedRoute><Login /></AltProtectedRoute>} />
          <Route path="register" element={<AltProtectedRoute><Register /></AltProtectedRoute>} />
          <Route path="app" element={<ProtectedRoute><MixMatch /></ProtectedRoute>} >
            <Route index element={<ProtectedRoute><Feed /></ProtectedRoute>} />  
            <Route path="friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />  
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />  
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
          <Route path="callback" element={<Callback />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
