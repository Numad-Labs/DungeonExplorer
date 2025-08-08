import React, { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  GameControlsProvider,
  useGameControls,
} from "./context/GameControlsContext";
import Login from "./pages/Login.jsx";
import MainMenu from "./pages/MainMenu.jsx";
import Sidebar from "./components/SideBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Quest from "./pages/Quest.jsx";
import Market from "./pages/Market.jsx";
import Guide from "./pages/Guide.jsx";
import Account from "./pages/Account.jsx";
import { GameProvider } from "./context/GameContext.jsx";
import { PhaserGame } from "./game/PhaserGame";
import { EventBus } from "./game/EventBus";
import HPBar from "./components/HPBar.jsx";
import SkillExpBar from "./components/SkillExpBar.jsx";
import Timer from "./components/Timer.jsx";
import GameNotifications from "./components/GameNotifications.jsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { getBridge } from "./bridge/GameBridge.js";
import DeathLoadingScreen from "./components/DeathLoadingScreen.jsx";

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

  // Death loading screen state
  const [showDeathLoading, setShowDeathLoading] = useState(false);
  const [deathData, setDeathData] = useState(null);

  // Auto-resume pause state
  const [pauseCountdown, setPauseCountdown] = useState(3);

  const { setGameControls } = useGameControls();
  const location = useLocation();
  const navigate = useNavigate();

  const showModal = (id, modalData) => {
    console.log("Game modal requested:", { id, modalData });

    switch (id) {
      case "PAUSE_MENU":
        setGameState("paused");
        break;
      case "GAME_OVER":
        // Show death loading screen
        console.log("Game over - showing death loading screen", modalData);
        setDeathData(modalData);
        setShowDeathLoading(true);
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

  // Handle death loading completion
  const handleDeathLoadingComplete = () => {
    console.log("Death loading complete - navigating to dashboard");
    setShowDeathLoading(false);
    setDeathData(null);
    setGameState("menu");
    // Navigate to dashboard after death loading
    navigate("/");
  };

  // Register game controls with context
  useEffect(() => {
    if (setGameControls) {
      setGameControls({
        startGame,
        returnToMenu,
        gameState,
      });
    }
  }, [setGameControls, gameState]);

  // Auto-start game if autostart parameter is present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("autostart") === "true" && gameState === "menu") {
      console.log("Auto-starting game from URL parameter");
      setTimeout(() => {
        startGame();
      }, 500);
    }
  }, [location.search, gameState]);

  // Auto-resume pause after 3 seconds
  useEffect(() => {
    let pauseTimer;

    if (gameState === "paused") {
      // Set a 3-second timer to auto-resume
      pauseTimer = setTimeout(() => {
        setGameState("playing");
      }, 3000);
    }

    // Cleanup timer if component unmounts or gameState changes
    return () => {
      if (pauseTimer) {
        clearTimeout(pauseTimer);
      }
    };
  }, [gameState]);

  // Handle countdown display for pause screen
  useEffect(() => {
    let countdownInterval;

    if (gameState === "paused") {
      setPauseCountdown(3);

      countdownInterval = setInterval(() => {
        setPauseCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [gameState]);

  useEffect(() => {
    const handleGameStart = () => {
      setGameState("playing");
      setShowHPBar(true);
    };

    const handleGameOver = (gameOverData) => {
      console.log("Game over event received:", gameOverData);
      // Show death loading screen
      setDeathData(gameOverData);
      setShowDeathLoading(true);
      setShowHPBar(false);
    };

    const handleReturnToMenu = () => {
      returnToMenu();
    };

    EventBus.on("game-started", handleGameStart);
    EventBus.on("game-over", handleGameOver);
    EventBus.on("return-to-menu", handleReturnToMenu);

    const handleKeyPress = (e) => {
      if (e.key === "Escape" && gameState === "playing") {
        returnToMenu();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      EventBus.removeListener("game-started", handleGameStart);
      EventBus.removeListener("game-over", handleGameOver);
      EventBus.removeListener("return-to-menu", handleReturnToMenu);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState, navigate]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {gameState === "menu" && !showDeathLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        >
          <MainMenu onStartGame={startGame} />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          overflow: "hidden",
          display: gameState === "playing" ? "block" : "none",
        }}
      >
        <PhaserGame
          ref={phaserRef}
          currentActiveScene={currentScene}
          showModal={showModal}
          autoStart={false}
        />
      </div>

      {gameState === "playing" && !showDeathLoading && (
        <>
          {showHPBar && <HPBar showGoldIcon={true} />}
          {showHPBar && <SkillExpBar />}
          {showHPBar && <Timer />}
          {showHPBar && <GameNotifications />}

          <div
            style={{
              position: "fixed",
              top: "2vh",
              right: "2vw",
              color: "white",
              fontSize: "14px",
              background: "rgba(0,0,0,0.7)",
              padding: "8px 12px",
              borderRadius: "4px",
              zIndex: 1000,
            }}
          >
            Press ESC to return to menu
          </div>
        </>
      )}

      {gameState === "paused" && !showDeathLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "linear-gradient(45deg, #1a1a1a, #2d1b1b, #1a1a1a)",
            backgroundSize: "400% 400%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            animation: "backgroundShift 4s ease-in-out infinite",
          }}
        >
          <div className="bg-cover p-5 rounded-lg text-white text-center w-[500px] h-[200px] flex flex-col justify-center items-center gap-[32px]">
            <div>
              <img src="GamePause.png" className="w-140 h-auto" alt="" />
            </div>

            {/* Add countdown display */}
            <div className="text-2xl text-yellow-400 font-bold">
              {pauseCountdown}
            </div>

            <div className="flex gap-[10px]">
              <button
                onClick={() => setGameState("playing")}
                className="bg-cover bg-center bg-no-repeat w-[200px] h-[50px] border-none cursor-pointer transition-transform duration-200 hover:scale-105"
                style={{
                  backgroundImage: "url('./Resume.png')",
                }}
              ></button>
              <button
                onClick={returnToMenu}
                className="bg-cover bg-center bg-no-repeat w-[200px] pr-50 h-[50px] border-none cursor-pointer transition-transform duration-200 hover:scale-105"
                style={{
                  backgroundImage: "url('./PauseGame.png')",
                }}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Death Loading Screen */}
      <DeathLoadingScreen
        isVisible={showDeathLoading}
        deathData={deathData}
        onComplete={handleDeathLoadingComplete}
      />
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
          <Route index element={<Dashboard />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="quest" element={<Quest />} />
          <Route path="market" element={<Market />} />
          <Route path="guide" element={<Guide />} />

          <Route
            path="about"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-display-1-alagard-bold">Alagard title</h1>
                  <h1 className="text-display-1-pixelify-bold">
                    Pixelify title
                  </h1>
                  <h2 className="text-heading-1-alagard">Alagard heading</h2>
                  <h2 className="text-heading-1-pixelify-bold">
                    Pixelify heading
                  </h2>
                  <p className="text-body-1-alagard">Alagard body text</p>
                  <p className="text-body-2-pixelify-bold">
                    Pixelify body text
                  </p>
                  <button className="text-button-56-alagard">
                    Alagard button
                  </button>
                  <button className="text-button-48-pixelify">
                    Pixelify button
                  </button>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        <Route
          path="/game/*"
          element={
            <ProtectedRoute>
              <GameControlsProvider>
                <GameRoute />
              </GameControlsProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GameProvider>
          <Router>
            <AppRoutes />
          </Router>
        </GameProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
