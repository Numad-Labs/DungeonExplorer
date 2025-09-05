/**
 * Audio Manager - Simple integration with Phaser audio system
 */
export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioEnabled = true;
    }

    /**
     * Simple audio playing using global playSound function
     * @param {string} key - Audio key to play
     * @param {object} config - Audio configuration (volume, loop, etc.)
     * @returns {Phaser.Sound.BaseSound|null} - Sound instance or null if failed
     */
    playSound(key, config = {}) {
        if (!this.audioEnabled) {
            return null;
        }

        try {
            // Use global playSound function if available
            if (typeof window.playSound === 'function') {
                return window.playSound(key, config);
            }
            // Fallback to direct scene method
            else if (this.scene.cache.audio.exists(key)) {
                return this.scene.sound.play(key, config);
            } else {
                console.warn(`AudioManager: Sound '${key}' not found`);
                return null;
            }
        } catch (error) {
            console.error(`AudioManager: Error playing sound '${key}':`, error);
            return null;
        }
    }

    /**
     * Play background music with loop
     * @param {string} key - Audio key for background music
     * @param {number} volume - Volume level (0-1)
     * @returns {Phaser.Sound.BaseSound|null} - Sound instance or null if failed
     */
    playBackgroundMusic(key, volume = 0.3) {
        return this.playSound(key, { 
            loop: true, 
            volume: volume 
        });
    }

    /**
     * Stop all sounds
     */
    stopAllSounds() {
        try {
            this.scene.sound.stopAll();
        } catch (error) {
            console.error('AudioManager: Error stopping sounds:', error);
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        try {
            this.scene.sound.volume = Math.max(0, Math.min(1, volume));
        } catch (error) {
            console.error('AudioManager: Error setting volume:', error);
        }
    }

    /**
     * Enable/disable all audio
     * @param {boolean} enabled - Whether audio should be enabled
     */
    setAudioEnabled(enabled) {
        this.audioEnabled = enabled;
        if (!enabled) {
            this.stopAllSounds();
        }
    }

    /**
     * Check if an audio key is available
     * @param {string} key - Audio key to check
     * @returns {boolean} - Whether the audio is available
     */
    isAudioAvailable(key) {
        return this.scene.cache.audio.exists(key);
    }

    /**
     * Get audio loading status for the camelCase keys
     */
    getAudioStatus() {
        const audioKeys = ['gameLoop', 'characterDying', 'menuSelection', 'levelUp', 'menuDenied'];
        const status = {};
        
        audioKeys.forEach(key => {
            status[key] = {
                loaded: this.scene.cache.audio.exists(key),
                available: this.isAudioAvailable(key)
            };
        });
        
        return status;
    }
}

// Make it globally available for easy access
window.AudioManager = AudioManager;
