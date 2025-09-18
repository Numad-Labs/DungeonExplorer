export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioEnabled = true;
        this.musicVolume = 0.5;
        this.soundVolume = 0.5;
        this.currentMusic = null;
        this.loadAudioSettings();
    }

    playSound(key, config = {}) {
        if (!this.audioEnabled) {
            return null;
        }

        try {
            if (typeof window.playSound === 'function') {
                return window.playSound(key, config);
            }
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

    playBackgroundMusic(key, volume = 1.0) {
        return this.playMusic(key, { volume });
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

    setVolume(volume) {
        try {
            this.scene.sound.volume = Math.max(0, Math.min(1, volume));
        } catch (error) {
            console.error('AudioManager: Error setting volume:', error);
        }
    }
    setAudioEnabled(enabled) {
        this.audioEnabled = enabled;
        if (!enabled) {
            this.stopAllSounds();
        }
    }

    loadAudioSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('survivor_audio_settings'));
            if (settings) {
                this.musicVolume = settings.musicVolume ?? 0.5;
                this.soundVolume = settings.soundVolume ?? 0.5;
                console.log('Audio settings loaded:', settings);
            }
        } catch (error) {
            console.log('Using default audio settings');
        }
    }

    playSoundEffect(key, config = {}) {
        if (!this.audioEnabled) {
            return null;
        }

        const soundConfig = {
            ...config,
            volume: (config.volume || 1) * this.soundVolume
        };

        return this.playSound(key, soundConfig);
    }

    playMusic(key, config = {}) {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.stop();
        }

        const musicConfig = {
            loop: true,
            ...config,
            volume: (config.volume || 1) * this.musicVolume
        };

        this.currentMusic = this.playSound(key, musicConfig);
        return this.currentMusic;
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.setVolume(this.musicVolume);
        }
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    getMusicVolume() {
        return this.musicVolume;
    }

    getSoundVolume() {
        return this.soundVolume;
    }

    isAudioAvailable(key) {
        return this.scene.cache.audio.exists(key);
    }

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

window.AudioManager = AudioManager;