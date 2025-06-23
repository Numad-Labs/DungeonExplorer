// You can write more code here

/* START OF COMPILED CODE */

import BaseGameScene from "./BaseGameScene";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import LampPrefab from "../prefabs/LampPrefab";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MiniMapDarkForastScene extends BaseGameScene {

	constructor() {
		super("MiniMapDarkForastScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// miniMapDarkForast
		const miniMapDarkForast = this.add.tilemap("MiniMapDarkForast");
		miniMapDarkForast.addTilesetImage("Tree_pattern", "Tree_pattern");
		miniMapDarkForast.addTilesetImage("GroundTileset_V02", "GroundTileset_V02");
		miniMapDarkForast.addTilesetImage("AncientScript_V01-Sheet", "AncientScript_V01-Sheet");
		miniMapDarkForast.addTilesetImage("shrine-buff available animation-295x311", "shrine-buff available animation-295x311");
		miniMapDarkForast.addTilesetImage("animated lamp posts-4", "animated lamp posts-4");
		miniMapDarkForast.addTilesetImage("animated lamp posts-5", "animated lamp posts-5");
		miniMapDarkForast.addTilesetImage("stronghold - embranchment section", "stronghold - embranchment section");
		miniMapDarkForast.addTilesetImage("Lift_Platform", "Lift_Platform");
		miniMapDarkForast.addTilesetImage("golden monument anim-going up-packed sheet", "golden monument anim-going up-packed sheet");
		miniMapDarkForast.addTilesetImage("carriage - no tent", "carriage - no tent");
		miniMapDarkForast.addTilesetImage("bone - big - 2", "bone - big - 2");
		miniMapDarkForast.addTilesetImage("bone - big - 1", "bone - big - 1");
		miniMapDarkForast.addTilesetImage("RiverShallowSheet_v01", "RiverShallowSheet_v01");
		miniMapDarkForast.addTilesetImage("tree - color scheme 1 - 2", "tree - color scheme 1 - 2");
		miniMapDarkForast.addTilesetImage("tree - color scheme 1 - 1", "tree - color scheme 1 - 1");
		miniMapDarkForast.addTilesetImage("tree - color scheme 4 - 1", "tree - color scheme 4 - 1");
		miniMapDarkForast.addTilesetImage("tree - color scheme 5 - 1", "tree - color scheme 5 - 1");
		miniMapDarkForast.addTilesetImage("tree - naked 1", "tree - naked 1");

		// tile_Layer
		const tile_Layer = miniMapDarkForast.createLayer("Tile Layer 2", ["GroundTileset_V02"], 0, 0);

		// road_1
		const road_1 = miniMapDarkForast.createLayer("Road", ["GroundTileset_V02"], 0, 0);

		// tall_Grass_1
		const tall_Grass_1 = miniMapDarkForast.createLayer("Tall Grass", ["GroundTileset_V02"], 0, 0);

		// rampt_1
		const rampt_1 = miniMapDarkForast.createLayer("Rampt", ["GroundTileset_V02"], 0, 0);

		// base_1
		const base_1 = miniMapDarkForast.createLayer("Base", ["GroundTileset_V02","AncientScript_V01-Sheet"], 0, 0);

		// scrift_1
		const scrift_1 = miniMapDarkForast.createLayer("Scrift", ["AncientScript_V01-Sheet"], 0, 0);

		// pad_1
		const pad_1 = miniMapDarkForast.createLayer("Pad", ["Lift_Platform"], 16, 4);

		// cliff_1
		const cliff_1 = miniMapDarkForast.createLayer("Cliff", ["GroundTileset_V02"], 0, 0);

		// tree
		const tree = miniMapDarkForast.createLayer("Tree", ["tree - color scheme 4 - 1","tree - color scheme 1 - 2","tree - color scheme 1 - 1","Tree_pattern","tree - naked 1"], 0, 0);

		// tree_1
		const tree_1 = miniMapDarkForast.createLayer("Tree", ["tree - color scheme 4 - 1","tree - color scheme 1 - 2","tree - color scheme 1 - 1","Tree_pattern","tree - naked 1"], 0, 0);

		// tree_2
		const tree_2 = miniMapDarkForast.createLayer("Tree", ["tree - color scheme 4 - 1","tree - color scheme 1 - 2","tree - color scheme 1 - 1","Tree_pattern","tree - naked 1"], 0, 0);

		// river_1
		const river_1 = miniMapDarkForast.createLayer("River", ["RiverShallowSheet_v01"], 0, 0);

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 1180, 715);
		this.add.existing(playerPrefab);

		// shrine_1
		const shrine_1 = miniMapDarkForast.createLayer("Shrine", ["shrine-buff available animation-295x311"], 0, 0);

		// tree___color_scheme_5___10
		this.add.image(266, 243, "tree - color scheme 5 - 1", 0);

		// tree___color_scheme
		this.add.image(85, 590, "tree - color scheme 5 - 1", 0);

		// tree___color_scheme_1
		this.add.image(72, 2066, "tree - color scheme 5 - 1", 0);

		// tree___color_scheme_2
		this.add.image(183, 965, "tree - color scheme 5 - 1", 0);

		// lampPrefab
		const lampPrefab = new LampPrefab(this, 654, 758);
		this.add.existing(lampPrefab);
		lampPrefab.flipX = true;
		lampPrefab.flipY = false;

		// lampPrefab_1
		const lampPrefab_1 = new LampPrefab(this, 654, 927);
		this.add.existing(lampPrefab_1);
		lampPrefab_1.flipX = true;
		lampPrefab_1.flipY = false;

		// lampPrefab_2
		const lampPrefab_2 = new LampPrefab(this, 1404, 1558);
		this.add.existing(lampPrefab_2);

		// lampPrefab_3
		const lampPrefab_3 = new LampPrefab(this, 1185, 1558);
		this.add.existing(lampPrefab_3);
		lampPrefab_3.flipX = true;
		lampPrefab_3.flipY = false;

		// lampPrefab_4
		const lampPrefab_4 = new LampPrefab(this, 1906, 896);
		this.add.existing(lampPrefab_4);

		// lampPrefab_5
		const lampPrefab_5 = new LampPrefab(this, 1906, 759);
		this.add.existing(lampPrefab_5);

		// telAnimation
		const telAnimation = this.add.sprite(1263, 393, "golden monument anim-going up-packed sheet", 53);
		telAnimation.play("TelAnimation");

		this.tile_Layer = tile_Layer;
		this.road_1 = road_1;
		this.tall_Grass_1 = tall_Grass_1;
		this.rampt_1 = rampt_1;
		this.base_1 = base_1;
		this.scrift_1 = scrift_1;
		this.pad_1 = pad_1;
		this.cliff_1 = cliff_1;
		this.tree = tree;
		this.tree_1 = tree_1;
		this.tree_2 = tree_2;
		this.river_1 = river_1;
		this.playerPrefab = playerPrefab;
		this.shrine_1 = shrine_1;
		this.lampPrefab = lampPrefab;
		this.lampPrefab_1 = lampPrefab_1;
		this.lampPrefab_2 = lampPrefab_2;
		this.lampPrefab_3 = lampPrefab_3;
		this.lampPrefab_4 = lampPrefab_4;
		this.lampPrefab_5 = lampPrefab_5;
		this.telAnimation = telAnimation;
		this.miniMapDarkForast = miniMapDarkForast;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tile_Layer;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	road_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tall_Grass_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	rampt_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	base_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	scrift_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	pad_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	cliff_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tree;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tree_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tree_2;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	river_1;
	/** @type {PlayerPrefab} */
	playerPrefab;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	shrine_1;
	/** @type {LampPrefab} */
	lampPrefab;
	/** @type {LampPrefab} */
	lampPrefab_1;
	/** @type {LampPrefab} */
	lampPrefab_2;
	/** @type {LampPrefab} */
	lampPrefab_3;
	/** @type {LampPrefab} */
	lampPrefab_4;
	/** @type {LampPrefab} */
	lampPrefab_5;
	/** @type {Phaser.GameObjects.Sprite} */
	telAnimation;
	/** @type {Phaser.Tilemaps.Tilemap} */
	miniMapDarkForast;

	/* START-USER-CODE */
	preload() {
	    super.preload();
	}
	create() {
		this.cameras.main.setBounds(0, 0, 2560, 2560);
		this.physics.world.bounds.width = 2560;
		this.physics.world.bounds.height = 2560;

		try {
			// Create tilemap layers FIRST
			this.editorCreate();
			
			// THEN initialize BaseGameScene
			super.create();

			this.setupCollisions();
			this.player = this.playerPrefab;
			this.initializeManagers();
			this.setupPlayerAttack();
			this.setupTestControls();
			this.setupZombieCollisionSystem();
			this.startEnemySpawning();
		} catch (error) {
			console.error("Error in MiniMapDarkForastScene create:", error);
		}
	}

	setupCollisions() {
		try {
			// Check if layers exist before setting up collisions
			if (this.lampPrefab) this.lampPrefab.setupCollision(this.playerPrefab);
			if (this.lampPrefab_1) this.lampPrefab_1.setupCollision(this.playerPrefab);
			if (this.lampPrefab_2) this.lampPrefab_2.setupCollision(this.playerPrefab);
			if (this.lampPrefab_3) this.lampPrefab_3.setupCollision(this.playerPrefab);
			if (this.lampPrefab_4) this.lampPrefab_4.setupCollision(this.playerPrefab);
			if (this.lampPrefab_5) this.lampPrefab_5.setupCollision(this.playerPrefab);

			if (this.cliff_1) {
				this.physics.add.collider(this.playerPrefab, this.cliff_1);
				this.cliff_1.setCollisionBetween(0, 10000);
			}

			if (this.rampt_1) {
				this.physics.add.collider(this.playerPrefab, this.rampt_1);
				this.rampt_1.setCollisionBetween(0, 10000);
			}

			if (this.base_1) {
				this.physics.add.collider(this.playerPrefab, this.base_1);
				this.base_1.setCollisionBetween(0, 10000);
			}
		} catch (error) {
			console.error("Error setting up dark forest collisions:", error);
		}
	}

	setupZombieCollisionSystem() {
		try {
			// Register collision layers for zombies (only if they exist)
			if (this.cliff_1) {
				this.registerCollisionLayer(this.cliff_1, "Cliff Collision");
			}
			if (this.rampt_1) {
				this.registerCollisionLayer(this.rampt_1, "Ramp Collision");
			}
			if (this.base_1) {
				this.registerCollisionLayer(this.base_1, "Base Collision");
			}

			// Register lamp obstacles
			const lamps = [
				this.lampPrefab, this.lampPrefab_1, this.lampPrefab_2,
				this.lampPrefab_3, this.lampPrefab_4, this.lampPrefab_5
			];
			lamps.forEach((lamp, index) => {
				if (lamp) {
					this.registerStaticObstacle(lamp, `Forest Lamp ${index + 1}`);
				}
			});

			this.setupZombieObstacleCollisions();
		} catch (error) {
			console.error("Error setting up dark forest zombie collision system:", error);
		}
	}

	trackEnemyKill(enemy) {
		this.removeZombie(enemy);
		super.trackEnemyKill(enemy);
	}

	update(time, delta) {
		super.update(time, delta);

		try {
			if (this.player && !this.player.isDead) {
				this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
			}
		} catch (error) {
			console.error("Error in MiniMapDarkForastScene update:", error);
		}
	}

	shutdown() {
		super.shutdown();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here