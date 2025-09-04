/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
// Old integration removed - now handled by React App
import { EventBus } from '../game/EventBus';
import AudioManager from '../audio/AudioManager';
/* END-USER-IMPORTS */

export default class Preload extends Phaser.Scene {

	constructor() {
		super("Preload");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorPreload() {
		this.load.pack("asset-pack", "./assets/asset-pack.json");
		
		// Load audio with absolute paths for deployment
		this.load.audio('characterDying', '/assets/SFX/character-dying.mp3');
		this.load.audio('menuSelection', '/assets/SFX/menu-selection.mp3');
		this.load.audio('levelUp', '/assets/SFX/level-up.mp3');
		this.load.audio('gameLoop', '/assets/SFX/game-loop.mp3');
		this.load.audio('menuDenied', '/assets/SFX/menu-denied.mp3');
		this.load.audio('select_sound', '/assets/SFX/menu-selection.mp3');
		
		// Add error handling for failed loads
		this.load.on('fileerror', (file) => {
			console.warn(`Failed to load: ${file.key} from ${file.url}`);
		});
		
		// Add file complete handler
		this.load.on('addfile', (file) => {
			console.log(`Loading: ${file.key}`);
		});
	}

	/** @returns {void} */
	editorCreate() {
		// guapen
		const guapen = this.add.image(505.0120544433594, 360, "guapen");
		guapen.scaleX = 0.32715486817515643;
		guapen.scaleY = 0.32715486817515643;

		// progressBar
		const progressBar = this.add.rectangle(553, 361, 256, 20);
		progressBar.setOrigin(0, 0);
		progressBar.isFilled = true;
		progressBar.fillColor = 14737632;

		// progressBarBg
		const progressBarBg = this.add.rectangle(553.0120849609375, 361, 256, 20);
		progressBarBg.setOrigin(0, 0);
		progressBarBg.fillColor = 14737632;
		progressBarBg.isStroked = true;

		// loadingText
		const loadingText = this.add.text(552.0120849609375, 329, "", {});
		loadingText.text = "Loading...";
		loadingText.setStyle({ "color": "#e0e0e0", "fontFamily": "arial", "fontSize": "20px" });

		this.progressBar = progressBar;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.GameObjects.Rectangle} */
	progressBar;

	/* START-USER-CODE */

	// Safe audio playing function
	playSound(key, config = {}) {
		try {
			// Check if sound exists and audio context is ready
			if (this.cache.audio.exists(key)) {
				// Resume audio context if suspended (common on mobile/web)
				if (this.sound.context && this.sound.context.state === 'suspended') {
					this.sound.context.resume().then(() => {
						return this.sound.play(key, { volume: 0.5, ...config });
					}).catch(err => console.warn(`Audio context resume failed:`, err));
				} else {
					return this.sound.play(key, { volume: 0.5, ...config });
				}
			} else {
				console.warn(`Sound '${key}' not found in cache`);
				return null;
			}
		} catch (error) {
			console.error(`Error playing sound '${key}':`, error);
			return null;
		}
	}

	preload() {
		try {
			this.editorCreate();
			this.editorPreload();

			const width = this.progressBar.width;
			
			this.load.on("progress", (progress) => {
				this.progressBar.width = progress * width;
			});
			
			this.load.on("complete", () => {
				console.log("All assets loaded. Exp texture exists:", this.textures.exists('Exp'));
				console.log("Health_Potion_01 texture exists:", this.textures.exists('Health_Potion_01'));
			});
		} catch (error) {
			console.error("Error in preload:", error);
		}
	}

	create() {
		// Enable audio unlock for mobile/web browsers
		this.sound.unlock();
		
		// Initialize AudioManager
		this.audioManager = new AudioManager(this);
		// Make it globally available
		window.audioManager = this.audioManager;
		
		// Check audio system and loading status
		console.log("Audio system:", this.sound.context ? 'WebAudio' : 'HTML5Audio');
		console.log("Audio context state:", this.sound.context ? this.sound.context.state : 'N/A');
		
		// Create easy-to-use global functions
		window.playGameSound = (key, config = {}) => {
			return this.audioManager.playSound(key, config);
		};
		
		window.playBackgroundMusic = (key, volume = 0.3) => {
			return this.audioManager.playBackgroundMusic(key, volume);
		};
		
		window.stopAllSounds = () => {
			this.audioManager.stopAllSounds();
		};
		
		window.setGameVolume = (volume) => {
			this.audioManager.setVolume(volume);
		};
		
		// Add test function
		window.testAudio = (key) => {
			console.log(`Testing audio: ${key}`);
			const result = this.audioManager.playSound(key);
			if (result) {
				console.log(`✓ Successfully played ${key}`);
			} else {
				console.log(`✗ Failed to play ${key}`);
			}
			return result;
		};
		
		console.log('🎵 Audio system initialized!');
		
		if (window.EventBus) {
			window.EventBus.emit('preload-complete');
		}
		window.dispatchEvent(new CustomEvent('gamePreloadComplete'));
	}
	
	createFallbackTexture() {
		try {
			const graphics = this.add.graphics();
			graphics.fillStyle(0x00ffff, 1);
			graphics.fillCircle(8, 8, 8);
			
			graphics.generateTexture('Exp', 16, 16);
			graphics.destroy();
			
			console.log("Created fallback Exp texture");
		} catch (error) {
			console.error("Error creating fallback texture:", error);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */
