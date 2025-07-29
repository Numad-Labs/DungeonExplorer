import { useState, useEffect, useCallback } from 'react';
import { EventBus } from '../game/EventBus';
import { getBridge } from './GameBridge';

/**
 * Hook to connect to the game bridge system
 */
export function useBridge() {
  const [bridge] = useState(() => getBridge());
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const handleBridgeConnected = () => {
      setIsConnected(true);
    };

    EventBus.on('bridge-connected', handleBridgeConnected);

    if (bridge.isConnected) {
      setIsConnected(true);
    }

    return () => {
      EventBus.off('bridge-connected', handleBridgeConnected);
    };
  }, [bridge]);

  const getGameState = useCallback(() => {
    return bridge.getGameState();
  }, [bridge]);

  const purchaseUpgrade = useCallback((upgradeId, cost) => {
    return bridge.purchaseUpgrade(upgradeId, cost);
  }, [bridge]);

  const addGold = useCallback((amount) => {
    bridge.addGold(amount);
  }, [bridge]);

  const startNewGame = useCallback(() => {
    bridge.startNewGame();
  }, [bridge]);

  return {
    bridge,
    isConnected,
    isGameReady: bridge.isGameReady(),
    getGameState,
    purchaseUpgrade,
    addGold,
    startNewGame
  };
}

/**
 * Hook for enhanced player data
 */
export function usePlayerData() {
  const [playerData, setPlayerData] = useState({
    health: 100,
    maxHealth: 100,
    healthPercentage: 100,
    experience: 0,
    maxExperience: 100,
    level: 1,
    experiencePercentage: 0,
    gold: 500,
    isAlive: true,
    isInGame: false
  });

  useEffect(() => {
    const handlePlayerData = (data) => {
      setPlayerData(data);
    };

    const handleHealthUpdate = (data) => {
      setPlayerData(prev => ({
        ...prev,
        health: data.currentHP,
        maxHealth: data.maxHP,
        healthPercentage: data.percentage,
        isAlowHealth: data.isLowHealth,
        isCritical: data.isCritical
      }));
    };

    const handleExperienceUpdate = (data) => {
      setPlayerData(prev => ({
        ...prev,
        experience: data.currentExp,
        maxExperience: data.maxExp,
        experiencePercentage: data.percentage,
        expToNext: data.expToNext,
        canLevelUp: data.canLevelUp
      }));
    };

    const handleGoldUpdate = (data) => {
      setPlayerData(prev => ({
        ...prev,
        gold: data.gold
      }));
    };

    // Listen to bridge events
    EventBus.on('bridge-player-data', handlePlayerData);
    EventBus.on('bridge-health-updated', handleHealthUpdate);
    EventBus.on('bridge-experience-updated', handleExperienceUpdate);
    EventBus.on('bridge-gold-updated', handleGoldUpdate);
    EventBus.on('player-health-updated', handleHealthUpdate);
    EventBus.on('player-stats-updated', (data) => {
      if (data.gold !== undefined) {
        handleGoldUpdate(data);
      }
    });

    return () => {
      EventBus.off('bridge-player-data', handlePlayerData);
      EventBus.off('bridge-health-updated', handleHealthUpdate);
      EventBus.off('bridge-experience-updated', handleExperienceUpdate);
      EventBus.off('bridge-gold-updated', handleGoldUpdate);
      EventBus.off('player-health-updated', handleHealthUpdate);
      EventBus.off('player-stats-updated', handleGoldUpdate);
    };
  }, []);

  return playerData;
}

/**
 * Hook for enhanced game progress data (replaces polling in Timer)
 */
export function useGameProgress() {
  const [gameProgress, setGameProgress] = useState({
    gameTime: 0,
    formattedTime: '00:00',
    currentWave: 1,
    survivalTime: 0,
    isGameRunning: false,
    difficulty: 1
  });

  useEffect(() => {
    const handleGameProgress = (data) => {
      setGameProgress(data);
    };

    const handleWaveUpdate = (data) => {
      setGameProgress(prev => ({
        ...prev,
        currentWave: data.wave
      }));
    };

    const handleGameStateChanged = (data) => {
      setGameProgress(prev => ({
        ...prev,
        isGameRunning: data.isGameRunning
      }));
    };

    EventBus.on('bridge-game-progress', handleGameProgress);
    EventBus.on('bridge-wave-updated', handleWaveUpdate);
    EventBus.on('bridge-game-state-changed', handleGameStateChanged);
    EventBus.on('wave-notification', handleWaveUpdate);
    EventBus.on('game-started', () => handleGameStateChanged({ isGameRunning: true }));
    EventBus.on('game-stopped', () => handleGameStateChanged({ isGameRunning: false }));

    return () => {
      EventBus.off('bridge-game-progress', handleGameProgress);
      EventBus.off('bridge-wave-updated', handleWaveUpdate);
      EventBus.off('bridge-game-state-changed', handleGameStateChanged);
      EventBus.off('wave-notification', handleWaveUpdate);
      EventBus.off('game-started', handleGameStateChanged);
      EventBus.off('game-stopped', handleGameStateChanged);
    };
  }, []);

  return gameProgress;
}

/**
 * Hook for game notifications
 */
export function useGameNotifications() {
  const [notification, setNotification] = useState(null);
  const [lastWaveShown, setLastWaveShown] = useState(0);

  useEffect(() => {
    const handleWaveNotification = (data) => {
      const waveNumber = data.wave || data.value || 1;
      
      // Prevent duplicate wave notifications
      if (waveNumber <= lastWaveShown) {
        console.log(`Wave ${waveNumber} notification already shown, skipping...`);
        return;
      }
      
      setLastWaveShown(waveNumber);
      
      const notificationData = {
        id: Date.now(),
        text: `WAVE ${waveNumber}`,
        type: 'wave',
        timestamp: Date.now()
      };

      setNotification(notificationData);
      console.log(`Showing wave ${waveNumber} notification`);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    };

    const handlePlayerDeath = (data) => {
      const notificationData = {
        id: Date.now(),
        text: 'GAME OVER',
        type: 'death',
        timestamp: Date.now()
      };

      setNotification(notificationData);

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    EventBus.on('bridge-wave-updated', handleWaveNotification);
    EventBus.on('bridge-player-death', handlePlayerDeath);
    EventBus.on('wave-notification', handleWaveNotification);
    EventBus.on('player-death', handlePlayerDeath);

    return () => {
      EventBus.off('bridge-wave-updated', handleWaveNotification);
      EventBus.off('bridge-player-death', handlePlayerDeath);
      EventBus.off('wave-notification', handleWaveNotification);
      EventBus.off('player-death', handlePlayerDeath);
    };
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    clearNotification
  };
}

/**
 * Hook for game upgrades
 */
export function useGameUpgrades() {
  const { bridge, isConnected } = useBridge();
  const [upgrades, setUpgrades] = useState({
    available: {},
    gold: 0
  });

  useEffect(() => {
    if (!isConnected) return;

    const updateUpgrades = () => {
      const gameState = bridge.getGameState();
      if (gameState?.player) {
        setUpgrades({
          available: bridge.gameManager?.passiveUpgrades || {},
          gold: gameState.player.gold || 0
        });
      }
    };

    // Update on gold changes
    const handleGoldUpdate = (data) => {
      setUpgrades(prev => ({
        ...prev,
        gold: data.gold || 0
      }));
    };

    const handleUpgradePurchased = (data) => {
      setUpgrades(prev => ({
        ...prev,
        gold: data.remainingGold
      }));
    };

    EventBus.on('bridge-gold-updated', handleGoldUpdate);
    EventBus.on('bridge-upgrade-purchased', handleUpgradePurchased);

    // Initial update
    updateUpgrades();

    // Periodic update
    const interval = setInterval(updateUpgrades, 1000);

    return () => {
      EventBus.off('bridge-gold-updated', handleGoldUpdate);
      EventBus.off('bridge-upgrade-purchased', handleUpgradePurchased);
      clearInterval(interval);
    };
  }, [bridge, isConnected]);

  const purchaseUpgrade = useCallback((upgradeId, cost) => {
    return bridge.purchaseUpgrade(upgradeId, cost);
  }, [bridge]);

  const canAfford = useCallback((cost) => {
    return upgrades.gold >= cost;
  }, [upgrades.gold]);

  const getUpgradeLevel = useCallback((upgradeId) => {
    return upgrades.available[upgradeId]?.level || 0;
  }, [upgrades.available]);

  const getUpgradeValue = useCallback((upgradeId) => {
    return upgrades.available[upgradeId]?.value || 0;
  }, [upgrades.available]);

  return {
    upgrades: upgrades.available,
    gold: upgrades.gold,
    purchaseUpgrade,
    canAfford,
    getUpgradeLevel,
    getUpgradeValue
  };
}

/**
 * Combined hook for all game data
 */
export function useGameData() {
  const bridge = useBridge();
  const playerData = usePlayerData();
  const gameProgress = useGameProgress();
  const notifications = useGameNotifications();
  const upgrades = useGameUpgrades();

  return {
    bridge,
    player: playerData,
    progress: gameProgress,
    notifications,
    upgrades,
    isConnected: bridge.isConnected,
    isGameReady: bridge.isGameReady
  };
}