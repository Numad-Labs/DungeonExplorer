/**
 * Audio Manager - Handles all audio playback with proper error handling
 * and web browser compatibility fixes
 */
export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioEnabled = true;
        this.failedAudio = new Set();
        this.audioContextResumed = false;
        
        // Bind methods to maintain context
        this.playSound = this.playSound.bind(this);
        this.setupAutoResume = this.setupAutoResume.bind(this);
        
        this.setupAutoResume();
    }

    /**
     * Auto-resume audio context on user interaction
     */
    setupAutoResume() {
        const resumeAudioContext = () => {
            if (this.scene.sound.context && this.scene.sound.context.state === 'suspended') {
                console.log('AudioManager: Auto-resuming audio context...');
                this.scene.sound.context.resume()
                    .then(() => {
                        this.audioContextResumed = true;
                        console.log('AudioManager: Audio context resumed successfully');
                    })
                    .catch(err => {
                        console.warn('AudioManager: Failed to resume audio context:', err);
                    });
            } else {
                this.audioContextResumed = true;
            }
            
            // Remove the event listeners after first use
            document.removeEventListener('click', resumeAudioContext);
            document.removeEventListener('touchstart', resumeAudioContext);
            document.removeEventListener('keydown', resumeAudioContext);
        };
        
        // Add event listeners for user interaction
        document.addEventListener('click', resumeAudioContext);
        document.addEventListener('touchstart', resumeAudioContext);
        document.addEventListener('keydown', resumeAudioContext);
    }

    /**
     * Safe audio playing with comprehensive error handling
     * @param {string} key - Audio key to play
     * @param {object} config - Audio configuration (volume, loop, etc.)
     * @returns {Phaser.Sound.BaseSound|null} - Sound instance or null if failed
     */
    playSound(key, config = {}) {
        if (!this.audioEnabled) {
            console.debug(`AudioManager: Audio disabled, skipping ${key}`);
            return null;
        }

        if (this.failedAudio.has(key)) {
            console.debug(`AudioManager: Audio ${key} previously failed, skipping`);
            return null;
        }

        try {
            // Check if sound exists in cache
            if (!this.scene.cache.audio.exists(key)) {
                console.warn(`AudioManager: Sound '${key}' not found in cache`);
                this.failedAudio.add(key);
                return null;
            }

            // Default config
            const audioConfig = {
                volume: 0.5,
                ...config
            };

            // Resume audio context if needed
            if (this.scene.sound.context && this.scene.sound.context.state === 'suspended') {
                this.scene.sound.context.resume()
                    .then(() => {
                        return this.scene.sound.play(key, audioConfig);
                    })
                    .catch(err => {
                        console.warn(`AudioManager: Audio context resume failed for ${key}:`, err);
                        this.failedAudio.add(key);
                    });
            } else {
                // Play sound directly
                const sound = this.scene.sound.play(key, audioConfig);
                if (sound) {
                    console.debug(`AudioManager: Playing ${key}`);
                    return sound;
                } else {
                    console.warn(`AudioManager: Failed to create sound instance for ${key}`);
                    this.failedAudio.add(key);
                    return null;
                }
            }
        } catch (error) {
            console.error(`AudioManager: Error playing sound '${key}':`, error);
            this.failedAudio.add(key);
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
            console.debug('AudioManager: Stopped all sounds');
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
            console.debug(`AudioManager: Set master volume to ${volume}`);
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
        console.debug(`AudioManager: Audio ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Check if an audio key is available
     * @param {string} key - Audio key to check
     * @returns {boolean} - Whether the audio is available
     */
    isAudioAvailable(key) {
        return this.scene.cache.audio.exists(key) && !this.failedAudio.has(key);
    }

    /**
     * Reset failed audio cache (useful for retrying after fixes)
     */
    resetFailedAudio() {
        this.failedAudio.clear();
        console.debug('AudioManager: Reset failed audio cache');
    }

    /**
     * Get audio loading status
     */
    getAudioStatus() {
        const allAudioKeys = ['characterDying', 'menuSelection', 'levelUp', 'gameLoop', 'menuDenied', 'select_sound'];
        const status = {};
        
        allAudioKeys.forEach(key => {
            status[key] = {
                loaded: this.scene.cache.audio.exists(key),
                failed: this.failedAudio.has(key),
                available: this.isAudioAvailable(key)
            };
        });
        
        return status;
    }
}

// Make it globally available for easy access
window.AudioManager = AudioManager;
