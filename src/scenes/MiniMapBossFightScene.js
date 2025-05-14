// You can write more code here

/* START OF COMPILED CODE */

import StoneStatuePrefab from "../prefabs/StoneStatuePrefab";
import PlayerPrefab from "../prefabs/PlayerPrefab";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MiniMapBossFightScene extends Phaser.Scene {

	constructor() {
		super("MiniMapBossFightScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// miniMapBossFight
		const miniMapBossFight = this.add.tilemap("MiniMapBossFight");
		miniMapBossFight.addTilesetImage("Tileset 4 - transp", "Tileset 4");
		miniMapBossFight.addTilesetImage("Tileset 2", "Tileset 2");
		miniMapBossFight.addTilesetImage("pillars-bg_5", "pillars-bg_5");
		miniMapBossFight.addTilesetImage("pillars-bg_0", "pillars-bg_0");
		miniMapBossFight.addTilesetImage("floor", "floor");
		miniMapBossFight.addTilesetImage("Decor corner", "Decor corner");
		miniMapBossFight.addTilesetImage("TorchBowlRegular_V01-Sheet", "TorchBowlRegular_V01-Sheet");
		miniMapBossFight.addTilesetImage("side way-Sheet", "side way-Sheet");
		miniMapBossFight.addTilesetImage("Lift_Platform", "Lift_Platform");
		miniMapBossFight.addTilesetImage("Floading_flat_form", "Floading_flat_form");
		miniMapBossFight.addTilesetImage("animated lava river spritesheet", "animated lava river spritesheet");
		miniMapBossFight.addTilesetImage("floor_Lava_Crack", "floor_Lava_Crack");
		miniMapBossFight.addTilesetImage("static idle", "static idle");
		miniMapBossFight.addTilesetImage("golden monument anim-going up-packed sheet", "golden monument anim-going up-packed sheet");
		miniMapBossFight.addTilesetImage("rock pillars coming from darkness-bg_2", "rock pillars coming from darkness-bg_2");
		miniMapBossFight.addTilesetImage("Crystals2-improved refraction_25", "Crystals2-improved refraction_25");
		miniMapBossFight.addTilesetImage("Crystals2-improved refraction_3", "Crystals2-improved refraction_3");
		miniMapBossFight.addTilesetImage("Crystals2-improved refraction_9", "Crystals2-improved refraction_9");
		miniMapBossFight.addTilesetImage("Crystals2-improved refraction_19", "Crystals2-improved refraction_19");
		miniMapBossFight.addTilesetImage("AncientScript_V01", "AncientScript_V01");

		// floor_1
		const floor_1 = miniMapBossFight.createLayer("Floor", ["floor","floor_Lava_Crack"], 0, 0);

		// bg_1
		const bg_1 = miniMapBossFight.createLayer("bg", ["Tileset 4 - transp"], 0, 0);

		// lava_floor_1
		const lava_floor_1 = miniMapBossFight.createLayer("lava floor", ["animated lava river spritesheet"], 0, 0);

		// fire_animation_1
		const fire_animation_1 = miniMapBossFight.createLayer("fire animation", ["TorchBowlRegular_V01-Sheet"], 0, 0);

		// floating_plat_form_Chain_1
		const floating_plat_form_Chain_1 = miniMapBossFight.createLayer("Floating plat form/Chain", ["Floading_flat_form"], 0, 0);

		// floating_plat_form_Floating_Col_1
		const floating_plat_form_Floating_Col_1 = miniMapBossFight.createLayer("Floating plat form/Floating Col", ["Floading_flat_form"], 0, 0);

		// floating_plat_form_Floatind_platform_1
		const floating_plat_form_Floatind_platform_1 = miniMapBossFight.createLayer("Floating plat form/Floatind platform", ["Floading_flat_form"], 0, 0);

		// gate_1
		const gate_1 = miniMapBossFight.createLayer("Gate", ["side way-Sheet"], 0, 0);

		// wall_wall_bottom_1
		const wall_wall_bottom_1 = miniMapBossFight.createLayer("wall/wall bottom", ["Tileset 4 - transp"], 0, 0);

		// lift_1
		const lift_1 = miniMapBossFight.createLayer("lift", ["Lift_Platform"], 0, 0);

		// floating_plat_form_Chain_shadow_1
		const floating_plat_form_Chain_shadow_1 = miniMapBossFight.createLayer("Floating plat form/Chain shadow", ["Floading_flat_form"], 0, 0);

		// wall_Wall_side_1
		const wall_Wall_side_1 = miniMapBossFight.createLayer("wall/Wall side", ["Tileset 4 - transp"], 0, 0);

		// pillar_1
		const pillar_1 = miniMapBossFight.createLayer("pillar", ["pillars-bg_5","pillars-bg_0","Decor corner"], 0, 0);

		// decoration_1
		const decoration_1 = miniMapBossFight.createLayer("Decoration", ["Crystals2-improved refraction_3","Crystals2-improved refraction_9","Crystals2-improved refraction_25","Crystals2-improved refraction_19","AncientScript_V01"], 0, 0);

		// stoneStatuePrefab_1
		const stoneStatuePrefab_1 = new StoneStatuePrefab(this, 1610, 1451);
		this.add.existing(stoneStatuePrefab_1);

		// stoneStatuePrefab
		const stoneStatuePrefab = new StoneStatuePrefab(this, 856, 1451);
		this.add.existing(stoneStatuePrefab);

		// telAnimation
		const telAnimation = this.add.sprite(1280, 844, "golden monument anim-going up-packed sheet", 53);
		telAnimation.play("TelAnimation");

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 978, 1191);
		this.add.existing(playerPrefab);

		// torch1Anim
		const torch1Anim = this.add.sprite(618, 1797, "TorchBowlRegular_V01-Sheet", 0);
		torch1Anim.play("Torch1Anim");

		// torch1Anim_1
		const torch1Anim_1 = this.add.sprite(1935, 1797, "TorchBowlRegular_V01-Sheet", 0);
		torch1Anim_1.play("Torch1Anim");

		// torch1Anim_2
		const torch1Anim_2 = this.add.sprite(1935, 872, "TorchBowlRegular_V01-Sheet", 0);
		torch1Anim_2.play("Torch1Anim");

		// torch1Anim_3
		const torch1Anim_3 = this.add.sprite(618, 872, "TorchBowlRegular_V01-Sheet", 0);
		torch1Anim_3.play("Torch1Anim");

		this.floor_1 = floor_1;
		this.bg_1 = bg_1;
		this.lava_floor_1 = lava_floor_1;
		this.fire_animation_1 = fire_animation_1;
		this.floating_plat_form_Chain_1 = floating_plat_form_Chain_1;
		this.floating_plat_form_Floating_Col_1 = floating_plat_form_Floating_Col_1;
		this.floating_plat_form_Floatind_platform_1 = floating_plat_form_Floatind_platform_1;
		this.gate_1 = gate_1;
		this.wall_wall_bottom_1 = wall_wall_bottom_1;
		this.lift_1 = lift_1;
		this.floating_plat_form_Chain_shadow_1 = floating_plat_form_Chain_shadow_1;
		this.wall_Wall_side_1 = wall_Wall_side_1;
		this.pillar_1 = pillar_1;
		this.decoration_1 = decoration_1;
		this.stoneStatuePrefab_1 = stoneStatuePrefab_1;
		this.stoneStatuePrefab = stoneStatuePrefab;
		this.telAnimation = telAnimation;
		this.playerPrefab = playerPrefab;
		this.miniMapBossFight = miniMapBossFight;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	floor_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	bg_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	lava_floor_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	fire_animation_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	floating_plat_form_Chain_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	floating_plat_form_Floating_Col_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	floating_plat_form_Floatind_platform_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	gate_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_wall_bottom_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	lift_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	floating_plat_form_Chain_shadow_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_Wall_side_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	pillar_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	decoration_1;
	/** @type {StoneStatuePrefab} */
	stoneStatuePrefab_1;
	/** @type {StoneStatuePrefab} */
	stoneStatuePrefab;
	/** @type {Phaser.GameObjects.Sprite} */
	telAnimation;
	/** @type {PlayerPrefab} */
	playerPrefab;
	/** @type {Phaser.Tilemaps.Tilemap} */
	miniMapBossFight;

	/* START-USER-CODE */

	// Write your code here

	create() {   

		this.editorCreate();
		this.lava_floor_1.setDepth(1);
		this.floating_plat_form_Floating_Col_1.setDepth(2);
		this.floating_plat_form_Floatind_platform_1.setDepth(3);
		this.stoneStatuePrefab.setDepth(4);
		this.stoneStatuePrefab_1.setDepth(4);
		this.playerPrefab.setDepth(4);
		this.decoration_1.setDepth(4);
		this.telAnimation.setDepth(4);
		this.floating_plat_form_Chain_1.setDepth(4)
		this.stoneStatuePrefab_1.setupCollision(this.playerPrefab);
		this.stoneStatuePrefab.setupCollision(this.playerPrefab);
		const lavaTileset = this.lava_floor_1.getTilesWithin();

		const lavaContainer = this.add.container(0, 0);
		lavaContainer.setDepth(1);

		this.lavaSprites = [];

		lavaTileset.forEach(tile => {
			if (tile && tile.index !== -1) { 
				let animationKey = null;
				switch(tile.index) {
					case 2309:
						animationKey = 'lava0';
						break;
					case 2307:
						animationKey = 'lava9';
						break;
					case 2275:
						animationKey = 'lava6';
						break;
					case 2311:
						animationKey = 'lava3';
						break;
					case 2343:
						animationKey = 'lava12';
						break;
					case 2324:
						animationKey = 'lava10';
						break;
					case 2290:
						animationKey = 'lava7.1';
						break;
					case 2276:
						animationKey = 'lava4.1';
						break;
					case 2328:
						animationKey = 'lava1.1';
						break;
				}

				if (animationKey) {
					const sprite = this.add.sprite(
						tile.pixelX + tile.width/2, 
						tile.pixelY + tile.height/2, 
						'animated lava river spritesheet'
					);

					sprite.play(animationKey);
					lavaContainer.add(sprite);
					this.lavaSprites.push(sprite);
					tile.visible = false;
				}
			}
		});

		this.physics.add.collider(this.playerPrefab, this.floating_plat_form_Floating_Col_1);
		this.floating_plat_form_Floating_Col_1.setCollisionBetween(0, 10000);
		console.log(`Created ${this.lavaSprites.length} lava sprites`);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here