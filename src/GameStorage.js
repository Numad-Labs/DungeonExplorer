/**
 * Game storage utilities for saving and loading game data
 */

// Storage key
const STORAGE_KEY = 'survivor_game_save';

/**
 * Save game data to local storage
 * @param {Object} gameData - Game data to save
 * @returns {boolean} - Success or failure
 */
export function saveToLocalStorage(gameData) {
  try {
    const saveData = {
      gold: gameData.gold || 0,
      passiveUpgrades: gameData.passiveUpgrades || {},
      allTimeStats: gameData.allTimeStats || {
        totalRuns: 0,
        totalGoldEarned: 0,
        totalEnemiesKilled: 0,
        totalExperienceGained: 0,
        totalDamageDealt: 0,
        highestLevel: 1,
        longestSurvivalTime: 0,
        averageSurvivalTime: 0
      },

      lastRunStats: gameData.lastRunStats || null,
      savedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    console.log("Game data saved to local storage");
    return true;
  } catch (error) {
    console.error("Error saving to local storage:", error);
    return false;
  }
}

/**
 * Load game data from local storage
 * @returns {Object|null} - Loaded game data or null if not found
 */
export function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (!savedData) {
      console.log("No saved data found in local storage");
      return null;
    }
    
    const gameData = JSON.parse(savedData);
    console.log("Game data loaded from local storage:", gameData);
    
    return gameData;
  } catch (error) {
    console.error("Error loading from local storage:", error);
    return null;
  }
}

/**
 * Clear saved game data
 * @returns {boolean} - Success or failure
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Game data cleared from local storage");
    return true;
  } catch (error) {
    console.error("Error clearing local storage:", error);
    return false;
  }
}

/**
 * Check if there is saved game data
 * @returns {boolean} - True if saved data exists
 */
export function hasSavedData() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Reset all progress and give starting gold
 * @param {number} startingGold - Amount of gold to give after reset
 * @returns {boolean} - Success or failure
 */
export function resetProgress(startingGold = 500) {
  try {
    const resetData = {
      gold: startingGold,
      passiveUpgrades: {},
      allTimeStats: {
        totalRuns: 0,
        totalGoldEarned: 0,
        totalEnemiesKilled: 0,
        totalExperienceGained: 0,
        totalDamageDealt: 0,
        highestLevel: 1,
        longestSurvivalTime: 0,
        averageSurvivalTime: 0
      },

      lastRunStats: null,
      savedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
    console.log("Progress reset successfully with", startingGold, "starting gold");
    return true;
  } catch (error) {
    console.error("Error resetting progress:", error);
    return false;
  }
}