
// You can write more code here

/* START OF COMPILED CODE */

import PlayerPrefab from "../prefabs/PlayerPrefab";
import BeachTree1Prefab from "../prefabs/BeachTree1Prefab";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class MiniMapBeachScene extends Phaser.Scene {

	constructor() {
		super("MiniMapBeachScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// miniMapBeachBiom
		const miniMapBeachBiom = this.add.tilemap("MiniMapBeachBiom");
		miniMapBeachBiom.addTilesetImage("beach - standard - with thick foam - spritesheet", "beach - standard - with thick foam - spritesheet");
		miniMapBeachBiom.addTilesetImage("golden monument anim-going up-packed sheet", "golden monument anim-going up-packed sheet");
		miniMapBeachBiom.addTilesetImage("rocky skull structure-sand", "rocky skull structure-sand");
		miniMapBeachBiom.addTilesetImage("stranded ship-sand", "stranded ship-sand");
		miniMapBeachBiom.addTilesetImage("TreePalmSheet_03", "TreePalmSheet_03");
		miniMapBeachBiom.addTilesetImage("TreePalmSheet_01", "TreePalmSheet_01");
		miniMapBeachBiom.addTilesetImage("TreePalmSheet_02", "TreePalmSheet_02");

		// water_1
		const water_1 = miniMapBeachBiom.createLayer("water", ["beach - standard - with thick foam - spritesheet"], 0, 0);

		// ground_1
		const ground_1 = miniMapBeachBiom.createLayer("Ground", ["beach - standard - with thick foam - spritesheet"], 0, 0);

		// respawn_point_1
		const respawn_point_1 = miniMapBeachBiom.createLayer("respawn point", [], 0, 0);

		// skull_stone_1
		const skull_stone_1 = miniMapBeachBiom.createLayer("Skull stone", ["rocky skull structure-sand"], 0, 0);

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 846, 1110);
		this.add.existing(playerPrefab);

		// beachTree1Prefab
		const beachTree1Prefab = new BeachTree1Prefab(this, 992, 1112);
		this.add.existing(beachTree1Prefab);

		this.water_1 = water_1;
		this.ground_1 = ground_1;
		this.respawn_point_1 = respawn_point_1;
		this.skull_stone_1 = skull_stone_1;
		this.playerPrefab = playerPrefab;
		this.beachTree1Prefab = beachTree1Prefab;
		this.miniMapBeachBiom = miniMapBeachBiom;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	water_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	ground_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	respawn_point_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	skull_stone_1;
	/** @type {PlayerPrefab} */
	playerPrefab;
	/** @type {BeachTree1Prefab} */
	beachTree1Prefab;
	/** @type {Phaser.Tilemaps.Tilemap} */
	miniMapBeachBiom;

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
		this.playerPrefab.setDepth(1)
	    const waterTiles = this.water_1.getTilesWithin();
	    waterTiles.forEach(tile => {
	    if (tile && tile.index === 227) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water_1');
	    	sprite.play('Water0');
	    }})

		const waterTiles_1 = this.ground_1.getTilesWithin();
	    waterTiles_1.forEach(tile => {
	    if (tile && tile.index === 103) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.1');
	    	sprite.play('water.r');
	    }
		if (tile && tile.index === 174) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.2');
	    	sprite.play('water.r.d');
	    }
		if (tile && tile.index === 70) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.3');
	    	sprite.play('water.r.u');
	    }
		if (tile && tile.index === 69) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.4');
	    	sprite.play('water12');
	    }
		if (tile && tile.index === 37) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.5');
	    	sprite.play('water11');
	    }
		if (tile && tile.index === 36) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.6');
	    	sprite.play('water13');
	    }
		if (tile && tile.index === 107) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.7');
	    	sprite.play('water1');
	    }
		if (tile && tile.index === 137) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.8');
	    	sprite.play('water2');
	    }
		if (tile && tile.index === 138) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.9');
	    	sprite.play('water3');
	    }
		if (tile && tile.index === 73) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.10');
	    	sprite.play('water4');
	    }
		if (tile && tile.index === 72) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.11');
	    	sprite.play('water5');
	    }
		if (tile && tile.index === 173) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.12');
	    	sprite.play('water6');
	    }
		if (tile && tile.index === 141) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.13');
	    	sprite.play('water7');
	    }
		if (tile && tile.index === 140) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.14');
	    	sprite.play('water8');
	    }
		if (tile && tile.index === 172) {
	    	const sprite = this.add.sprite(tile.pixelX + tile.width/2, tile.pixelY + tile.height/2, 'water.15');
	    	sprite.play('water9');
	    }
		})

		this.physics.add.collider(this.playerPrefab, this.water_1);
		this.water_1.setCollisionBetween(0, 10000);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
