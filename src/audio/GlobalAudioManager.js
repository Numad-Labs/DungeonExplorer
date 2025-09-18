import { loadAudioSettings } from '../GameStorage.js';

class GlobalAudioManager {
    constructor() {
        this.currentScene = null;
        this.musicVolume = 0.5;
        this.soundVolume = 0.5;
        this.loadSettings();
        
        window.musicVolume = this.musicVolume;
        window.soundVolume = this.soundVolume;
    }

    initialize(scene) {
        if (scene) {
            this.currentScene = scene;
            window.currentScene = scene;
            window.currentGameScene = scene;
            
            if (scene.sound) {
                scene.sound.volume = this.soundVolume;
                console.log('GlobalAudioManager initialized with scene:', scene.constructor.name);
                console.log('Applied volumes - Music:', this.musicVolume, 'Sound:', this.soundVolume);
            }
        }
    }

    loadSettings() {
        const settings = loadAudioSettings();
        if (settings) {
            this.musicVolume = settings.musicVolume ?? 0.5;
            this.soundVolume = settings.soundVolume ?? 0.5;
            window.musicVolume = this.musicVolume;
            window.soundVolume = this.soundVolume;
        }
    }

    getCurrentScene() {
        if (this.currentScene && this.currentScene.scene.isActive()) {
            return this.currentScene;
        }
        if (window.currentGameScene) {
            return window.currentGameScene;
        }
        if (window.game && window.game.scene) {
            const scenes = window.game.scene.getScenes(true);
            const activeScene = scenes.find(scene => scene.scene.isActive());
            if (activeScene) {
                this.currentScene = activeScene;
                return activeScene;
            }
        }
        return null;
    }

    playMusic(key, config = {}) {
        const scene = this.getCurrentScene();
        if (!scene || !scene.sound) return null;

        try {
            scene.sound.sounds.forEach(sound => {
                if (sound.loop && sound.isPlaying) {
                    sound.stop();
                }
            });

            const musicConfig = {
                loop: true,
                volume: this.musicVolume,
                ...config
            };

            const music = scene.sound.play(key, musicConfig);
            return music;
        } catch (error) {
            return null;
        }
    }

    playSoundEffect(key, config = {}) {
        const scene = this.getCurrentScene();
        if (!scene || !scene.sound) return null;

        try {
            const soundConfig = {
                volume: this.soundVolume,
                ...config
            };

            const sound = scene.sound.play(key, soundConfig);
            return sound;
        } catch (error) {
            return null;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        window.musicVolume = this.musicVolume;
        
        const scene = this.getCurrentScene();
        if (scene && scene.sound) {
            scene.sound.sounds.forEach(sound => {
                if (sound.loop && sound.isPlaying) {
                    sound.setVolume(this.musicVolume);
                }
            });
        }
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        window.soundVolume = this.soundVolume;
        
        const scene = this.getCurrentScene();
        if (scene && scene.sound) {
            // Set master volume for the scene
            scene.sound.volume = this.soundVolume;
        }
    }

    getVolumes() {
        return {
            musicVolume: this.musicVolume,
            soundVolume: this.soundVolume
        };
    }

    isReady() {
        return this.getCurrentScene() !== null;
    }
}
const globalAudioManager = new GlobalAudioManager();
window.gameAudioManager = globalAudioManager;

export default globalAudioManager;