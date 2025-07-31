import React, { useState, useEffect } from "react";
import "./MainMenuComponent.css";
import { getUpgrades, buyUpgrade } from "../services/api/gameApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


const MainMenu = ({ gameManager, onStartGame }) => {
  console.log({ gameManager, onStartGame });

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upgrades");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showTooltip, setShowTooltip] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('boot');
  const [gameState, setGameState] = useState({
    gold: 500,
    passiveUpgrades: {},
    allTimeStats: {},
    lastRunStats: null,
    currentRunStats: {},
  });
  const [debugInfo, setDebugInfo] = useState([]);

  // Fetch upgrades from backend
  const { data: upgrades } = useQuery({
    queryKey: ["user-upgrades"],
    queryFn: () => getUpgrades(),
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: buyUpgrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-upgrades"] });
      showNotification("Upgrade purchased successfully!");
    },
    onError: (error) => {
      console.error("Failed to upgrade:", error);
      showNotification("Failed to purchase upgrade!");
    },
  });

  useEffect(() => {
    // Load game state
    if (gameManager) {
      console.log("gameManager loaded", gameManager);
      setGameState({
        gold: gameManager.gold || 500,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        allTimeStats: gameManager.allTimeStats || {},
        lastRunStats: gameManager.lastRunStats || null,
        currentRunStats: gameManager.currentRunStats || {},
      });
    } else {
      console.log("not loadedd");
    }

    // Listen for game state updates
    const handleGameStateUpdate = (event) => {
      if (event.detail) {
        setGameState(event.detail);
      } else if (gameManager) {
        setGameState({
          gold: gameManager.gold || 500,
          passiveUpgrades: gameManager.passiveUpgrades || {},
          allTimeStats: gameManager.allTimeStats || {},
          lastRunStats: gameManager.lastRunStats || null,
          currentRunStats: gameManager.currentRunStats || {},
        });
      }
    };

    // Listen for death events
    const handlePlayerDeath = (event) => {
      setShowDeathScreen(true);
      setActiveTab("death");
    };

    const handleBootComplete = () => {
      setLoadingStage('assets');
      addDebugLog('Boot scene complete - loading assets...');
    };

    const handlePreloadComplete = () => {
      setIsGameLoading(false);
      setLoadingStage('ready');
      addDebugLog('All assets loaded - game ready to start!');
    };

    window.addEventListener("gameStateUpdated", handleGameStateUpdate);
    window.addEventListener("playerDeath", handlePlayerDeath);
    window.addEventListener("gameBootComplete", handleBootComplete);
    window.addEventListener("gamePreloadComplete", handlePreloadComplete);

    // Fallback timeout in case events don't fire
    const loadingTimeout = setTimeout(() => {
      if (isGameLoading) {
        addDebugLog('Loading timeout reached - force completing loading');
        setIsGameLoading(false);
        setLoadingStage('ready');
      }
    }, 10000); // 10 second timeout

    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener("gameStateUpdated", handleGameStateUpdate);
      window.removeEventListener("playerDeath", handlePlayerDeath);
      window.removeEventListener("gameBootComplete", handleBootComplete);
      window.removeEventListener("gamePreloadComplete", handlePreloadComplete);
    };
  }, [gameManager]);

  const categories = [
    "all",
    "combat",
    "survival",
    "mobility",
    "utility",
    "progression",
  ];

  // Use backend data instead of hardcoded data
  const backendUpgrades = upgrades?.data || [];
  const filteredUpgrades =
    selectedCategory === "all"
      ? backendUpgrades
      : backendUpgrades.filter(
          (upgrade) => upgrade.category === selectedCategory
        );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const purchaseUpgrade = (upgradeId) => {
    upgradeMutation.mutate(upgradeId);
  };

  const resetProgress = () => {
    if (gameManager && gameManager.resetProgress) {
      gameManager.resetProgress();
      setShowResetConfirm(false);
      showNotification("Progress has been reset!");
    }
  };

  const addDebugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const startGame = () => {
    // Don't start if game is still loading
    if (isGameLoading) {
      addDebugLog("Cannot start game - still loading assets");
      return;
    }

    addDebugLog("StartGame function called");

    setShowDeathScreen(false);
    try {
      // Log the current state
      addDebugLog(`GameManager exists: ${!!gameManager}`);
      addDebugLog(
        `GameManager.startNewRun exists: ${!!(
          gameManager && gameManager.startNewRun
        )}`
      );
      addDebugLog(`onStartGame exists: ${!!onStartGame}`);
      addDebugLog(`onStartGame type: ${typeof onStartGame}`);

      if (gameManager && gameManager.startNewRun) {
        console.log("Calling startNewRun from MainMenu");
        addDebugLog("Calling gameManager.startNewRun()");
        gameManager.startNewRun();
        addDebugLog("gameManager.startNewRun() completed");

        // Log game manager state after startNewRun
        addDebugLog(`Game running: ${gameManager.isGameRunning}`);
        addDebugLog(`Game start time: ${gameManager.gameStartTime}`);
      } else {
        addDebugLog("GameManager or startNewRun method not available");
      }

      if (onStartGame) {
        console.log("Calling onStartGame from MainMenu");
        addDebugLog("Calling onStartGame callback");
        onStartGame();
        addDebugLog("onStartGame callback completed");
      } else {
        addDebugLog("onStartGame callback not provided!");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      addDebugLog(`Error starting game: ${error.message}`);
    }
  };

  const continueAfterDeath = () => {
    setShowDeathScreen(false);
    setActiveTab("upgrades");
  };


  const [isConnected, setIsConnected] = useState(false);
  // Death screen
  if (showDeathScreen && gameState.lastRunStats) {
    return (
      <div className="death-root">
        <div className="death-container">
          <h1 className="death-title">💀 YOU DIED 💀</h1>
          <div className="death-stats">
            <h3 className="death-stats-title">📊 Last Run Statistics</h3>
            <div className="death-stats-grid">
              <div>
                <strong>⏱️ Survival Time:</strong>
                <br />
                <span className="death-stat-green">
                  {formatTime(gameState.lastRunStats.survivalTime)}
                </span>
              </div>
              <div>
                <strong>📈 Level Reached:</strong>
                <br />
                <span className="death-stat-orange">
                  {gameState.lastRunStats.maxLevel}
                </span>
              </div>
              <div>
                <strong>⚔️ Enemies Killed:</strong>
                <br />
                <span className="death-stat-red">
                  {gameState.lastRunStats.enemiesKilled}
                </span>
              </div>
              <div>
                <strong>💰 Gold Earned:</strong>
                <br />
                <span className="death-stat-yellow">
                  {gameState.lastRunStats.goldEarned}
                </span>
              </div>
              <div>
                <strong>🎯 Experience Gained:</strong>
                <br />
                <span className="death-stat-blue">
                  {formatNumber(gameState.lastRunStats.experienceGained)}
                </span>
              </div>
              <div>
                <strong>💥 Damage Dealt:</strong>
                <br />
                <span className="death-stat-orange">
                  {formatNumber(gameState.lastRunStats.damageDealt)}
                </span>
              </div>
            </div>
            {gameState.lastRunStats.causeOfDeath && (
              <div className="death-cause">
                <strong>☠️ Cause of Death: Skill Issue</strong>
                {/* {gameState.lastRunStats.causeOfDeath} */}
              </div>
            )}
          </div>
          <div className="death-btn-row">
            <button onClick={continueAfterDeath} className="death-btn-continue">
              🏠 Continue to Menu
            </button>
            <button onClick={startGame} className="death-btn-retry">
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mainmenu-root">
      {/* Header */}
      <div className="mainmenu-header">
        <h1 className="mainmenu-title">Insomnus</h1>
        <div className="mainmenu-header-right">
          <div className="mainmenu-gold">
            💰 GOLD:{" "}
            <span className="mainmenu-gold-amount">
              {formatNumber(gameState.gold)}
            </span>
          </div>
          <button 
            onClick={startGame} 
            className={`mainmenu-start-btn${isGameLoading ? ' loading' : ''}`}
            disabled={isGameLoading}
          >
            {isGameLoading ? (
              <>
                <span className="loading-spinner-small"></span>
                {loadingStage === 'boot' && 'Initializing...'}
                {loadingStage === 'assets' && 'Loading Assets...'}
              </>
            ) : (
              '🎮 Start Game'
            )}
          </button>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="mainmenu-tabs">
        {["upgrades", "stats", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`mainmenu-tab${activeTab === tab ? " active" : ""}`}
          >
            {tab === "upgrades" && "⚡"} {tab === "stats" && "📊"}{" "}
            {tab === "settings" && "⚙️"} {tab}
          </button>
        ))}
      </div>
      {isGameLoading && (
        <div className="mainmenu-loading-overlay">
          <div className="mainmenu-loading-content">
            <div className="loading-spinner-large"></div>
            <h2 className="mainmenu-loading-title">Initializing Game</h2>
            <p className="mainmenu-loading-text">
              {loadingStage === 'boot' && 'Starting game engine...'}
              {loadingStage === 'assets' && 'Loading game assets...'}
            </p>
            <div className="mainmenu-loading-progress">
              <div className="mainmenu-loading-progress-bar">
                <div 
                  className="mainmenu-loading-progress-fill"
                  style={{
                    width: loadingStage === 'boot' ? '30%' : '90%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="mainmenu-content">
        {/* Upgrades Tab */}
        {activeTab === "upgrades" && (
          <div>
            {/* Category Filter */}
            <div className="mainmenu-categories">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`mainmenu-category${
                    selectedCategory === category ? " selected" : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {/* Upgrades Grid */}
            <div className="mainmenu-upgrades-grid">
              {filteredUpgrades.map((upgrade) => {
                const currentLevel = upgrade.level || 0;
                const isMaxed = upgrade.isMaxed || false;
                return (
                  <div
                    key={upgrade.id}
                    className={`mainmenu-upgrade${
                      currentLevel > 0 ? " upgraded" : ""
                    }`}
                  >
                    <div className="mainmenu-upgrade-header">
                      <div className="mainmenu-upgrade-title-row">
                        <span className="mainmenu-upgrade-icon">
                          {upgrade.icon || "⚡"}
                        </span>
                        <h3 className="mainmenu-upgrade-title">
                          {upgrade.name}
                        </h3>
                        <button
                          className="mainmenu-upgrade-info"
                          onMouseEnter={() => setShowTooltip(upgrade.id)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          ⓘ
                        </button>
                      </div>
                      <div className="mainmenu-upgrade-level">
                        Level {currentLevel}
                      </div>
                    </div>
                    {showTooltip === upgrade.id && (
                      <div className="mainmenu-upgrade-tooltip">
                        {upgrade.description}
                      </div>
                    )}
                    <div className="mainmenu-upgrade-values">
                      {upgrade.progress && (
                        <div>
                          <span>Progress: </span>
                          <span className="mainmenu-upgrade-current">
                            {upgrade.progress}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mainmenu-upgrade-actions">
                      {!isMaxed ? (
                        <button
                          onClick={() => purchaseUpgrade(upgrade.id)}
                          disabled={upgradeMutation.isPending}
                          className={`mainmenu-upgrade-btn${
                            upgradeMutation.isPending ? " disabled" : ""
                          }`}
                        >
                          {upgradeMutation.isPending ? "⏳ UPGRADING..." : "⬆️ UPGRADE"}
                        </button>
                      ) : (
                        <div className="mainmenu-upgrade-maxed">✅ MAXED</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div>
            <h2 className="mainmenu-stats-title">📊 STATISTICS</h2>
            <div className="mainmenu-stats-grid">
              {/* All-Time Stats */}
              <div className="mainmenu-stats-alltime">
                <h3 className="mainmenu-stats-alltime-title">
                  🏆 All-Time Records
                </h3>
                <div className="mainmenu-stats-alltime-list">
                  <div className="mainmenu-stats-row">
                    <span>🎮 Total Runs:</span>
                    <span className="mainmenu-stats-green">
                      {gameState.allTimeStats.totalRuns || 0}
                    </span>
                  </div>
                  <div className="mainmenu-stats-row">
                    <span>📈 Highest Level:</span>
                    <span className="mainmenu-stats-orange">
                      {gameState.allTimeStats.highestLevel || 1}
                    </span>
                  </div>
                  <div className="mainmenu-stats-row">
                    <span>⏱️ Longest Survival:</span>
                    <span className="mainmenu-stats-green">
                      {formatTime(
                        gameState.allTimeStats.longestSurvivalTime || 0
                      )}
                    </span>
                  </div>
                  <div className="mainmenu-stats-row">
                    <span>💰 Total Gold Earned:</span>
                    <span className="mainmenu-stats-yellow">
                      {formatNumber(
                        gameState.allTimeStats.totalGoldEarned || 0
                      )}
                    </span>
                  </div>
                  <div className="mainmenu-stats-row">
                    <span>⚔️ Enemies Killed:</span>
                    <span className="mainmenu-stats-red">
                      {formatNumber(
                        gameState.allTimeStats.totalEnemiesKilled || 0
                      )}
                    </span>
                  </div>
                  <div className="mainmenu-stats-row">
                    <span>📊 Average Survival:</span>
                    <span className="mainmenu-stats-blue">
                      {formatTime(
                        gameState.allTimeStats.averageSurvivalTime || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {/* Current Upgrades */}
              <div className="mainmenu-stats-upgrades">
                <h3 className="mainmenu-stats-upgrades-title">
                  ⚡ Current Upgrades
                </h3>
                <div className="mainmenu-stats-upgrades-list">
                  {backendUpgrades.map((upgrade) => {
                    const level = upgrade.level || 0;
                    return (
                      <div
                        key={upgrade.id}
                        className={`mainmenu-stats-upgrade-row${
                          level > 0 ? "" : " faded"
                        }`}
                      >
                        <span>
                          {upgrade.icon || "⚡"} {upgrade.name}:
                        </span>
                        <div>
                          <span className="mainmenu-stats-upgrade-value">
                            {upgrade.progress || "N/A"}
                          </span>
                          <span className="mainmenu-stats-upgrade-level">
                            (Lv {level})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="mainmenu-settings">
            <h2 className="mainmenu-settings-title">⚙️ SETTINGS</h2>
            <div className="mainmenu-settings-danger">
              <h3 className="mainmenu-settings-danger-title">⚠️ Danger Zone</h3>
              <p className="mainmenu-settings-danger-desc">
                This will reset all your progress including upgrades and
                statistics.
                <br />
                You will receive 25,000 gold to test upgrades.
              </p>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="mainmenu-settings-reset-btn"
              >
                🗑️ RESET ALL PROGRESS
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Notification */}
      {notification && (
        <div className="mainmenu-notification">{notification}</div>
      )}
      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="mainmenu-reset-overlay">
          <div className="mainmenu-reset-modal">
            <h3 className="mainmenu-reset-title">⚠️ Reset Progress?</h3>
            <p className="mainmenu-reset-desc">
              This action cannot be undone!
              <br />
              All upgrades and statistics will be lost.
            </p>
            <div className="mainmenu-reset-btn-row">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="mainmenu-reset-cancel-btn"
              >
                CANCEL
              </button>
              <button
                onClick={resetProgress}
                className="mainmenu-reset-confirm-btn"
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
