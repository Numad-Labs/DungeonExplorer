/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
// Old integration removed - now handled by React App
import { EventBus } from '../game/EventBus';
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
		// Only load asset pack - it already contains all audio files with correct camelCase keys
		this.load.pack("asset-pack", "assets/asset-pack.json");
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

	preload() {
		this.editorCreate();
		this.editorPreload();

		const width = this.progressBar.width;
		
		this.load.on("progress", (progress) => {
			this.progressBar.width = progress * width;
		});
		
		this.load.on("complete", () => {
			console.log("All assets loaded");
		});
	}

	create() {
		// Enable audio unlock for web browsers (important!)
		this.sound.unlock();
		
		// Check which audio files loaded successfully from asset-pack.json
		const audioKeys = ['gameLoop', 'characterDying', 'menuSelection', 'levelUp', 'menuDenied'];
		
		console.log('🎵 Audio loading status:');
		audioKeys.forEach(key => {
			if (this.cache.audio.exists(key)) {
				console.log(`✅ ${key}: Loaded from asset pack`);
			} else {
				console.log(`❌ ${key}: Failed to load`);
			}
		});
		
		// Create sound instances using Phaser's simple method
		this.sounds = {};
		audioKeys.forEach(key => {
			if (this.cache.audio.exists(key)) {
				try {
					this.sounds[key] = this.sound.add(key);
				} catch (error) {
					console.warn(`Could not create sound instance for ${key}:`, error);
				}
			}
		});

		// Make sounds globally accessible
		window.gameSounds = this.sounds;
		
		// Simple global play function
		window.playSound = (key, config = {}) => {
			try {
				if (this.sounds[key]) {
					return this.sounds[key].play(config);
				} else {
					console.warn(`Sound '${key}' not available`);
					return null;
				}
			} catch (error) {
				console.error(`Error playing sound '${key}':`, error);
				return null;
			}
		};

		// Test function
		window.testAudio = (key) => {
			return window.playSound(key, { volume: 0.5 });
		};

		// Status check function
		window.checkAudioStatus = () => {
			console.log('🎵 Audio System Status:');
			console.log(`- Audio Context: ${this.sound.context ? 'Available' : 'Not Available'}`);
			console.log(`- Context State: ${this.sound.context?.state || 'Unknown'}`);
			console.log('- Sound Files:');
			audioKeys.forEach(key => {
				const exists = this.cache.audio.exists(key);
				const hasInstance = !!this.sounds[key];
				console.log(`  ${key}: Cache=${exists ? '✅' : '❌'} | Instance=${hasInstance ? '🔊' : '🔇'}`);
			});
		};

		console.log('🔊 Audio system ready!');
		console.log('Test with: window.testAudio("gameLoop")');
		console.log('Check status: window.checkAudioStatus()');
		
		EventBus.emit("current-scene-ready", this);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */
