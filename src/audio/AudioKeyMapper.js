/**
 * Audio Key Mapper - Maps old audio keys to new asset-pack.json keys
 */
export const AUDIO_KEY_MAP = {
    // Old key -> New key from asset-pack.json
    'characterDying': 'character-dying',
    'menuSelection': 'menu-selection', 
    'levelUp': 'level-up',
    'gameLoop': 'game-loop',
    'menuDenied': 'menu-denied',
    'select_sound': 'menu-selection' // Maps to same as menuSelection
};

/**
 * Get the correct audio key for the asset pack
 * @param {string} key - Original key or asset pack key
 * @returns {string} - Correct asset pack key
 */
export function getAudioKey(key) {
    // If it's already a valid asset pack key, return it
    if (key && (key.includes('-') || !AUDIO_KEY_MAP[key])) {
        return key;
    }
    
    // Map old key to new key
    return AUDIO_KEY_MAP[key] || key;
}

export default { AUDIO_KEY_MAP, getAudioKey };
