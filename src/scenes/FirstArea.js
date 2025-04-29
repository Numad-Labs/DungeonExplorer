// You can write more code here

/* START OF COMPILED CODE */

import PlayerPrefab from "../prefabs/PlayerPrefab";
import ExpOrb from "../prefabs/ExpOrb";
/* START-USER-IMPORTS */
import BaseGameScene from "./BaseGameScene";
/* END-USER-IMPORTS */

export default class FirstArea extends BaseGameScene {

	constructor() {
		super("FirstArea");

		/* START-USER-CTR-CODE */
		// BaseGameScene already handles these
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// rectangle_1
		const rectangle_1 = this.add.rectangle(621, 363, 128, 128);
		rectangle_1.scaleX = 14.943331427545049;
		rectangle_1.scaleY = 6.893171431980892;
		rectangle_1.isFilled = true;

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 486, 226);
		this.add.existing(playerPrefab);

		// expOrb
		const expOrb = new ExpOrb(this, 529, 303);
		this.add.existing(expOrb);

		this.playerPrefab = playerPrefab;

		this.events.emit("scene-awake");
	}

	/** @type {PlayerPrefab} */
	playerPrefab;

	/* START-USER-CODE */

	create() {
		try {
			// Create editor objects
			this.editorCreate();
			
			// Initialize player reference for easier access
			this.player = this.playerPrefab;
			
			// Initialize game managers (from BaseGameScene)
			this.initializeManagers();
			
			// Setup player attack system (from BaseGameScene)
			this.setupPlayerAttack();
			
			// Setup teleportation zones
			this.setupTeleportation();
			
			// Setup test controls for development (from BaseGameScene)
			this.setupTestControls();
			
			console.log("FirstArea created successfully");
		} catch (error) {
			console.error("Error in FirstArea create:", error);
		}
	}

	// Setup teleportation zones for map transitions (simple version for this demo)
	setupTeleportation() {
		try {
			// Create a teleport zone at the edge of the map
			const teleportZone = this.add.zone(486, 100, 100, 50);
			this.physics.world.enable(teleportZone);
			
			// Add collision for the teleport zone
			this.physics.add.overlap(this.player, teleportZone, this.handleTeleportZone, null, this);
			
			console.log("Teleport zone created");
		} catch (error) {
			console.error("Error setting up teleportation:", error);
		}
	}
	
	// Handle teleportation when player overlaps a teleport zone
	handleTeleportZone(player, teleportZone) {
		// Get destination scene
		const destScene = "MainMapScene"; // Default destination
		
		// Use the base class teleport handler
		this.handleTeleport(player, teleportZone, destScene);
	}
	
	// Add any FirstArea-specific test controls
	setupTestControls() {
		// Call the base class implementation
		super.setupTestControls();
		
		// Add scene-specific test controls here if needed
	}

	update(time, delta) {
		// Call the base class update method
		super.update(time, delta);
		
		// Add scene-specific update logic here if needed
	}
	
	// Scene cleanup
	shutdown() {
		// Call the base class shutdown method
		super.shutdown();
		
		// Add scene-specific cleanup here if needed
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here