import React, { useState, useEffect } from "react";
import "./MainMenuComponent.css";

const passiveUpgrades = [
  {
    id: "maxHealth",
    name: "Max Health",
    description: "Increase your maximum health points",
    icon: "❤️",
    baseValue: 100,
    valuePerLevel: 20,
    baseCost: 100,
    costMultiplier: 1.5,
    maxLevel: 15,
    category: "survival",
  },
  {
    id: "baseDamage",
    name: "Base Damage",
    description: "Increase your base weapon damage",
    icon: "⚔️",
    baseValue: 10,
    valuePerLevel: 2,
    baseCost: 150,
    costMultiplier: 1.6,
    maxLevel: 15,
    category: "combat",
  },
  {
    id: "moveSpeed",
    name: "Move Speed",
    description: "Increase your movement speed",
    icon: "💨",
    baseValue: 200,
    valuePerLevel: 15,
    baseCost: 125,
    costMultiplier: 1.4,
    maxLevel: 12,
    category: "mobility",
  },
  {
    id: "attackSpeed",
    name: "Attack Speed",
    description: "Increase your attack rate",
    icon: "⚡",
    baseValue: 1,
    valuePerLevel: 0.1,
    baseCost: 175,
    costMultiplier: 1.7,
    maxLevel: 10,
    category: "combat",
  },
  {
    id: "critChance",
    name: "Critical Chance",
    description: "Increase chance for critical hits",
    icon: "💥",
    baseValue: 5,
    valuePerLevel: 2,
    baseCost: 200,
    costMultiplier: 1.8,
    maxLevel: 10,
    category: "combat",
  },
  {
    id: "critDamage",
    name: "Critical Damage",
    description: "Increase critical hit damage multiplier",
    icon: "🔥",
    baseValue: 150,
    valuePerLevel: 25,
    baseCost: 250,
    costMultiplier: 1.9,
    maxLevel: 8,
    category: "combat",
  },
  {
    id: "pickupRange",
    name: "Pickup Range",
    description: "Increase item pickup range",
    icon: "🧲",
    baseValue: 50,
    valuePerLevel: 10,
    baseCost: 120,
    costMultiplier: 1.3,
    maxLevel: 12,
    category: "utility",
  },
  {
    id: "armor",
    name: "Armor",
    description: "Reduce damage taken from enemies",
    icon: "🛡️",
    baseValue: 0,
    valuePerLevel: 2,
    baseCost: 180,
    costMultiplier: 1.6,
    maxLevel: 10,
    category: "survival",
  },
  {
    id: "expMultiplier",
    name: "EXP Gain",
    description: "Increase experience gained from enemies",
    icon: "📈",
    baseValue: 100,
    valuePerLevel: 10,
    baseCost: 300,
    costMultiplier: 2.0,
    maxLevel: 8,
    category: "progression",
  },
  {
    id: "goldMultiplier",
    name: "Gold Gain",
    description: "Increase gold earned from enemies",
    icon: "💰",
    baseValue: 100,
    valuePerLevel: 20,
    baseCost: 350,
    costMultiplier: 2.2,
    maxLevel: 8,
    category: "progression",
  },
];

