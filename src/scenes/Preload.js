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
		this.load.pack("asset-pack", "assets/asset-pack.json");
		
		// Load audio files with the keys your game code expects
		this.load.audio('gameLoop', ['assets/SFX/game-loop.ogg', 'assets/SFX/game-loop.mp3']);
		this.load.audio('characterDying', ['assets/SFX/character-dying.ogg', 'assets/SFX/character-dying.mp3']);
		this.load.audio('menuSelection', ['assets/SFX/menu-selection.ogg', 'assets/SFX/menu-selection.mp3']);
		this.load.audio('levelUp', ['assets/SFX/level-up.ogg', 'assets/SFX/level-up.mp3']);
		this.load.audio('menuDenied', ['assets/SFX/menu-denied.ogg', 'assets/SFX/menu-denied.mp3']);
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
		// Create sound instances using camelCase keys that match your game code
		this.sounds = {
			'gameLoop': this.sound.add('gameLoop'),
			'characterDying': this.sound.add('characterDying'),
			'menuSelection': this.sound.add('menuSelection'),
			'levelUp': this.sound.add('levelUp'),
			'menuDenied': this.sound.add('menuDenied')
		};

		// Make sounds globally accessible
		window.gameSounds = this.sounds;

		// Test function
		window.testAudio = (key) => {
			try {
				if (this.sounds[key]) {
					this.sounds[key].play();
					console.log(`✓ Playing: ${key}`);
				} else {
					console.log(`✗ Sound not found: ${key}`);
				}
			} catch (error) {
				console.log(`✗ Error playing ${key}:`, error);
			}
		};

		// Status check function
		window.checkAudioStatus = () => {
			const keys = ['gameLoop', 'characterDying', 'menuSelection', 'levelUp', 'menuDenied'];
			console.log('Audio Status:');
			keys.forEach(key => {
				const exists = this.cache.audio.exists(key);
				const hasInstance = !!this.sounds[key];
				console.log(`${key}: ${exists ? '✅ Loaded' : '❌ Not Loaded'} | ${hasInstance ? '🔊 Sound Instance' : '🔇 No Instance'}`);
			});
		};

		console.log('Audio system ready!');
		console.log('Test with: window.testAudio("gameLoop")');
		console.log('Check status: window.checkAudioStatus()');
		
		EventBus.emit("current-scene-ready", this);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */
