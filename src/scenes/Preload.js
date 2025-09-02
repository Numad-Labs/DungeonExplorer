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
		this.load.pack("asset-pack", "./assets/asset-pack.json");
		
		// Load all audio files directly
		this.load.audio('characterDying', './assets/SFX/SFX%20charachter%20dying%20.ogg');
		this.load.audio('menuSelection', './assets/SFX/SFX%20menu%20selecetion%20.ogg');
		this.load.audio('levelUp', './assets/SFX/SFX%20level%20up.ogg');
		this.load.audio('gameLoop', './assets/SFX/In%20game%20loop.ogg');
		this.load.audio('menuDenied', './assets/SFX/SFX%20menu%20denied%20action%20.ogg');
		this.load.audio('select_sound', './assets/SFX/SFX%20menu%20selecetion%20.ogg');
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
		// Check audio system and loading status
		console.log("Audio system:", this.sound.context ? 'WebAudio' : 'HTML5Audio');
		console.log("Audio loaded - characterDying:", this.cache.audio.exists('characterDying'));
		console.log("Audio loaded - levelUp:", this.cache.audio.exists('levelUp'));
		console.log("Audio loaded - gameLoop:", this.cache.audio.exists('gameLoop'));
		console.log("Audio loaded - menuSelection:", this.cache.audio.exists('menuSelection'));
		console.log("Audio loaded - menuDenied:", this.cache.audio.exists('menuDenied'));
		console.log("Audio loaded - select_sound:", this.cache.audio.exists('select_sound'));
		
		// Add test function with audio context handling
		window.testAudio = (key) => {
			if (this.cache.audio.exists(key)) {
				console.log(`Playing ${key}`);
				
				// Resume audio context if suspended
				if (this.sound.context && this.sound.context.state === 'suspended') {
					console.log('Resuming audio context...');
					this.sound.context.resume().then(() => {
						this.sound.play(key, { volume: 0.5 });
					});
				} else {
					this.sound.play(key, { volume: 0.5 });
				}
			} else {
				console.error(`${key} not found`);
			}
		};
		console.log('Use window.testAudio("levelUp") to test sounds');
		
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