const MainMenu = ({ gameManager, onStartGame }) => {
  console.log({ gameManager, onStartGame });

  const [activeTab, setActiveTab] = useState("upgrades");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showTooltip, setShowTooltip] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [gameState, setGameState] = useState({
    gold: 500,
    passiveUpgrades: {},
    allTimeStats: {},
    lastRunStats: null,
    currentRunStats: {},
  });
  const [debugInfo, setDebugInfo] = useState([]);

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

    window.addEventListener("gameStateUpdated", handleGameStateUpdate);
    window.addEventListener("playerDeath", handlePlayerDeath);

    return () => {
      window.removeEventListener("gameStateUpdated", handleGameStateUpdate);
      window.removeEventListener("playerDeath", handlePlayerDeath);
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

  const filteredUpgrades =
    selectedCategory === "all"
      ? passiveUpgrades
      : passiveUpgrades.filter(
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
    const upgrade = passiveUpgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = gameState.passiveUpgrades[upgradeId]?.level || 0;

    if (currentLevel >= upgrade.maxLevel) {
      showNotification("Already at maximum level!");
      return;
    }

    const cost = Math.floor(
      upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel)
    );

    if (gameState.gold < cost) {
      showNotification("Not enough gold!");
      return;
    }

    console.log(`Attempting to purchase ${upgradeId} for ${cost} gold`);

    if (gameManager && gameManager.purchaseUpgrade) {
      const success = gameManager.purchaseUpgrade(upgradeId, cost);
      if (success) {
        const newLevel = currentLevel + 1;
        console.log(`Successfully purchased ${upgrade.name} level ${newLevel}`);
        showNotification(`${upgrade.name} upgraded to level ${newLevel}!`);

        const newGameState = {
          ...gameState,
          gold: gameManager.gold,
          passiveUpgrades: { ...gameManager.passiveUpgrades },
        };
        setGameState(newGameState);
      } else {
        showNotification("Purchase failed!");
      }
    } else {
      console.error("GameManager or purchaseUpgrade method not available");
      showNotification("Error: Game system not ready");
    }
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

  const formatValue = (upgrade, value) => {
    if (upgrade.id === "critChance") return `${value}%`;
    if (upgrade.id === "critDamage") return `${value}%`;
    if (upgrade.id === "expMultiplier" || upgrade.id === "goldMultiplier")
      return `${value}%`;
    return value;
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
        <div className="mainmenu-gold">
          💰 GOLD:{" "}
          <span className="mainmenu-gold-amount">
            {formatNumber(gameState.gold)}
          </span>
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
                const currentLevel =
                  gameState.passiveUpgrades[upgrade.id]?.level || 0;
                const currentValue =
                  gameState.passiveUpgrades[upgrade.id]?.value ||
                  upgrade.baseValue;
                const nextValue =
                  currentLevel < upgrade.maxLevel
                    ? upgrade.baseValue +
                      upgrade.valuePerLevel * (currentLevel + 1)
                    : null;
                const cost =
                  currentLevel < upgrade.maxLevel
                    ? Math.floor(
                        upgrade.baseCost *
                          Math.pow(upgrade.costMultiplier, currentLevel)
                      )
                    : null;
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
                          {upgrade.icon}
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
                        {currentLevel}/{upgrade.maxLevel}
                      </div>
                    </div>
                    {showTooltip === upgrade.id && (
                      <div className="mainmenu-upgrade-tooltip">
                        {upgrade.description}
                      </div>
                    )}
                    <div className="mainmenu-upgrade-values">
                      <div>
                        <span>Current: </span>
                        <span className="mainmenu-upgrade-current">
                          {formatValue(upgrade, currentValue)}
                        </span>
                      </div>
                      {nextValue !== null && (
                        <div>
                          <span>Next: </span>
                          <span className="mainmenu-upgrade-next">
                            {formatValue(upgrade, nextValue)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mainmenu-upgrade-actions">
                      {currentLevel < upgrade.maxLevel ? (
                        <>
                          <div className="mainmenu-upgrade-cost">
                            💰 {formatNumber(cost)}
                          </div>
                          <button
                            onClick={() =>
                              gameState.gold >= cost &&
                              purchaseUpgrade(upgrade.id)
                            }
                            disabled={gameState.gold < cost}
                            className={`mainmenu-upgrade-btn${
                              gameState.gold >= cost ? "" : " disabled"
                            }`}
                          >
                            ⬆️ UPGRADE
                          </button>
                        </>
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
                  {passiveUpgrades.map((upgrade) => {
                    const level =
                      gameState.passiveUpgrades[upgrade.id]?.level || 0;
                    const value =
                      gameState.passiveUpgrades[upgrade.id]?.value ||
                      upgrade.baseValue;
                    return (
                      <div
                        key={upgrade.id}
                        className={`mainmenu-stats-upgrade-row${
                          level > 0 ? "" : " faded"
                        }`}
                      >
                        <span>
                          {upgrade.icon} {upgrade.name}:
                        </span>
                        <div>
                          <span className="mainmenu-stats-upgrade-value">
                            {formatValue(upgrade, value)}
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
      {/* Start Game Button */}
      <button onClick={startGame} className="mainmenu-start-btn">
        {"🎮 Start Game"}
      </button>
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
