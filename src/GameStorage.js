// GameStorage.js - Local storage utilities
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
    // Format the data for storage
    const saveData = {
      gold: gameData.gold || 0,
      passiveUpgrades: gameData.passiveUpgrades || {},
      gameStats: gameData.gameStats || {
        totalGoldEarned: 0,
        totalEnemiesKilled: 0,
        totalExperienceGained: 0,
        highestLevel: 1,
        longestSurvivalTime: 0
      },
      // You can add additional data to save here
      savedAt: new Date().toISOString()
    };
    
    // Save to local storage
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
    // Get data from local storage
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (!savedData) {
      console.log("No saved data found in local storage");
      return null;
    }
    
    // Parse the saved data
    const gameData = JSON.parse(savedData);
    console.log("Game data loaded from local storage");
    
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