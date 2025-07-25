import React, { useEffect, useRef, useState } from "react";
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
import { GameProvider } from "./context/GameContext.jsx";
import { PhaserGame } from "./game/PhaserGame";
import { EventBus } from "./game/EventBus";
import HPBar from "./components/HPBar.jsx";

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

function GameRoute() {
  const phaserRef = useRef();
  const [gameState, setGameState] = useState("menu");
  const [showHPBar, setShowHPBar] = useState(false);
  const [phaserInstance, setPhaserInstance] = useState(null);

  const showModal = (id, modalData) => {
    console.log('Game modal requested:', { id, modalData });
    
    switch (id) {
      case "PAUSE_MENU":
        setGameState("paused");
        break;
      case "GAME_OVER":
        setGameState("menu");
        setShowHPBar(false);
        break;
      case "SETTINGS":
        break;
      default:
        break;
    }
  };

  const currentScene = (scene) => {
    if (scene?.scene?.key === "MainMapScene") {
      setShowHPBar(true);
    }
  };

  const startGame = () => {
    setGameState("playing");
    setShowHPBar(true);
    
    if (phaserRef.current?.startGame) {
      phaserRef.current.startGame();
    }
  };

  const returnToMenu = () => {
    setGameState("menu");
    setShowHPBar(false);
    
    if (phaserRef.current?.stopGame) {
      phaserRef.current.stopGame();
    }
  };

  useEffect(() => {
    const handleGameStart = () => {
      setGameState("playing");
      setShowHPBar(true);
    };

    const handleGameOver = () => {
      setGameState("menu");
      setShowHPBar(false);
    };

    const handleReturnToMenu = () => {
      returnToMenu();
    };

    EventBus.on('game-started', handleGameStart);
    EventBus.on('game-over', handleGameOver);
    EventBus.on('return-to-menu', handleReturnToMenu);

    const handleKeyPress = (e) => {
      if (e.key === "Escape" && gameState === "playing") {
        returnToMenu();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      EventBus.removeListener('game-started', handleGameStart);
      EventBus.removeListener('game-over', handleGameOver);
      EventBus.removeListener('return-to-menu', handleReturnToMenu);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {gameState === "menu" && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 10 
        }}>
          <MainMenu onStartGame={startGame} />
        </div>
      )}

      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 1,
        display: gameState === "playing" ? 'block' : 'none'
      }}>
        <PhaserGame 
          ref={phaserRef} 
          currentActiveScene={currentScene} 
          showModal={showModal}
          autoStart={false}
        />
      </div>

      {gameState === "playing" && (
        <>
          {showHPBar && <HPBar showGoldIcon={true} />}
          
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            color: 'white',
            fontSize: '14px',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px 12px',
            borderRadius: '4px',
            zIndex: 1000
          }}>
            Press ESC to return to menu
          </div>
        </>
      )}

      {gameState === "paused" && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#333',
            padding: '20px',
            borderRadius: '8px',
            color: 'white',
            textAlign: 'center'
          }}>
            <h2>Game Paused</h2>
            <button 
              onClick={() => setGameState("playing")}
              style={{ margin: '10px', padding: '10px 20px' }}
            >
              Resume
            </button>
            <button 
              onClick={returnToMenu}
              style={{ margin: '10px', padding: '10px 20px' }}
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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

        <Route
          path="/game/*"
          element={
            <ProtectedRoute>
              <GameRoute />
            </ProtectedRoute>
          }
        />
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