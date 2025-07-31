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
			
			try {
				this.load.image('Exp', 'assets/images/exp_orb.png');
				console.log("Started loading Exp texture");
			} catch (error) {
				console.error("Error loading Exp texture:", error);
				
				this.createFallbackTexture();
			}
			
			this.load.on("progress", (progress) => {
				this.progressBar.width = progress * width;
			});
			
			this.load.on("complete", () => {
				console.log("All assets loaded. Exp texture exists:", this.textures.exists('Exp'));
			});
		} catch (error) {
			console.error("Error in preload:", error);
		}
	}

	create() {
	if (!this.textures.exists('Exp')) {
	console.warn("Exp texture failed to load, creating fallback texture");
	this.createFallbackTexture();
	}
	
	console.log("Preload scene complete - waiting for manual game start");
	
	if (window.EventBus) {
		window.EventBus.emit('preload-complete');
	}
	window.dispatchEvent(new CustomEvent('gamePreloadComplete'));
	
	// Don't auto-start MainMapScene - wait for manual start from React
	// this.scene.start("MainMapScene");
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