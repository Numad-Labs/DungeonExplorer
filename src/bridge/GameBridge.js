import { EventBus } from "../game/EventBus";
import {
  startGameSession,
  saveCheckpoint,
  endGameSession,
} from "../services/api/gameApiService";
import { getAllMaps } from "../services/api/gameApiService";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

/**
 * Simple Game Bridge for DungeonExplorer - enhances existing EventBus communication
 */
class GameBridge {
  constructor() {
    this.gameManager = null;
    this.currentScene = null;
    this.isConnected = false;
    this.sessionId = null;
    this.sessionEnding = false;
    this.lastSyncTime = 0;
    this.syncInterval = 5000; // 5 seconds
    this.maps = [];
    this.mapsLoading = false;
    this.mapsError = null;
    this.setupMutations();
    this.init();
    this.fetchMaps();
  }

  init() {
    this.startPolling();
    this.setupEventEnhancement();
    this.isConnected = true;
    console.log("GameBridge connected");
    console.log("GameBridge: Mutations setup complete");
    EventBus.emit("bridge-connected");
  }

  startPolling() {
    // Poll for game references every 100ms
    setInterval(() => {
      this.updateGameReferences();
      this.syncGameData();
    }, 100);
  }

  updateGameReferences() {
    const gameManagerFromRegistry = window.game?.registry?.get("gameManager");
    const gameManagerFromGlobal = window.gameManager;
    const gameManagerFromScene = window.currentGameScene?.gameManager;

    const newGameManager =
      gameManagerFromRegistry ||
      gameManagerFromGlobal ||
      gameManagerFromScene ||
      null;

    if (newGameManager && newGameManager !== this.gameManager) {
      this.gameManager = newGameManager;
      console.log("GameBridge: GameManager connected");
    }

    // Get current scene with better fallback logic
    const sceneFromGame = window.game?.scene?.getScene("MainMapScene");
    const sceneFromGlobal = window.currentGameScene;

    const newScene = sceneFromGame || sceneFromGlobal || null;

    if (newScene && newScene !== this.currentScene) {
      this.currentScene = newScene;
      console.log("GameBridge: Scene connected");

      if (newScene.player || newScene.playerPrefab) {
        this.player = newScene.player || newScene.playerPrefab;
        console.log("GameBridge: Player connected");
      }
    }
  }

  syncGameData() {
    if (!this.gameManager || !this.currentScene) return;

    // Enhanced player data
    const playerData = this.getPlayerData();
    EventBus.emit("bridge-player-data", playerData);

    // Enhanced game progress
    const gameProgress = this.getGameProgress();
    EventBus.emit("bridge-game-progress", gameProgress);

    // Backend sync (every 5 seconds)
    const now = Date.now();
    if (this.sessionId && now - this.lastSyncTime > this.syncInterval) {
      this.syncToBackend(playerData, gameProgress);
      this.lastSyncTime = now;
    }
  }

  getPlayerData() {
    const data = {
      health: 100,
      maxHealth: 100,
      healthPercentage: 100,
      experience: 0,
      maxExperience: 100,
      level: 1,
      experiencePercentage: 0,
      gold: 500,
      isAlive: true,
      isInGame: false,
    };

    // Priority order: Player object -> GameManager -> Scene -> defaults
    const player =
      this.player ||
      this.currentScene?.player ||
      this.currentScene?.playerPrefab;
    if (player) {
      data.health = player.health !== undefined ? player.health : data.health;
      data.maxHealth =
        player.maxHealth !== undefined ? player.maxHealth : data.maxHealth;
      data.isAlive = player.alive !== false && player.health > 0;
    }

    // Get from GameManager stats
    if (this.gameManager?.playerStats) {
      const stats = this.gameManager.playerStats;
      data.health = stats.health !== undefined ? stats.health : data.health;
      data.maxHealth =
        stats.maxHealth !== undefined ? stats.maxHealth : data.maxHealth;
      data.experience =
        stats.experience !== undefined ? stats.experience : data.experience;
      data.maxExperience =
        stats.nextLevelExp !== undefined
          ? stats.nextLevelExp
          : data.maxExperience;
      data.level = stats.level !== undefined ? stats.level : data.level;
    }

    // Get gold from GameManager
    if (this.gameManager) {
      data.gold =
        this.gameManager.gold !== undefined ? this.gameManager.gold : data.gold;
      data.isInGame = this.gameManager.isGameRunning || false;
    }

    // Calculate percentages safely
    data.healthPercentage =
      data.maxHealth > 0
        ? Math.max(0, (data.health / data.maxHealth) * 100)
        : 0;
    data.experiencePercentage =
      data.maxExperience > 0 ? (data.experience / data.maxExperience) * 100 : 0;

    return data;
  }

  getGameProgress() {
    const data = {
      gameTime: 0,
      formattedTime: "00:00",
      currentWave: 1,
      survivalTime: 0,
      isGameRunning: false,
    };

    // Get from GameManager
    if (this.gameManager) {
      data.survivalTime = this.gameManager.getCurrentSurvivalTime();
      data.isGameRunning = this.gameManager.isGameRunning;
    }

    // Get from UIManager timer (this fixes the timer issue)
    if (this.currentScene?.uiManager?.timer) {
      const elapsed = this.currentScene.uiManager.timer.elapsed || 0;
      data.gameTime = elapsed;
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      data.formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    // Get wave information
    if (this.currentScene?.uiManager?.lastWave) {
      data.currentWave = this.currentScene.uiManager.lastWave;
    } else if (this.currentScene?.currentWave) {
      data.currentWave = this.currentScene.currentWave;
    }

    return data;
  }

  setupEventEnhancement() {
    // Enhance existing health events
    EventBus.on("player-health-updated", (data) => {
      const enhancedData = {
        ...data,
        percentage: data.maxHP > 0 ? (data.currentHP / data.maxHP) * 100 : 0,
        isLowHealth: data.currentHP < data.maxHP * 0.25,
        isCritical: data.currentHP < data.maxHP * 0.1,
      };
      EventBus.emit("bridge-health-updated", enhancedData);
    });

    // Enhance existing gold events
    EventBus.on("player-gold-updated", (data) => {
      const enhancedData = {
        ...data,
        formatted: this.formatNumber(data.gold || 0),
      };
      EventBus.emit("bridge-gold-updated", enhancedData);
    });

    // Session lifecycle events
    EventBus.on("game-started", () => {
      console.log("GameBridge: Game started event received");
      this.startSession();
    });

    // Listen to the canonical death event from GameManager
    EventBus.on("player-died", (deathData) => {
      console.log("GameBridge: Player death event received", deathData);
      this.endSession(deathData);
    });
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }

  setupMutations() {
    console.log("GameBridge: Setting up mutations for API calls");

    // Note: These mutations would be used in React components that consume this bridge
    // For now, we'll create the mutation functions that can be used when needed
    this.startSessionMutation = {
      mutationFn: startGameSession,
      onSuccess: (response) => {
        console.log("GameBridge: Start session mutation success", response);
        this.sessionId = response.sessionId;
        this.lastSyncTime = Date.now();
        EventBus.emit("bridge-session-started", { sessionId: this.sessionId });
      },
      onError: (error) => {
        console.error("GameBridge: Start session mutation error", error);
      },
    };

    this.saveCheckpointMutation = {
      mutationFn: saveCheckpoint,
      onSuccess: (response, variables) => {
        console.log(
          "GameBridge: Save checkpoint mutation success",
          response,
          variables,
        );
      },
      onError: (error, variables) => {
        console.error(
          "GameBridge: Save checkpoint mutation error",
          error,
          variables,
        );
      },
    };

    this.endSessionMutation = {
      mutationFn: endGameSession,
      onSuccess: (response, variables) => {
        console.log(
          "GameBridge: End session mutation success",
          response,
          variables,
        );
        EventBus.emit("bridge-session-ended", {
          sessionId: this.sessionId,
          deathData: variables,
        });
        this.sessionId = null;
      },
      onError: (error, variables) => {
        console.error(
          "GameBridge: End session mutation error",
          error,
          variables,
        );
      },
    };
  }

  // Backend sync methods
  async startSession() {
    try {
      console.log("GameBridge: Starting session...");
      
      // Get main map ID from fetched maps
      const mainMap = this.getMainMap();
      const mapId = mainMap ? mainMap.id : "87224afa-25e3-4bce-8fce-0981f854e6b6"; // fallback to hardcoded ID
      
      // Format session start payload according to backend requirements
      const sessionData = {
        userId: this.getCurrentUserId(),
        mapId: mapId,
      };

      console.log("GameBridge: Session data prepared", sessionData);
      const response = await startGameSession(sessionData);
      console.log("GameBridge: Session API response", response);

      this.sessionId = response.sessionId;
      this.lastSyncTime = Date.now();
      console.log("GameBridge: Session started", this.sessionId, sessionData);
      EventBus.emit("bridge-session-started", { sessionId: this.sessionId });
    } catch (error) {
      console.error("GameBridge: Failed to start session", error);
      console.error("GameBridge: Error details", error.message, error.stack);
    }
  }

  async syncToBackend(playerData, gameProgress) {
    if (!this.sessionId) {
      console.log("GameBridge: No session ID available for sync");
      return;
    }

    try {
      console.log("GameBridge: Starting backend sync...");
      // Format checkpoint payload according to backend requirements
      const checkpointData = {
        sessionId: this.sessionId,
        xp: playerData.experience || 0,
        gold: playerData.gold || 0,
        position: this.getPlayerPosition(),
        skillsUsed: this.getSkillsUsedWithCounts(),
      };

      console.log("GameBridge: Checkpoint data prepared", checkpointData);
      const response = await saveCheckpoint(checkpointData);
      console.log("GameBridge: Checkpoint API response", response);
      console.log("GameBridge: Checkpoint saved:", checkpointData);
    } catch (error) {
      console.error("GameBridge: Failed to save checkpoint", error);
      console.error(
        "GameBridge: Checkpoint error details",
        error.message,
        error.stack,
      );
    }
  }

  getPlayerPosition() {
    // Get player position from current scene
    if (this.currentScene?.player) {
      const x = Math.floor(this.currentScene.player.x || 0);
      const y = Math.floor(this.currentScene.player.y || 0);
      return `x${x}y${y}`;
    }

    // Get from playerPrefab if available
    if (this.player) {
      const x = Math.floor(this.player.x || 0);
      const y = Math.floor(this.player.y || 0);
      return `x${x}y${y}`;
    }

    return "x0y0";
  }

  getSkillsUsedWithCounts() {
    // Get skills with usage counts from GameManager
    if (this.gameManager?.playerStats?.skillsUsed) {
      return this.gameManager.playerStats.skillsUsed.map((skill) => ({
        skillId: skill.skillId,
        uses: skill.uses || skill.count || 1,
      }));
    }

    // Get from scene if available
    if (this.currentScene?.skillsUsed) {
      return this.currentScene.skillsUsed;
    }

    // Default empty array
    return [];
  }

  async endSession(deathData = {}) {
    // Prevent multiple calls to endSession
    if (this.sessionEnding) {
      console.log(
        "GameBridge: Session already ending, ignoring duplicate call",
      );
      return;
    }

    if (!this.sessionId) {
      console.log(
        "GameBridge: No session ID available, but still sending death data",
      );
    }

    this.sessionEnding = true;

    try {
      console.log("GameBridge: Ending session...", deathData);
      // Format death payload according to backend requirements
      const deathPayload = {
        userId: this.getCurrentUserId(),
        deathReason: this.getDeathReason(deathData),
        causeOfDeath: this.getDeathReason(deathData),
        survivalTime:
          deathData.survivalTime || this.getGameProgress().survivalTime || 0,
        enemiesKilled: deathData.enemiesKilled || 0,
        goldEarned: deathData.goldEarned || 0,
        maxLevel: deathData.maxLevel || 1,
        kills: this.formatKillsData(deathData),
        skillsUsed: this.getSkillsUsed(),
        perfectRun: this.isPerfectRun(deathData),
        achievementPoints: this.calculateAchievementPoints(deathData),
      };

      console.log("GameBridge: Death payload prepared", deathPayload);
      console.log("GameBridge: Attempting to send death data to API...");
      const response = await endGameSession(deathPayload);
      console.log("GameBridge: End session API response", response);
      console.log("GameBridge: Session ended with death data:", deathPayload);
      EventBus.emit("bridge-session-ended", {
        sessionId: this.sessionId,
        deathData: deathPayload,
      });

      // Invalidate Dashboard data after session ends
      EventBus.emit("invalidate-dashboard-data");
      console.log("GameBridge: Dashboard data invalidation requested");

      this.sessionId = null;
    } catch (error) {
      console.error("GameBridge: Failed to end session", error);
      console.error(
        "GameBridge: End session error details",
        error.message,
        error.stack,
      );
    } finally {
      this.sessionEnding = false;
    }
  }

  getCurrentUserId() {
    // Get from localStorage or auth context
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId || payload.sub;
      } catch (e) {
        console.warn("Failed to parse user ID from token");
      }
    }
    return null;
  }

  getCurrentMapId() {
    // Get current map/scene ID
    if (this.currentScene?.mapId) {
      return this.currentScene.mapId;
    }

    // Get from scene key/name
    if (this.currentScene?.scene?.key) {
      return this.getMapIdFromSceneKey(this.currentScene.scene.key);
    }

    // Get from GameManager if available
    if (this.gameManager?.currentMapId) {
      return this.gameManager.currentMapId;
    }

    // Default to main map
    return "a1b32a8b-0ff3-432c-b787-dd1713f580d9";
  }

  getMapIdFromSceneKey(sceneKey) {
    // Map scene keys to map IDs
    const sceneToMapId = {
      MainMapScene: "a1b32a8b-0ff3-432c-b787-dd1713f580d9",
      MiniMapBeachScene: "b2c43b9c-1aa4-543d-c898-ee2824g691ea",
      MiniMapDarkForastScene: "c3d54cad-2bb5-654e-d9a9-ff3935h7a2fb",
      MiniMapLavaScene: "d4e65dbe-3cc6-765f-eaba-004046i8b3gc",
      MiniMapBossFightScene: "e5f76ecf-4dd7-876g-fbc-115157j9c4hd",
    };

    return sceneToMapId[sceneKey] || "a1b32a8b-0ff3-432c-b787-dd1713f580d9";
  }

  getDeathReason(deathData) {
    if (deathData.deathReason) return deathData.deathReason;
    if (deathData.enemiesKilled === 0)
      return "You barely survived the first wave";
    if (deathData.survivalTime < 30)
      return "Quick death, better luck next time";
    return "You have failed emperor";
  }

  formatKillsData(deathData) {
    const kills = [];

    if (deathData.enemiesKilled) {
      kills.push({ type: "regular", count: deathData.enemiesKilled });
    }

    if (deathData.bossKills) {
      kills.push({ type: "boss", count: deathData.bossKills });
    }

    // Default if no kills data
    if (kills.length === 0) {
      kills.push({ type: "regular", count: 0 });
    }

    return kills;
  }

  getSkillsUsed() {
    // Get skills for death payload (with tier instead of uses)
    if (this.gameManager?.playerStats?.skillsUsed) {
      return this.gameManager.playerStats.skillsUsed.map((skill) => ({
        skillId: skill.skillId,
        tier: skill.tier || skill.level || 1,
      }));
    }

    // Get from scene if available
    if (this.currentScene?.skillsUsed) {
      return this.currentScene.skillsUsed.map((skill) => ({
        skillId: skill.skillId,
        tier: skill.tier || skill.level || 1,
      }));
    }

    // Default empty skills
    return [];
  }

  isPerfectRun(deathData) {
    // Perfect run logic - no damage taken, survived certain time
    const playerData = this.getPlayerData();
    return (
      playerData.health === playerData.maxHealth &&
      deathData.survivalTime > 60 &&
      deathData.enemiesKilled > 10
    );
  }

  calculateAchievementPoints(deathData) {
    let points = 0;

    // Base points for survival time (10 points per second)
    points += (deathData.survivalTime || 0) * 10;

    // Points for kills (100 per regular enemy, 1000 per boss)
    points += (deathData.enemiesKilled || 0) * 100;
    points += (deathData.bossKills || 0) * 1000;

    // Perfect run bonus
    if (this.isPerfectRun(deathData)) {
      points *= 2;
    }

    return points;
  }

  // Map fetching methods
  async fetchMaps() {
    this.mapsLoading = true;
    this.mapsError = null;

    try {
      console.log("GameBridge: Fetching maps...");
      const maps = await getAllMaps();
      this.maps = maps || [];
      console.log("GameBridge: Maps fetched successfully", this.maps.data);
      EventBus.emit("bridge-maps-loaded", this.maps);
    } catch (error) {
      console.error("GameBridge: Failed to fetch maps", error);
      this.mapsError = error.message || "Failed to fetch maps";
      EventBus.emit("bridge-maps-error", this.mapsError);
    } finally {
      this.mapsLoading = false;
    }
  }

  getMaps() {
    return {
      data: this.maps,
      loading: this.mapsLoading,
      error: this.mapsError,
    };
  }

  getMapById(mapId) {
    return this.maps.find((map) => map.id === mapId) || null;
  }

  getMainMap() {
    // Find the main map - look for maps with isMain flag or name containing "main"
    const mapsData = Array.isArray(this.maps) ? this.maps : this.maps?.data || [];
    
    return mapsData.find((map) => 
      map.isMain || 
      map.name?.toLowerCase().includes('main') ||
      map.type?.toLowerCase() === 'main'
    ) || mapsData[0]; // fallback to first map if no main map found
  }

  getCurrentMap() {
    const currentMapId = this.getCurrentMapId();
    return this.getMapById(currentMapId);
  }

  async refreshMaps() {
    await this.fetchMaps();
  }

  // Methods for React components
  getGameState() {
    return {
      player: this.getPlayerData(),
      progress: this.getGameProgress(),
      connected: this.isConnected,
      sessionId: this.sessionId,
      maps: this.getMaps(),
    };
  }

  isGameReady() {
    return !!(this.gameManager && this.currentScene);
  }

  // Manual sync methods for external use
  async forceSyncToBackend() {
    if (!this.sessionId) {
      console.warn("GameBridge: No active session to sync");
      return;
    }

    console.log("GameBridge: Force sync requested");
    const playerData = this.getPlayerData();
    const gameProgress = this.getGameProgress();
    console.log("GameBridge: Force sync data", { playerData, gameProgress });
    await this.syncToBackend(playerData, gameProgress);
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      isActive: !!this.sessionId,
      lastSyncTime: this.lastSyncTime,
    };
  }
}

// Singleton instance
let bridgeInstance = null;

export const getBridge = () => {
  if (!bridgeInstance) {
    bridgeInstance = new GameBridge();
  }
  return bridgeInstance;
};

export default GameBridge;
