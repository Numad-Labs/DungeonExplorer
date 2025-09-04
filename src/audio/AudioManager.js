/**
 * Audio Manager - Handles all audio playback with proper error handling
 * and web browser compatibility fixes
 */
import { getAudioKey } from './AudioKeyMapper.js';

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
     * Safe audio playing with deployment compatibility
     * @param {string} key - Audio key to play
     * @param {object} config - Audio configuration (volume, loop, etc.)
     * @returns {Phaser.Sound.BaseSound|null} - Sound instance or null if failed
     */
    playSound(key, config = {}) {
        if (!this.audioEnabled) {
            return null;
        }

        // Map game code keys to asset pack keys
        const audioKey = getAudioKey(key);

        if (this.failedAudio.has(audioKey)) {
            return null;
        }

        try {
            // Check if sound exists in cache
            if (!this.scene.cache.audio.exists(audioKey)) {
                console.warn(`AudioManager: Sound '${audioKey}' (from '${key}') not found in cache`);
                this.failedAudio.add(audioKey);
                return null;
            }

            // Default config
            const audioConfig = {
                volume: 0.5,
                ...config
            };

            // Resume audio context if suspended
            if (this.scene.sound.context && this.scene.sound.context.state === 'suspended') {
                this.scene.sound.context.resume()
                    .then(() => {
                        return this.scene.sound.play(audioKey, audioConfig);
                    })
                    .catch(err => {
                        console.warn(`AudioManager: Audio context resume failed for ${audioKey}:`, err);
                        this.failedAudio.add(audioKey);
                    });
            } else {
                // Play sound directly
                const sound = this.scene.sound.play(audioKey, audioConfig);
                if (sound) {
                    return sound;
                } else {
                    console.warn(`AudioManager: Failed to create sound instance for ${audioKey}`);
                    this.failedAudio.add(audioKey);
                    return null;
                }
            }
        } catch (error) {
            console.error(`AudioManager: Error playing sound '${audioKey}':`, error);
            this.failedAudio.add(audioKey);
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
        const audioKey = getAudioKey(key);
        return this.scene.cache.audio.exists(audioKey) && !this.failedAudio.has(audioKey);
    }

    /**
     * Reset failed audio cache (useful for retrying after fixes)
     */
    resetFailedAudio() {
        this.failedAudio.clear();
    }

    /**
     * Get audio loading status
     */
    getAudioStatus() {
        const gameCodeKeys = ['characterDying', 'menuSelection', 'levelUp', 'gameLoop', 'menuDenied'];
        const status = {};
        
        gameCodeKeys.forEach(key => {
            const audioKey = getAudioKey(key);
            status[`${key} -> ${audioKey}`] = {
                loaded: this.scene.cache.audio.exists(audioKey),
                failed: this.failedAudio.has(audioKey),
                available: this.isAudioAvailable(key)
            };
        });
        
        return status;
    }
}

// Make it globally available for easy access
window.AudioManager = AudioManager;
