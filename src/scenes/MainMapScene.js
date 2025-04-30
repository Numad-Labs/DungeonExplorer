
// You can write more code here

/* START OF COMPILED CODE */

import BaseGameScene from "./BaseGameScene";
import PlayerPrefab from "../prefabs/PlayerPrefab";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MainMapScene extends BaseGameScene {

	constructor() {
		super("MainMapScene");

		/* START-USER-CTR-CODE */
		// BaseGameScene already has manager properties
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// mainMap
		const mainMap = this.add.tilemap("MainMap");
		mainMap.addTilesetImage("golden monument anim-going up-packed sheet", "golden monument anim-going up-packed sheet");
		mainMap.addTilesetImage("Fire-candelabrum", "Fire-candelabrum");
		mainMap.addTilesetImage("side way-Sheet", "side way-Sheet");
		mainMap.addTilesetImage("Tileset 3", "Tileset 3");
		mainMap.addTilesetImage("Wall_3", "Wall_3");
		mainMap.addTilesetImage("rock pillars coming from darkness-bg_2", "rock pillars coming from darkness-bg_2");
		mainMap.addTilesetImage("Crystals1-improved refraction_11", "Crystals1-improved refraction_11");
		mainMap.addTilesetImage("Crystals1-improved refraction_6", "Crystals1-improved refraction_6");
		mainMap.addTilesetImage("Crystals1-improved refraction_8", "Crystals1-improved refraction_8");
		mainMap.addTilesetImage("Survive_Zone", "Survive_Zone");
		mainMap.addTilesetImage("statues-far from platforms-bg_4", "statues-far from platforms-bg_4");
		mainMap.addTilesetImage("statues-far from platforms-bg_2", "statues-far from platforms-bg_2");
		mainMap.addTilesetImage("statues-far from platforms-bg_1", "statues-far from platforms-bg_1");
		mainMap.addTilesetImage("statues-far from platforms-bg_0", "statues-far from platforms-bg_0");
		mainMap.addTilesetImage("statues-far from platforms-bg_5", "statues-far from platforms-bg_5");
		mainMap.addTilesetImage("Gold", "Gold");
		mainMap.addTilesetImage("Bed", "Bed");
		mainMap.addTilesetImage("Atlas-props", "Atlas-props");
		mainMap.addTilesetImage("platform2", "platform2");
		mainMap.addTilesetImage("platform1", "platform1");
		mainMap.addTilesetImage("lavafal-for Tiled-spritesheet-16frames", "lavafal-for Tiled-spritesheet-16frames");

		// map_Col_1
		const map_Col_1 = mainMap.createLayer("Map_Col", ["Bed"], 0, 0);

		// backGround_1
		const backGround_1 = mainMap.createLayer("BackGround", ["Wall_3"], 0, 0);

		// backGround
		const backGround = mainMap.createLayer("BackGround_1", ["lavafal-for Tiled-spritesheet-16frames"], 0, 0);

		// hG_1
		const hG_1 = mainMap.createLayer("HG", ["rock pillars coming from darkness-bg_2"], 0, 0);

		// stone_Statue_1
		const stone_Statue_1 = mainMap.createLayer("Stone_Statue", ["statues-far from platforms-bg_5","statues-far from platforms-bg_2","statues-far from platforms-bg_4","statues-far from platforms-bg_1"], 0, 0);

		// wall_Upper_1
		const wall_Upper_1 = mainMap.createLayer("Wall_Upper", ["Tileset 3"], 16, 12);

		// door_1
		const door_1 = mainMap.createLayer("Door", ["side way-Sheet"], 0, 0);

		// wall_down_1
		const wall_down_1 = mainMap.createLayer("Wall_down", ["Tileset 3"], -16, 13);

		// wall_RU_1
		const wall_RU_1 = mainMap.createLayer("Wall_RU", ["Tileset 3"], -15, -19);

		// survive_Zone_1
		const survive_Zone_1 = mainMap.createLayer("Survive_Zone", ["Survive_Zone"], 0, 0);

		// wall_RD_1
		const wall_RD_1 = mainMap.createLayer("Wall_RD", ["Tileset 3"], -15, -19);

		// map_AC
		const map_AC = mainMap.createLayer("Map_AC_1", ["Crystals1-improved refraction_6","Crystals1-improved refraction_11","Crystals1-improved refraction_8"], 0, 0);

		// gold_AC_1
		const gold_AC_1 = mainMap.createLayer("Gold_AC", ["Gold"], -14, -19);

		// map
		const map = mainMap.createLayer("Map_", ["platform1","platform2"], 0, 0);

		// teleportation_1
		const teleportation_1 = mainMap.createLayer("Teleportation", ["golden monument anim-going up-packed sheet"], 0, 0);

		// bed_1
		const bed_1 = mainMap.createLayer("Bed", ["Bed"], 0, 0);

		// vase_AC_1
		const vase_AC_1 = mainMap.createLayer("Vase_AC", ["Atlas-props"], 0, 0);

		// torch_1
		const torch_1 = mainMap.createLayer("Torch", ["Fire-candelabrum"], 34, 0);

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 959, 1221);
		this.add.existing(playerPrefab);

		this.map_Col_1 = map_Col_1;
		this.backGround_1 = backGround_1;
		this.backGround = backGround;
		this.hG_1 = hG_1;
		this.stone_Statue_1 = stone_Statue_1;
		this.wall_Upper_1 = wall_Upper_1;
		this.door_1 = door_1;
		this.wall_down_1 = wall_down_1;
		this.wall_RU_1 = wall_RU_1;
		this.survive_Zone_1 = survive_Zone_1;
		this.wall_RD_1 = wall_RD_1;
		this.map_AC = map_AC;
		this.gold_AC_1 = gold_AC_1;
		this.map = map;
		this.teleportation_1 = teleportation_1;
		this.bed_1 = bed_1;
		this.vase_AC_1 = vase_AC_1;
		this.torch_1 = torch_1;
		this.playerPrefab = playerPrefab;
		this.mainMap = mainMap;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	map_Col_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	backGround_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	backGround;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	hG_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	stone_Statue_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_Upper_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	door_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_down_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_RU_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	survive_Zone_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_RD_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	map_AC;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	gold_AC_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	map;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	teleportation_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bed_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	vase_AC_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	torch_1;
	/** @type {PlayerPrefab} */
	playerPrefab;
	/** @type {Phaser.Tilemaps.Tilemap} */
	mainMap;

	/* START-USER-CODE */

	create() {
		try {
			// Create editor objects
			this.editorCreate();

			// Setup collision layers
			this.setupCollisions();

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

			console.log("MainMapScene created successfully");
		} catch (error) {
			console.error("Error in MainMapScene create:", error);
		}
	}

	// Setup map collisions
	setupCollisions() {
		try {
			// Set collision for main terrain layers
			this.physics.add.collider(this.playerPrefab, this.hG_1);
			this.hG_1.setCollisionBetween(0, 10000);

			this.physics.add.collider(this.playerPrefab, this.map_Col_1);
			this.map_Col_1.setCollisionBetween(0, 10000);

			this.physics.add.collider(this.playerPrefab, this.backGround);
			this.backGround.setCollisionBetween(0, 10000);

			// Optionally enable debug view for collisions during development
			if (process.env.NODE_ENV !== 'production') {
				// Uncomment to show debug collision boxes
				// this.hG_1.renderDebug(this.add.graphics());
				// this.map_Col_1.renderDebug(this.add.graphics());
				// this.backGround.renderDebug(this.add.graphics());
			}

			console.log("Collisions setup complete");
		} catch (error) {
			console.error("Error setting up collisions:", error);
		}
	}

	// Setup teleportation zones for map transitions
	setupTeleportation() {
		try {
			// Check if there is a teleportation layer to use
			if (this.teleportation_1) {
				// Create a physics object for each teleport point
				// This is a placeholder - you'll need to implement your specific teleportation logic
				const teleporters = [];

				// Example: Search for teleport points in the teleportation layer
				// Note: This depends on how you've set up your teleport tiles in the map
				this.teleportation_1.forEachTile(tile => {
					if (tile.index !== -1) { // Not an empty tile
						// Create a zone at this tile's position
						const x = tile.x * tile.width + (tile.width / 2);
						const y = tile.y * tile.height + (tile.height / 2);

						const teleportZone = this.add.zone(x, y, tile.width, tile.height);
						this.physics.world.enable(teleportZone);
						teleporters.push(teleportZone);

						// Store destination data if available in tile properties
						// Example: tile.properties.destX, tile.properties.destY, tile.properties.destMap
					}
				});

				// Add collision for all teleport zones
				if (teleporters.length > 0) {
					this.physics.add.overlap(this.player, teleporters, this.handleTeleportZone, null, this);
				}

				console.log(`${teleporters.length} teleport zones created`);
			}
		} catch (error) {
			console.error("Error setting up teleportation:", error);
		}
	}

	// Handle teleportation when player overlaps a teleport zone
	handleTeleportZone(player, teleportZone) {
		// Get destination scene (could be stored in teleportZone.data)
		const destScene = "FirstArea"; // Default destination

		// Use the base class teleport handler
		this.handleTeleport(player, teleportZone, destScene);
	}

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

	shutdown() {
		// Call the base class shutdown method
		super.shutdown();

		// Add scene-specific cleanup here if needed
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */