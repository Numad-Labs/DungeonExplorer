// You can write more code here

/* START OF COMPILED CODE */

import BaseGameScene from "./BaseGameScene";
import PlayerPrefab from "../prefabs/PlayerPrefab";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MiniMapLavaScene extends BaseGameScene {

	constructor() {
		super("MiniMapLavaScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// miniMapLava
		const miniMapLava = this.add.tilemap("MiniMapLava");
		miniMapLava.addTilesetImage("platform1", "platform1");
		miniMapLava.addTilesetImage("animated lava river spritesheet", "animated lava river spritesheet");
		miniMapLava.addTilesetImage("golden monument anim-going up-packed sheet", "golden monument anim-going up-packed sheet");
		miniMapLava.addTilesetImage("tileset", "tileset");
		miniMapLava.addTilesetImage("spike-pack-horizontal-attack", "spike-pack-horizontal-attack");
		miniMapLava.addTilesetImage("spike-pack-horizontal-retreat", "spike-pack-horizontal-retreat");
		miniMapLava.addTilesetImage("spike-pack-vertical-attack", "spike-pack-vertical-attack");
		miniMapLava.addTilesetImage("spike-pack-vertical-retreat", "spike-pack-vertical-retreat");
		miniMapLava.addTilesetImage("tumor-destroy", "tumor-destroy");
		miniMapLava.addTilesetImage("egg-ish prop-explosion", "egg-ish prop-explosion");
		miniMapLava.addTilesetImage("lava ball-falling", "lava ball-falling");
		miniMapLava.addTilesetImage("nasty structure_0", "nasty structure_0");
		miniMapLava.addTilesetImage("big eye-loop", "big eye-loop");
		miniMapLava.addTilesetImage("crusher-stand-retreat-v2", "crusher-stand-retreat-v2");
		miniMapLava.addTilesetImage("crusher-retreat-v2", "crusher-retreat-v2");
		miniMapLava.addTilesetImage("crusher-smash-pentagram FX", "crusher-smash-pentagram FX");
		miniMapLava.addTilesetImage("spitfire device-vertical-starting", "spitfire device-vertical-starting");
		miniMapLava.addTilesetImage("spitfire device-multidirectional-firing-loop-8frames", "spitfire device-multidirectional-firing-loop-8frames");
		miniMapLava.addTilesetImage("spitfire device-horizontal-starting", "spitfire device-horizontal-starting");
		miniMapLava.addTilesetImage("spitfire device-vertical-firing-loop-flame", "spitfire device-vertical-firing-loop-flame");
		miniMapLava.addTilesetImage("spitfire device-diagonal-firing-loop-flame", "spitfire device-diagonal-firing-loop-flame");
		miniMapLava.addTilesetImage("tormented souls tile-9-hand3", "tormented souls tile-9-hand3");
		miniMapLava.addTilesetImage("tormented souls tile-7-hand1", "tormented souls tile-7-hand1");
		miniMapLava.addTilesetImage("tormented souls tile-8-hand2", "tormented souls tile-8-hand2");
		miniMapLava.addTilesetImage("tiny volcanos_0", "tiny volcanos_0");
		miniMapLava.addTilesetImage("spears with dead bodies_0", "spears with dead bodies_0");
		miniMapLava.addTilesetImage("spears with dead bodies_1", "spears with dead bodies_1");
		miniMapLava.addTilesetImage("spears with dead bodies_2", "spears with dead bodies_2");
		miniMapLava.addTilesetImage("spears with dead bodies_3", "spears with dead bodies_3");
		miniMapLava.addTilesetImage("spears with dead bodies_4", "spears with dead bodies_4");
		miniMapLava.addTilesetImage("spears with dead bodies_5", "spears with dead bodies_5");
		miniMapLava.addTilesetImage("statues_0", "statues_0");
		miniMapLava.addTilesetImage("statues_3", "statues_3");
		miniMapLava.addTilesetImage("towers_0", "towers_0");
		miniMapLava.addTilesetImage("sharp rocks_0", "sharp rocks_0");
		miniMapLava.addTilesetImage("sharp rocks_1", "sharp rocks_1");
		miniMapLava.addTilesetImage("sharp rocks_2", "sharp rocks_2");
		miniMapLava.addTilesetImage("sharp rocks_3", "sharp rocks_3");
		miniMapLava.addTilesetImage("sharp rocks_4", "sharp rocks_4");
		miniMapLava.addTilesetImage("rock-formations on lava-_0", "rock-formations on lava-_0");
		miniMapLava.addTilesetImage("rock-formations on lava-_1", "rock-formations on lava-_1");
		miniMapLava.addTilesetImage("rock-formations on lava-_2", "rock-formations on lava-_2");
		miniMapLava.addTilesetImage("rock-formations on lava-_3", "rock-formations on lava-_3");
		miniMapLava.addTilesetImage("rock-formations on lava-_4", "rock-formations on lava-_4");
		miniMapLava.addTilesetImage("rocks1-_0", "rocks1-_0");
		miniMapLava.addTilesetImage("rocks1-_1", "rocks1-_1");
		miniMapLava.addTilesetImage("rocks1-_2", "rocks1-_2");
		miniMapLava.addTilesetImage("rocks1-_3", "rocks1-_3");
		miniMapLava.addTilesetImage("rocks1-_4", "rocks1-_4");
		miniMapLava.addTilesetImage("rocks1-_5", "rocks1-_5");
		miniMapLava.addTilesetImage("rocks1-_6", "rocks1-_6");
		miniMapLava.addTilesetImage("rocks1-_7", "rocks1-_7");
		miniMapLava.addTilesetImage("tormented souls Manu hand", "tormented souls Manu hand");
		miniMapLava.addTilesetImage("spike-1-attack", "spike-1-attack");
		miniMapLava.addTilesetImage("spike-3-retreat", "spike-3-retreat");
		miniMapLava.addTilesetImage("big rocks_1", "big rocks_1");
		miniMapLava.addTilesetImage("big rocks_11", "big rocks_11");
		miniMapLava.addTilesetImage("towers_2", "towers_2");
		miniMapLava.addTilesetImage("chest-anims-shaking", "chest-anims-shaking");

		// bG_lava_1
		const bG_lava_1 = miniMapLava.createLayer("BG/lava", ["animated lava river spritesheet"], 0, 0);

		// bG_Platform_1
		const bG_Platform_1 = miniMapLava.createLayer("BG/Platform", ["platform1","tileset"], 0, 0);

		// bG_Platform_L__1
		const bG_Platform_L__1 = miniMapLava.createLayer("BG/Platform L@", ["platform1","tileset"], 0, 0);

		// bG_Stairs_1
		const bG_Stairs_1 = miniMapLava.createLayer("BG/Stairs", ["tileset","crusher-stand-retreat-v2"], 0, 0);

		// bG_Totem_platform_1
		const bG_Totem_platform_1 = miniMapLava.createLayer("BG/Totem platform", ["tileset"], 0, 0);

		// decor_Shard_rocks_1
		const decor_Shard_rocks_1 = miniMapLava.createLayer("decor/Shard rocks", ["rock-formations on lava-_2","rock-formations on lava-_0","sharp rocks_0","rock-formations on lava-_4","sharp rocks_2","sharp rocks_3","sharp rocks_1","rock-formations on lava-_3","rock-formations on lava-_1","rocks1-_7","rocks1-_4","sharp rocks_4","big rocks_1","rocks1-_2","rocks1-_0","rocks1-_6","rocks1-_1","rocks1-_3"], 0, 0);

		// decor_Decor_1
		const decor_Decor_1 = miniMapLava.createLayer("decor/Decor", ["rock-formations on lava-_2","rocks1-_0","spears with dead bodies_1","spears with dead bodies_4","spears with dead bodies_2","spears with dead bodies_5","rock-formations on lava-_4","spears with dead bodies_0","spears with dead bodies_3","rock-formations on lava-_3","big rocks_1","big rocks_11","rocks1-_5","towers_2","rock-formations on lava-_1","rocks1-_4"], 0, 0);

		// traps_Statue_1
		const traps_Statue_1 = miniMapLava.createLayer("Traps/Statue", ["statues_0","statues_3"], 0, 0);

		// tumorDestroyAni
		const tumorDestroyAni = this.add.sprite(668, 2510, "tumor-destroy", 0);
		tumorDestroyAni.play("TumorDestroyAni");

		// tumorDestroyAni_1
		const tumorDestroyAni_1 = this.add.sprite(898, 2687, "tumor-destroy", 0);
		tumorDestroyAni_1.play("TumorDestroyAni");

		// tumorDestroyAni_2
		const tumorDestroyAni_2 = this.add.sprite(1901, 1667, "tumor-destroy", 0);
		tumorDestroyAni_2.play("TumorDestroyAni");

		// tumorDestroyAni_3
		const tumorDestroyAni_3 = this.add.sprite(1436, 1698, "tumor-destroy", 0);
		tumorDestroyAni_3.play("TumorDestroyAni");

		// tumorDestroyAni_4
		const tumorDestroyAni_4 = this.add.sprite(2412, 546, "tumor-destroy", 0);
		tumorDestroyAni_4.play("TumorDestroyAni");

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 644, 2600);
		this.add.existing(playerPrefab);

		this.bG_lava_1 = bG_lava_1;
		this.bG_Platform_1 = bG_Platform_1;
		this.bG_Platform_L__1 = bG_Platform_L__1;
		this.bG_Stairs_1 = bG_Stairs_1;
		this.bG_Totem_platform_1 = bG_Totem_platform_1;
		this.decor_Shard_rocks_1 = decor_Shard_rocks_1;
		this.decor_Decor_1 = decor_Decor_1;
		this.traps_Statue_1 = traps_Statue_1;
		this.playerPrefab = playerPrefab;
		this.miniMapLava = miniMapLava;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bG_lava_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bG_Platform_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bG_Platform_L__1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bG_Stairs_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bG_Totem_platform_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	decor_Shard_rocks_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	decor_Decor_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	traps_Statue_1;
	/** @type {PlayerPrefab} */
	playerPrefab;
	/** @type {Phaser.Tilemaps.Tilemap} */
	miniMapLava;

	/* START-USER-CODE */
	preload() {
	    super.preload();
	}
	create() {
		this.cameras.main.setBounds(0, 0, 3200, 3200);
		this.physics.world.bounds.width = 3200;
		this.physics.world.bounds.height = 3200;

		try {
			super.create();

			this.editorCreate();
			this.setupCollisions();
			this.player = this.playerPrefab;
			this.initializeManagers();
			this.setupPlayerAttack();
			this.setupTestControls();
			this.setupZombieCollisionSystem();
			this.startEnemySpawning();
			this.setupLavaAnimations();
		} catch (error) {
			console.error("Error in MiniMapLavaScene create:", error);
		}
	}

	setupCollisions() {
		try {
			this.bG_lava_1.setDepth(1);
			this.bG_Platform_1.setDepth(2);
			this.playerPrefab.setDepth(2);
			this.bG_Stairs_1.setDepth(2);
			this.bG_Totem_platform_1.setDepth(2);
			this.decor_Decor_1.setDepth(2);
			this.traps_Statue_1.setDepth(2);
			this.bG_Platform_L__1.setDepth(2);

			this.physics.add.collider(this.playerPrefab, this.bG_lava_1);
			this.bG_lava_1.setCollisionBetween(0, 10000);
		} catch (error) {
			console.error("Error setting up lava scene collisions:", error);
		}
	}

	setupZombieCollisionSystem() {
		try {
			this.registerCollisionLayer(this.bG_lava_1, "Lava Collision");

			this.setupZombieObstacleCollisions();
		} catch (error) {
			console.error("Error setting up lava scene zombie collision system:", error);
		}
	}

	setupLavaAnimations() {
		try {
			this.lavaContainer = this.add.container(0, 0);
			const lavaTileset = this.bG_lava_1.getTilesWithin();
			this.lavaSprites = [];

			lavaTileset.forEach(tile => {
				if (tile && tile.index !== -1) { 
					let animationKey = null;
					switch(tile.index) {
						case 391:
							animationKey = 'lava0';
							break;
						default:
							break;
					}

					if (animationKey) {
						const sprite = this.add.sprite(
							tile.pixelX + tile.width/2, 
							tile.pixelY + tile.height/2, 
							'animated lava river spritesheet'
						);

						sprite.play(animationKey);
						this.lavaContainer.add(sprite);
						this.lavaSprites.push(sprite);
						tile.visible = false;
					}
				}
			});
		} catch (error) {
			console.error("Error setting up lava animations:", error);
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
			console.error("Error in MiniMapLavaScene update:", error);
		}
	}

	shutdown() {
		super.shutdown();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here