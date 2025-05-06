
// You can write more code here

/* START OF COMPILED CODE */

import PlayerPrefab from "../prefabs/PlayerPrefab";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MiniMapDarkForastScene extends Phaser.Scene {

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

		// miniMapDarkForast_1
		const miniMapDarkForast_1 = this.add.tilemap("MiniMapDarkForast");
		miniMapDarkForast_1.addTilesetImage("Tree_pattern", "Tree_pattern");
		miniMapDarkForast_1.addTilesetImage("GroundTileset_V02", "GroundTileset_V02");
		miniMapDarkForast_1.addTilesetImage("AncientScript_V01-Sheet", "AncientScript_V01-Sheet");
		miniMapDarkForast_1.addTilesetImage("shrine-buff available animation-295x311", "shrine-buff available animation-295x311");
		miniMapDarkForast_1.addTilesetImage("animated lamp posts-4", "animated lamp posts-4");
		miniMapDarkForast_1.addTilesetImage("animated lamp posts-5", "animated lamp posts-5");
		miniMapDarkForast_1.addTilesetImage("stronghold - embranchment section", "stronghold - embranchment section");
		miniMapDarkForast_1.addTilesetImage("Lift_Platform", "Lift_Platform");
		miniMapDarkForast_1.addTilesetImage("golden monument anim-going up-packed sheet", "golden monument anim-going up-packed sheet");
		miniMapDarkForast_1.addTilesetImage("carriage - no tent", "carriage - no tent");
		miniMapDarkForast_1.addTilesetImage("bone - big - 2", "bone - big - 2");
		miniMapDarkForast_1.addTilesetImage("bone - big - 1", "bone - big - 1");
		miniMapDarkForast_1.addTilesetImage("RiverShallowSheet_v01", "RiverShallowSheet_v01");
		miniMapDarkForast_1.addTilesetImage("tree - color scheme 1 - 2", "tree - color scheme 1 - 2");
		miniMapDarkForast_1.addTilesetImage("tree - color scheme 1 - 1", "tree - color scheme 1 - 1");
		miniMapDarkForast_1.addTilesetImage("tree - color scheme 4 - 1", "tree - color scheme 4 - 1");
		miniMapDarkForast_1.addTilesetImage("tree - color scheme 5 - 1", "tree - color scheme 5 - 1");
		miniMapDarkForast_1.addTilesetImage("tree - naked 1", "tree - naked 1");

		// tile_Layer
		const tile_Layer = miniMapDarkForast.createLayer("Tile Layer 2", ["GroundTileset_V02"], 0, 0);

		// tall_Grass_1
		const tall_Grass_1 = miniMapDarkForast.createLayer("Tall Grass", ["GroundTileset_V02"], 0, 0);

		// rampt_1
		const rampt_1 = miniMapDarkForast.createLayer("Rampt", ["GroundTileset_V02"], 0, 0);

		// scrift_1
		const scrift_1 = miniMapDarkForast.createLayer("Scrift", ["AncientScript_V01-Sheet"], 0, 0);

		// shrine_1
		const shrine_1 = miniMapDarkForast.createLayer("Shrine", ["shrine-buff available animation-295x311"], 0, 0);

		// lamp_1
		const lamp_1 = miniMapDarkForast.createLayer("Lamp", ["stronghold - embranchment section","animated lamp posts-5","animated lamp posts-4"], 0, 0);

		// pad_1
		const pad_1 = miniMapDarkForast.createLayer("Pad", ["Lift_Platform"], 0, 0);

		// portal_shrine_1
		const portal_shrine_1 = miniMapDarkForast.createLayer("Portal shrine", ["golden monument anim-going up-packed sheet"], 0, 0);

		// cliff_1
		const cliff_1 = miniMapDarkForast.createLayer("Cliff", ["GroundTileset_V02"], 0, 0);

		// tree
		const tree = miniMapDarkForast.createLayer("Tree", ["tree - color scheme 4 - 1","tree - color scheme 1 - 2","tree - color scheme 1 - 1","Tree_pattern","tree - naked 1"], 0, 0);

		// tree_1
		const tree_1 = miniMapDarkForast.createLayer("Tree", ["tree - color scheme 4 - 1","tree - color scheme 1 - 2","tree - color scheme 1 - 1","Tree_pattern","tree - naked 1"], 0, 0);

		// tree_2
		const tree_2 = miniMapDarkForast.createLayer("Tree", ["tree - color scheme 4 - 1","tree - color scheme 1 - 2","tree - color scheme 1 - 1","Tree_pattern","tree - naked 1"], 0, 0);

		// decor_1
		const decor_1 = miniMapDarkForast.createLayer("Decor", ["bone - big - 1","bone - big - 2"], 0, 0);

		// river_1
		const river_1 = miniMapDarkForast.createLayer("River", ["RiverShallowSheet_v01"], 0, 0);

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 290, 1145);
		this.add.existing(playerPrefab);

		// tree___color_scheme_5___10
		this.add.image(266, 243, "tree - color scheme 5 - 1", 0);

		// tree___color_scheme
		this.add.image(85, 590, "tree - color scheme 5 - 1", 0);

		// tree___color_scheme_1
		this.add.image(72, 2066, "tree - color scheme 5 - 1", 0);

		this.tile_Layer = tile_Layer;
		this.tall_Grass_1 = tall_Grass_1;
		this.rampt_1 = rampt_1;
		this.scrift_1 = scrift_1;
		this.shrine_1 = shrine_1;
		this.lamp_1 = lamp_1;
		this.pad_1 = pad_1;
		this.portal_shrine_1 = portal_shrine_1;
		this.cliff_1 = cliff_1;
		this.tree = tree;
		this.tree_1 = tree_1;
		this.tree_2 = tree_2;
		this.decor_1 = decor_1;
		this.river_1 = river_1;
		this.playerPrefab = playerPrefab;
		this.miniMapDarkForast = miniMapDarkForast;
		this.miniMapDarkForast_1 = miniMapDarkForast_1;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tile_Layer;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tall_Grass_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	rampt_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	scrift_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	shrine_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	lamp_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	pad_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	portal_shrine_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	cliff_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tree;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tree_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	tree_2;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	decor_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	river_1;
	/** @type {PlayerPrefab} */
	playerPrefab;
	/** @type {Phaser.Tilemaps.Tilemap} */
	miniMapDarkForast;
	/** @type {Phaser.Tilemaps.Tilemap} */
	miniMapDarkForast_1;

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.cameras.main.setBounds(0, 0, 2560, 2560);
		this.physics.world.bounds.width = 1000;
		this.physics.world.bounds.height = 800;

		this.editorCreate();

		this.physics.add.collider(this.playerPrefab, this.cliff_1);
		this.cliff_1.setCollisionBetween(0, 10000);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
