import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login.jsx";
import MainMenu from "./pages/MainMenu.jsx";
import Sidebar from "./components/SideBar.jsx";
import GameManager from "./managers/GameManager.js";
import { GameProvider } from "./context/GameContext.jsx";
import Game from "./pages/Game.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Sidebar />
            </ProtectedRoute>
          }
        >
          <Route
            path="about"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">About</h1>
                  <p>This is the about page. Only accessible after login.</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Profile</h1>
                  <p>This is your profile page. Only accessible after login.</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Settings</h1>
                  <p>This is the settings page. Only accessible after login.</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        <Route path="/game">
          {/* Default redirect for /game to /game/menu */}
          <Route index element={<Navigate to="/game/menu" replace />} />
          <Route
            path="menu"
            element={
              <ProtectedRoute>
                <MainMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="play"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/game/menu" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <AppRoutes />
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
