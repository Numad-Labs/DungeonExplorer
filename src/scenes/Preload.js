/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { initializeMenu } from "../GameIntegration";
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
			
			// Load experience orb texture with error handling
			try {
				this.load.image('Exp', 'assets/images/exp_orb.png');
				console.log("Started loading Exp texture");
			} catch (error) {
				console.error("Error loading Exp texture:", error);
				
				// Create a fallback texture for Exp
				this.createFallbackTexture();
			}
			
			// Update progress bar
			this.load.on("progress", (progress) => {
				this.progressBar.width = progress * width;
			});
			
			// Log when all assets are loaded
			this.load.on("complete", () => {
				console.log("All assets loaded. Exp texture exists:", this.textures.exists('Exp'));
			});
		} catch (error) {
			console.error("Error in preload:", error);
		}
	}

	create() {
		// Verify if Exp texture was loaded successfully
		if (!this.textures.exists('Exp')) {
			console.warn("Exp texture failed to load, creating fallback texture");
			this.createFallbackTexture();
		}
		
		// Initialize the game menu
		try {
			// Initialize the menu (React component)
			console.log("Initializing game menu from Preload scene");
			this.menuControls = initializeMenu();
			
			// Store menu controls in game registry for global access
			this.game.registry.set('menuControls', this.menuControls);
			
			// Initialize game manager if not already done
			if (!this.game.registry.get('gameManager')) {
				console.log("GameManager not found, creating a new one");
				
				// Create a minimal GameManager if not available
				const gameManager = {
					gold: 500,
					passiveUpgrades: {},
					gameStats: {
						totalGoldEarned: 0,
						totalEnemiesKilled: 0,
						totalExperienceGained: 0,
						highestLevel: 1,
						longestSurvivalTime: 0
					},
					applyPassiveUpgrades: function() {
						console.log("Applied passive upgrades (placeholder)");
					},
					saveGame: function() {
						console.log("Game saved (placeholder)");
					}
				};
				
				this.game.registry.set('gameManager', gameManager);
			}
			
			console.log("Menu initialization complete");
		} catch (error) {
			console.error("Error initializing game menu:", error);
		}
		
		// Wait a moment for everything to initialize before proceeding
		this.time.delayedCall(100, () => {
			// Don't start MainMapScene automatically - let the menu handle it
			console.log("Preload complete - menu should be visible");
		});
	}
	
	// Create a simple circle texture as fallback
	createFallbackTexture() {
		try {
			// Create a circle texture as fallback
			const graphics = this.add.graphics();
			graphics.fillStyle(0x00ffff, 1); // Cyan color
			graphics.fillCircle(8, 8, 8);
			
			// Generate texture from graphics
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