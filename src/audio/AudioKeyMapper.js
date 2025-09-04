/**
 * Audio Key Mapper - Maps game code keys to asset-pack.json keys
 */
export const AUDIO_KEY_MAP = {
    // Game code key -> Asset pack key
    'characterDying': 'character-dying',
    'menuSelection': 'menu-selection', 
    'levelUp': 'level-up',
    'gameLoop': 'game-loop',
    'menuDenied': 'menu-denied',
    'select_sound': 'menu-selection'
};

/**
 * Get the correct audio key for the asset pack
 * @param {string} key - Original key from game code
 * @returns {string} - Correct asset pack key
 */
export function getAudioKey(key) {
    // Return mapped key if exists, otherwise return original key
    return AUDIO_KEY_MAP[key] || key;
}

export default { AUDIO_KEY_MAP, getAudioKey };
