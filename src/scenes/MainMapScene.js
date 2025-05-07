
// You can write more code here

/* START OF COMPILED CODE */

import BaseGameScene from "./BaseGameScene";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import StoneStatuePrefab from "../prefabs/StoneStatuePrefab";
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

		// backGround_1
		const backGround_1 = mainMap.createLayer("BackGround", ["Wall_3"], 0, 0);

		// map_Col_1
		const map_Col_1 = mainMap.createLayer("Map_Col", ["Bed"], 0, 0);

		// backGround
		const backGround = mainMap.createLayer("BackGround_1", ["lavafal-for Tiled-spritesheet-16frames"], 0, 0);

		// wall_Upper_1
		const wall_Upper_1 = mainMap.createLayer("Wall_Upper", ["Tileset 3"], 16, 12);

		// wall_down_1
		const wall_down_1 = mainMap.createLayer("Wall_down", ["Tileset 3"], -16, 13);

		// wall_RU_1
		const wall_RU_1 = mainMap.createLayer("Wall_RU", ["Tileset 3"], -15, -19);

		// survive_Zone_1
		const survive_Zone_1 = mainMap.createLayer("Survive_Zone", ["Survive_Zone"], 0, 0);

		// wall_RD_1
		const wall_RD_1 = mainMap.createLayer("Wall_RD", ["Tileset 3"], -15, -19);

		// gold_AC_1
		const gold_AC_1 = mainMap.createLayer("Gold_AC", ["Gold"], -14, -19);

		// map
		const map = mainMap.createLayer("Map_", ["platform1","platform2"], 0, 0);

		// bed_1
		const bed_1 = mainMap.createLayer("Bed", ["Bed"], 0, 0);

		// vase_AC_1
		const vase_AC_1 = mainMap.createLayer("Vase_AC", ["Atlas-props"], 0, 0);

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 900, 100);
		this.add.existing(playerPrefab);

		// stoneStatuePrefab
		const stoneStatuePrefab = new StoneStatuePrefab(this, 944, 869);
		this.add.existing(stoneStatuePrefab);

		// stoneStatuePrefab_1
		const stoneStatuePrefab_1 = new StoneStatuePrefab(this, 944, 1417);
		this.add.existing(stoneStatuePrefab_1);

		// stoneStatuePrefab_2
		const stoneStatuePrefab_2 = new StoneStatuePrefab(this, 1592, 1417);
		this.add.existing(stoneStatuePrefab_2);

		// stoneStatuePrefab_3
		const stoneStatuePrefab_3 = new StoneStatuePrefab(this, 1592, 869);
		this.add.existing(stoneStatuePrefab_3);

		// torchAnim
		const torchAnim = this.add.sprite(734, 1993, "Fire-candelabrum", 0);
		torchAnim.play("TorchAnim");

		// torchAnim_1
		const torchAnim_1 = this.add.sprite(1253, 1993, "Fire-candelabrum", 0);
		torchAnim_1.play("TorchAnim");

		// torchAnim_2
		const torchAnim_2 = this.add.sprite(1799, 1993, "Fire-candelabrum", 0);
		torchAnim_2.play("TorchAnim");

		// torchAnim_3
		const torchAnim_3 = this.add.sprite(2017, 1737, "Fire-candelabrum", 0);
		torchAnim_3.play("TorchAnim");

		// torchAnim_4
		const torchAnim_4 = this.add.sprite(2017, 1231, "Fire-candelabrum", 0);
		torchAnim_4.play("TorchAnim");

		// torchAnim_5
		const torchAnim_5 = this.add.sprite(2017, 656, "Fire-candelabrum", 0);
		torchAnim_5.play("TorchAnim");

		// torchAnim_6
		const torchAnim_6 = this.add.sprite(514, 1737, "Fire-candelabrum", 0);
		torchAnim_6.play("TorchAnim");

		// torchAnim_7
		const torchAnim_7 = this.add.sprite(514, 1231, "Fire-candelabrum", 0);
		torchAnim_7.play("TorchAnim");

		// torchAnim_8
		const torchAnim_8 = this.add.sprite(514, 656, "Fire-candelabrum", 0);
		torchAnim_8.play("TorchAnim");

		// torchAnim_9
		const torchAnim_9 = this.add.sprite(770, 485, "Fire-candelabrum", 0);
		torchAnim_9.play("TorchAnim");

		// torchAnim_10
		const torchAnim_10 = this.add.sprite(1283, 485, "Fire-candelabrum", 0);
		torchAnim_10.play("TorchAnim");

		// torchAnim_11
		const torchAnim_11 = this.add.sprite(1831, 485, "Fire-candelabrum", 0);
		torchAnim_11.play("TorchAnim");

		// telAnimation
		const telAnimation = this.add.sprite(72, 57, "golden monument anim-going up-packed sheet", 53);
		telAnimation.play("TelAnimation");

		// telAnimation_1
		const telAnimation_1 = this.add.sprite(2482, 57, "golden monument anim-going up-packed sheet", 53);
		telAnimation_1.play("TelAnimation");

		// telAnimation_2
		const telAnimation_2 = this.add.sprite(2482, 2420, "golden monument anim-going up-packed sheet", 53);
		telAnimation_2.play("TelAnimation");

		// telAnimation_3
		const telAnimation_3 = this.add.sprite(72, 2420, "golden monument anim-going up-packed sheet", 53);
		telAnimation_3.play("TelAnimation");

		this.backGround_1 = backGround_1;
		this.map_Col_1 = map_Col_1;
		this.backGround = backGround;
		this.wall_Upper_1 = wall_Upper_1;
		this.wall_down_1 = wall_down_1;
		this.wall_RU_1 = wall_RU_1;
		this.survive_Zone_1 = survive_Zone_1;
		this.wall_RD_1 = wall_RD_1;
		this.gold_AC_1 = gold_AC_1;
		this.map = map;
		this.bed_1 = bed_1;
		this.vase_AC_1 = vase_AC_1;
		this.playerPrefab = playerPrefab;
		this.stoneStatuePrefab = stoneStatuePrefab;
		this.stoneStatuePrefab_1 = stoneStatuePrefab_1;
		this.stoneStatuePrefab_2 = stoneStatuePrefab_2;
		this.stoneStatuePrefab_3 = stoneStatuePrefab_3;
		this.torchAnim = torchAnim;
		this.mainMap = mainMap;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	backGround_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	map_Col_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	backGround;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_Upper_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_down_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_RU_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	survive_Zone_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_RD_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	gold_AC_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	map;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bed_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	vase_AC_1;
	/** @type {PlayerPrefab} */
	playerPrefab;
	/** @type {StoneStatuePrefab} */
	stoneStatuePrefab;
	/** @type {StoneStatuePrefab} */
	stoneStatuePrefab_1;
	/** @type {StoneStatuePrefab} */
	stoneStatuePrefab_2;
	/** @type {StoneStatuePrefab} */
	stoneStatuePrefab_3;
	/** @type {Phaser.GameObjects.Sprite} */
	torchAnim;
	/** @type {Phaser.Tilemaps.Tilemap} */
	mainMap;

	/* START-USER-CODE */

	create() {
        this.cameras.main.setBounds(0, 0, 2560, 2560);
		this.physics.world.bounds.width = 1000;
		this.physics.world.bounds.height = 800;

		try {
			this.editorCreate();
			this.setupCollisions();
			this.player = this.playerPrefab;
			this.initializeManagers();
			this.setupPlayerAttack();
			this.setupTeleportation();
			this.setupTestControls();
			console.log("MainMapScene created successfully");
		} catch (error) {
			console.error("Error in MainMapScene create:", error);
		}
		this.stoneStatuePrefab.setupCollision(this.playerPrefab)
		this.stoneStatuePrefab_1.setupCollision(this.playerPrefab)
		this.stoneStatuePrefab_2.setupCollision(this.playerPrefab)
		this.stoneStatuePrefab_3.setupCollision(this.playerPrefab)

		this.physics.add.collider(this.playerPrefab, this.map_Col_1);
		this.map_Col_1.setCollisionBetween(0, 10000);

		this.physics.add.collider(this.playerPrefab, this.backGround);
		this.backGround.setCollisionBetween(0, 10000);
	}
	setupCollisions() {
		try {
			this.physics.add.collider(this.playerPrefab, this.hG_1);
			this.hG_1.setCollisionBetween(0, 10000);

			this.physics.add.collider(this.playerPrefab, this.backGround);
			this.backGround.setCollisionBetween(0, 10000);
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

	setupTeleportation() {
		try {
			if (this.teleportation_1) {
				const teleporters = [];
				this.teleportation_1.forEachTile(tile => {
					if (tile.index !== -1) { 
						const x = tile.x * tile.width + (tile.width / 2);
						const y = tile.y * tile.height + (tile.height / 2);

						const teleportZone = this.add.zone(x, y, tile.width, tile.height);
						this.physics.world.enable(teleportZone);
						teleporters.push(teleportZone);
					}
				});
				if (teleporters.length > 0) {
					this.physics.add.overlap(this.player, teleporters, this.handleTeleportZone, null, this);
				}

				console.log(`${teleporters.length} teleport zones created`);
			}
		} catch (error) {
			console.error("Error setting up teleportation:", error);
		}
	}

	handleTeleportZone(player, teleportZone) {
		const destScene = "FirstArea";
		this.handleTeleport(player, teleportZone, destScene);
	}
	setupTestControls() {
		super.setupTestControls();
	}
	update(time, delta) {
		super.update(time, delta);
	}
	shutdown() {
		super.shutdown();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */