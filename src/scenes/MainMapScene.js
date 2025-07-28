// You can write more code here

/* START OF COMPILED CODE */

import BaseGameScene from "./BaseGameScene";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import StoneStatuePrefab from "../prefabs/StoneStatuePrefab";
import VaseSpawner from "../utils/VaseSpawner.js";
import PlayerLevel from "../prefabs/PlayerLevel.js";
import UIManager from "../managers/UIManager.js";
import MobManager from "../managers/MobManager.js";
/* START-USER-IMPORTS */
import { EventBus } from '../game/EventBus';
/* END-USER-IMPORTS */

export default class MainMapScene extends BaseGameScene {

	constructor() {
		super("MainMapScene");

		/* START-USER-CTR-CODE */
		this.portals = [];
		this.activePortal = null;
		this.portalTimer = null;
		this.portalActivationInterval = 20000;
		this.availableScenes = ["MiniMapDarkForastScene", "MiniMapBossFightScene", "MiniMapBeachScene", "MiniMapLavaScene"];
		this.isTeleporting = false;
		this.vaseSpawner = null;
		this.playerLevelSystem = null;
		this.mobManager = null;
		/* END-USER-CTR-CODE */
	}
	
	initializeMobManager() {
		try {
			this.mobManager = new MobManager(this);
			this.mobManager.initialize(this.gameManager, this.player);
			
			if (this.walkingArea_1) {
				this.mobManager.setWalkingAreaFromTilemap(this.walkingArea_1);
			}
			
			this.gameplayManager = { mobManager: this.mobManager };
			this.mobManager.startWave(1);
		} catch (error) {
			console.error('Error initializing MobManager:', error);
		}
	}
	
	initializeUIManager() {
		try {
			this.uiManager = new UIManager(this);
			this.uiManager.initialize();
			window.currentGameScene = this;
			this.currentWave = 1;
		} catch (error) {
			console.error('Error initializing UIManager:', error);
		}
	}

	/** @returns {void} */
	editorCreate() {

		// mainMap
		const mainMap = this.add.tilemap("mainMap");
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

		// walkingArea_1
		const walkingArea_1 = mainMap.createLayer("WalkingArea", ["Tileset 3"], -18, 8);

		// backGround_1
		const backGround_1 = mainMap.createLayer("BackGround", ["Wall_3"], -18, 8);

		// backGround
		const backGround = mainMap.createLayer("BackGround_1", ["lavafal-for Tiled-spritesheet-16frames"], 0, 0);

		// wall_RD_1
		const wall_RD_1 = mainMap.createLayer("Wall_RD", ["Tileset 3"], -18, -20);

		// wall_Upper_1
		const wall_Upper_1 = mainMap.createLayer("Wall_Upper", ["Tileset 3"], 12, 12);

		// wall_RU_1
		const wall_RU_1 = mainMap.createLayer("Wall_RU", ["Tileset 3"], -18, -20);

		// wall_down_1
		const wall_down_1 = mainMap.createLayer("Wall_down", ["Tileset 3"], -18, 12);

		// survive_Zone_1
		const survive_Zone_1 = mainMap.createLayer("Survive_Zone", ["Survive_Zone"], -18, 8);

		// gold_AC_1
		const gold_AC_1 = mainMap.createLayer("Gold_AC", ["Gold"], -18, -24);

		// map
		const map = mainMap.createLayer("Map_", ["platform1","platform2"], 0, 0);

		// bed_1
		const bed_1 = mainMap.createLayer("Bed", ["Bed"], 0, 0);

		// vase_AC_1
		const vase_AC_1 = mainMap.createLayer("Vase_AC", ["Atlas-props"], -18, 8);

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

		// vase_1
		const vase_1 = mainMap.createLayer("Vase", ["Atlas-props"], 0, 0);
		vase_1.setVisible(false);

		this.map_Col_1 = map_Col_1;
		this.walkingArea_1 = walkingArea_1;
		this.backGround_1 = backGround_1;
		this.backGround = backGround;
		this.wall_RD_1 = wall_RD_1;
		this.wall_Upper_1 = wall_Upper_1;
		this.wall_RU_1 = wall_RU_1;
		this.wall_down_1 = wall_down_1;
		this.survive_Zone_1 = survive_Zone_1;
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
		this.vase_1 = vase_1;
		this.mainMap = mainMap;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.Tilemaps.TilemapLayer} */
	map_Col_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	walkingArea_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	backGround_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	backGround;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_RD_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_Upper_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_RU_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	wall_down_1;
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	survive_Zone_1;
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
	/** @type {Phaser.Tilemaps.TilemapLayer} */
	vase_1;
	/** @type {Phaser.Tilemaps.Tilemap} */
	mainMap;

	/* START-USER-CODE */

	create() {
        this.cameras.main.setBounds(0, 0, 2560, 2560);
		this.physics.world.bounds.width = 2560;
		this.physics.world.bounds.height = 2560;

		try {
			super.create();

			this.editorCreate();
			this.setupCollisions();
			this.player = this.playerPrefab;
			this.initializeManagers();

			if (this.gameplayManager?.mobManager && this.walkingArea_1) {
			 this.gameplayManager.mobManager.setWalkingAreaFromTilemap(this.walkingArea_1);
			}

			this.setupPlayerAttack();
			this.setupPortalSystem();
			this.setupTestControls();
			this.setupZombieCollisionSystem();
			this.setupVaseSpawning();
			this.startEnemySpawning();
			this.setupHPBarIntegration();
			this.setupPlayerLevelSystem();
			this.initializeUIManager();
		this.initializeMobManager();
		} catch (error) {
			console.error("Error in MainMapScene create:", error);
		}
	}
	
	advanceWave() {
		this.currentWave = (this.currentWave || 1) + 1;
		
		if (this.uiManager) {
			this.uiManager.updateScoreboard();
		}
		
		this.showWaveNotification();
		EventBus.emit('wave-notification', { wave: this.currentWave });
		EventBus.emit('wave-updated', { wave: this.currentWave });
	}
	
	showWaveNotification() {
		if (!this.cameras || !this.cameras.main) return;

		const centerX = this.cameras.main.centerX;
		const centerY = this.cameras.main.centerY;

		const notification = this.add.text(centerX, centerY - 50, `WAVE ${this.currentWave}`, {
			fontFamily: 'Arial',
			fontSize: '48px',
			color: '#FFD700',
			stroke: '#000000',
			strokeThickness: 4,
			fontStyle: 'bold'
		});
		notification.setOrigin(0.5);
		notification.setScrollFactor(0);
		notification.setDepth(1000);

		this.tweens.add({
			targets: notification,
			scale: { from: 0, to: 1.2 },
			alpha: { from: 0, to: 1 },
			duration: 500,
			ease: 'Back.easeOut',
			onComplete: () => {
				this.time.delayedCall(1500, () => {
					this.tweens.add({
						targets: notification,
						alpha: 0,
						scale: 0.8,
						duration: 800,
						onComplete: () => notification.destroy()
					});
				});
			}
		});
	}

	setupPortalSystem() {
		try {
			const portalSprites = [
				this.children.getByName ? this.children.getByName('telAnimation') : null,
				this.children.getByName ? this.children.getByName('telAnimation_1') : null,
				this.children.getByName ? this.children.getByName('telAnimation_2') : null,
				this.children.getByName ? this.children.getByName('telAnimation_3') : null
			];

			if (!portalSprites[0]) {
				const allSprites = this.children.list.filter(child => 
					child && child instanceof Phaser.GameObjects.Sprite && 
					child.texture && 
					child.texture.key === "golden monument anim-going up-packed sheet"
				);

				portalSprites[0] = allSprites.find(s => s && Math.abs(s.x - 72) < 10 && Math.abs(s.y - 57) < 10);
				portalSprites[1] = allSprites.find(s => s && Math.abs(s.x - 2482) < 10 && Math.abs(s.y - 57) < 10);
				portalSprites[2] = allSprites.find(s => s && Math.abs(s.x - 2482) < 10 && Math.abs(s.y - 2420) < 10);
				portalSprites[3] = allSprites.find(s => s && Math.abs(s.x - 72) < 10 && Math.abs(s.y - 2420) < 10);
			}

			const portalPositions = [
				{ x: 72, y: 57, sprite: portalSprites[0] },
				{ x: 2482, y: 57, sprite: portalSprites[1] },
				{ x: 2482, y: 2420, sprite: portalSprites[2] },
				{ x: 72, y: 2420, sprite: portalSprites[3] }
			];

			portalPositions.forEach((portalData, index) => {
				const portalZone = this.add.zone(portalData.x, portalData.y, 100, 100);
				this.physics.world.enable(portalZone);
				portalZone.body.setImmovable(true);

				const portal = {
					id: index,
					zone: portalZone,
					sprite: portalData.sprite,
					x: portalData.x,
					y: portalData.y,
					isActive: false,
					originalTint: 0xffffff,
					activeTint: 0x00ff00,
					glowEffect: null
				};

				this.portals.push(portal);
				this.deactivatePortal(portal);
			});

			this.startPortalTimer();
		} catch (error) {
			console.error("Error setting up portal system:", error);
		}
	}

	startPortalTimer() {
		if (this.portalTimer) {
			this.portalTimer.destroy();
		}

		this.portalTimer = this.time.addEvent({
			delay: this.portalActivationInterval,
			callback: this.activateRandomPortal,
			callbackScope: this,
			loop: true
		});
	}

	activateRandomPortal() {
		try {
			if (this.scene && !this.scene.isActive()) return;
			if (this.isTeleporting) return;

			if (this.activePortal) {
				this.deactivatePortal(this.activePortal);
			}

			const randomIndex = Math.floor(Math.random() * this.portals.length);
			const selectedPortal = this.portals[randomIndex];
			const randomSceneIndex = Math.floor(Math.random() * this.availableScenes.length);
			const destinationScene = this.availableScenes[randomSceneIndex];

			this.activatePortal(selectedPortal, destinationScene);
			this.showPortalNotification(selectedPortal, destinationScene);
		} catch (error) {
			console.error("Error activating random portal:", error);
		}
	}

	activatePortal(portal, destinationScene) {
		try {
			if (!portal || !this.scene || !this.scene.isActive()) return;

			portal.isActive = true;
			portal.destinationScene = destinationScene;
			this.activePortal = portal;

			if (portal.sprite && portal.sprite.active && portal.sprite.scene) {
				portal.sprite.setTint(portal.activeTint);
			}

			const glow = this.add.circle(portal.x, portal.y, 60, 0x00ff00, 0.3);
			if (portal.sprite && portal.sprite.active) {
				glow.setDepth(portal.sprite.depth - 1);
			}
			portal.glowEffect = glow;

			const targets = (portal.sprite && portal.sprite.active && portal.sprite.scene) ? [portal.sprite, glow] : [glow];

			const tween = this.tweens.add({
				targets: targets,
				alpha: { from: 1, to: 0.7 },
				duration: 1000,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut'
			});

			portal.activeTween = tween;

			// Store the overlap handler reference
			if (this.player && this.player.active) {
				portal.overlapHandler = this.physics.add.overlap(this.player, portal.zone, (player, zone) => {
					this.handlePortalCollision(portal);
				});
			}

		} catch (error) {
			console.error("Error activating portal:", error);
		}
	}

	deactivatePortal(portal) {
		try {
			if (!portal) return;

			portal.isActive = false;
			portal.destinationScene = null;

			if (portal.sprite && portal.sprite.active && portal.sprite.scene) {
				portal.sprite.setTint(portal.originalTint);
				portal.sprite.setScale(1);
				portal.sprite.setAlpha(1);
			}

			if (portal.glowEffect && portal.glowEffect.active) {
				portal.glowEffect.destroy();
				portal.glowEffect = null;
			}

			if (portal.activeTween && this.tweens) {
				this.tweens.remove(portal.activeTween);
				portal.activeTween = null;
			}

			// Clean up overlap handler
			if (portal.overlapHandler && this.physics && this.physics.world) {
				this.physics.world.removeCollider(portal.overlapHandler);
				portal.overlapHandler = null;
			}

		} catch (error) {
			console.error("Error deactivating portal:", error);
		}
	}

	handlePortalCollision(portal) {
		if (!portal || !portal.isActive || this.isTeleporting || !portal.destinationScene) {
			return;
		}

		if (!this.scene || !this.scene.isActive()) {
			return;
		}

		const destinationScene = portal.destinationScene;
		this.isTeleporting = true;

		// Add null check for player and createTeleportEffect
		if (this.player && this.player.active && typeof this.createTeleportEffect === 'function') {
			this.createTeleportEffect(this.player.x, this.player.y);
		}

		if (this.gameManager && typeof this.gameManager.saveGame === 'function') {
			try {
				this.gameManager.saveGame();
			} catch (saveError) {
				console.warn("Error saving game:", saveError);
			}
		}

		this.cleanupBeforePortalTeleport();

		this.time.delayedCall(500, () => {
			if (!this.scene || !this.scene.isActive()) return;

			try {
				if (destinationScene && this.scene.manager && this.scene.manager.keys && this.scene.manager.keys[destinationScene]) {
					this.scene.start(destinationScene);
				} else {
					this.scene.start("MainMapScene");
				}
			} catch (sceneError) {
				console.error("Error switching scenes:", sceneError);
				this.isTeleporting = false;
			}
		});

		this.deactivatePortal(portal);
		this.activePortal = null;
	}

	cleanupBeforePortalTeleport() {
		try {
			// Clean up timers with proper checks
			const timersToClean = [
				'enemySpawnTimer', 'waveTimer', 'difficultyTimer', 'portalTimer'
			];

			timersToClean.forEach(timerName => {
				if (this[timerName] && this[timerName].hasDispatched !== undefined && !this[timerName].hasDispatched) {
					this[timerName].destroy();
					this[timerName] = null;
				}
			});

			// Clean up groups with proper checks
			const groupsToClean = [
				{ obj: this.gameplayManager, prop: 'enemies' },
				{ obj: this.gameplayManager, prop: 'expOrbs' },
				{ obj: this, prop: 'enemies' },
				{ obj: this, prop: 'zombieGroup' },
				{ obj: this, prop: 'experienceOrbs' }
			];

			groupsToClean.forEach(({ obj, prop }) => {
				if (obj && obj[prop] && obj[prop].active && typeof obj[prop].clear === 'function') {
					obj[prop].clear(true, true);
				}
			});

			// Reset counters
			this.currentWave = 0;
			this.isWaveActive = false;
			this.waveEnemiesRemaining = 0;
			this.enemiesKilled = 0;

		} catch (error) {
			console.error("Error during portal teleport cleanup:", error);
		}
	}

	showPortalNotification(portal, destinationScene) {
		try {
			if (!this.cameras || !this.cameras.main) return;

			const centerX = this.cameras.main.centerX;
			const centerY = this.cameras.main.centerY;

			const notification = this.add.text(centerX, centerY, 'PORTAL ACTIVATED!', {
				fontFamily: 'Arial',
				fontSize: '32px',
				color: '#00ff00',
				stroke: '#000000',
				strokeThickness: 3,
				fontStyle: 'bold'
			});
			notification.setOrigin(0.5);
			notification.setScrollFactor(0);
			notification.setDepth(1000);

			this.tweens.add({
				targets: notification,
				scale: { from: 0, to: 1 },
				alpha: { from: 0, to: 1 },
				duration: 500,
				ease: 'Back.easeOut',
				onComplete: () => {
					if (this.time && notification.active) {
						this.time.delayedCall(2000, () => {
							if (notification.active && this.tweens) {
								this.tweens.add({
									targets: notification,
									alpha: 0,
									duration: 800,
									onComplete: () => {
										if (notification.active) {
											notification.destroy();
										}
									}
								});
							}
						});
					}
				}
			});

		} catch (error) {
			console.error("Error showing portal notification:", error);
		}
	}

	setupZombieCollisionSystem() {
		try {
			if (this.map_Col_1) {
				this.registerCollisionLayer(this.map_Col_1, "Map Collision");
			}
			if (this.backGround) {
				this.registerCollisionLayer(this.backGround, "Background Collision");
			}

			const statues = [
				this.stoneStatuePrefab, this.stoneStatuePrefab_1, 
				this.stoneStatuePrefab_2, this.stoneStatuePrefab_3
			];

			statues.forEach((statue, index) => {
				if (statue && statue.active) {
					this.registerStaticObstacle(statue, `Stone Statue ${index + 1}`);
				}
			});

			if (typeof this.setupZombieObstacleCollisions === 'function') {
				this.setupZombieObstacleCollisions();
			}
		} catch (error) {
			console.error("Error setting up zombie collision system:", error);
		}
	}

	setupCollisions() {
		try {
			const statues = [
				this.stoneStatuePrefab, this.stoneStatuePrefab_1, 
				this.stoneStatuePrefab_2, this.stoneStatuePrefab_3
			];

			statues.forEach(statue => {
				if (statue && statue.active && typeof statue.setupCollision === 'function' && this.playerPrefab) {
					statue.setupCollision(this.playerPrefab);
				}
			});

			if (this.playerPrefab && this.map_Col_1) {
				this.physics.add.collider(this.playerPrefab, this.map_Col_1);
				this.map_Col_1.setCollisionBetween(0, 10000);
			}

			if (this.playerPrefab && this.backGround) {
				this.physics.add.collider(this.playerPrefab, this.backGround);
				this.backGround.setCollisionBetween(0, 10000);
			}
		} catch (error) {
			console.error("Error setting up player collisions:", error);
		}
	}

	setupTestControls() {
		try {
			if (typeof super.setupTestControls === 'function') {
				super.setupTestControls();
			}

			if (this.input && this.input.keyboard) {
				this.input.keyboard.on('keydown-P', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						this.activateRandomPortal();
					}
				});

				this.input.keyboard.on('keydown-O', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						this.portals.forEach((portal, index) => {
							console.log(`Portal ${index}: Active = ${portal.isActive}, Destination = ${portal.destinationScene || "None"}`);
						});
					}
				});

				this.input.keyboard.on('keydown-V', () => {
					if (this.gameManager && this.gameManager.debugMode && this.vaseSpawner) {
						const stats = this.vaseSpawner.getStatistics();
						console.log("=== VASE STATISTICS ===");
						console.log(`Active vases: ${stats.activeVases}/${stats.maxVases}`);
						console.log(`Spawn positions: ${stats.totalSpawnPositions}`);
						console.log(`Spawn chance: ${stats.spawnChance}`);
						console.log(`Respawn enabled: ${stats.respawnEnabled}`);
					}
				});

				this.input.keyboard.on('keydown-B', () => {
					if (this.gameManager && this.gameManager.debugMode && this.vaseSpawner && this.player) {
						const testVase = this.vaseSpawner.createVase(
							this.player.x + 50, 
							this.player.y + 50, 
							"Vase"
						);
						if (testVase) {
							console.log("Spawned test vase near player");
						}
					}
				});
				
				this.input.keyboard.on('keydown-E', () => {
					if (this.gameManager && this.gameManager.debugMode && this.playerLevelSystem) {
						this.playerLevelSystem.addExperience(50);
					}
				});
				
				this.input.keyboard.on('keydown-G', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						this.gameManager.addGold(100);
					}
				});
				
				// Timer debug controls
				this.input.keyboard.on('keydown-T', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						EventBus.emit('timer-reset');
					}
				});
				
				this.input.keyboard.on('keydown-Y', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						EventBus.emit('timer-start');
					}
				});
				
				this.input.keyboard.on('keydown-U', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						EventBus.emit('timer-stop');
					}
				});
				
				// Wave debug controls
				this.input.keyboard.on('keydown-PLUS', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						// Use timer controls to advance wave
						if (window.timerControls) {
							window.timerControls.advanceWave();
						}
					}
				});
				
				this.input.keyboard.on('keydown-MINUS', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						// Use timer controls to decrease wave
						if (window.timerControls) {
							const currentState = window.timerControls.getState();
							const newWave = Math.max(1, currentState.currentWave - 1);
							window.timerControls.setWave(newWave);
						}
					}
				});
				
				this.input.keyboard.on('keydown-N', () => {
					if (this.gameManager && this.gameManager.debugMode) {
						console.log('Testing wave notification...');
						EventBus.emit('wave-notification', { wave: 99 });
					}
				});
			}

		} catch (error) {
			console.error("Error setting up portal test controls:", error);
		}
	}

	trackEnemyKill(enemy) {
		if (typeof this.removeZombie === 'function') {
			this.removeZombie(enemy);
		}
		if (typeof super.trackEnemyKill === 'function') {
			super.trackEnemyKill(enemy);
		}
		
		if (this.playerLevelSystem) {
			this.playerLevelSystem.addExperience(10);
		}
		
		if (this.gameManager) {
			const goldReward = Math.floor(Math.random() * 5) + 2;
			this.gameManager.addGold(goldReward);
		}
		
		this.enemiesKilled = (this.enemiesKilled || 0) + 1;
		
		if (this.enemiesKilled % 10 === 0) {
			this.advanceWave();
		}
	}

	update(time, delta) {
		if (typeof super.update === 'function') {
			super.update(time, delta);
		}

		try {
			if (this.player && this.player.active && !this.player.isDead && this.cameras && this.cameras.main) {
				this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
			}
			
			if (this.uiManager && this.uiManager.isInitialized) {
				this.uiManager.update(time, delta);
			}
			
			if (this.mobManager) {
				this.mobManager.update(time, delta);
			}
		} catch (error) {
			console.error("Error in MainMapScene update:", error);
		}
	}

	shutdown() {
		try {
			if (this.portalTimer && !this.portalTimer.hasDispatched) {
				this.portalTimer.destroy();
				this.portalTimer = null;
			}

			this.portals.forEach(portal => {
				this.deactivatePortal(portal);
			});

			this.portals = [];
			this.activePortal = null;
			this.isTeleporting = false;
			
			if (this.playerLevelSystem) {
				this.playerLevelSystem.destroy();
				this.playerLevelSystem = null;
				console.log('Player Level System cleaned up');
			}
			
			EventBus.removeListener('request-initial-gold');
			EventBus.removeListener('main-scene-started');
			EventBus.removeListener('wave-updated');
			
			EventBus.emit('timer-stop');
			
			if (this.uiManager) {
				this.uiManager.shutdown();
				this.uiManager = null;
			}
			
			if (this.mobManager) {
				this.mobManager.shutdown();
				this.mobManager = null;
			}
			
			if (window.currentGameScene === this) {
				delete window.currentGameScene;
			}

			if (typeof super.shutdown === 'function') {
				super.shutdown();
			}
		} catch (error) {
			console.error("Error in MainMapScene shutdown:", error);
		}
	}

	setupVaseSpawning() {
		try {
			this.vaseSpawner = new VaseSpawner(this);
		
			if (this.vase_1) {
				const tilemap = this.vase_1.tilemap;
				
				for (let y = 0; y < Math.min(10, this.vase_1.layer.height); y++) {
					for (let x = 0; x < Math.min(10, this.vase_1.layer.width); x++) {
						const tile = tilemap.getTileAt(x, y, false, this.vase_1.layer.name);
					}
				}
				
				const vasesSpawned = this.vaseSpawner.spawnVasesOnTilemap(this.vase_1, {
					spawnChance: 1.0,
					maxVases: 500,
					textureKey: "Vase",
					targetTileIndex: null,
					excludeTileIndices: [0],
					removeTiles: false
				});
			} else {
				console.error("vase_1 layer not found!");
			}
			
			this.setupVaseAttackCollision();
			
		} catch (error) {
			console.error("Error setting up vase spawning:", error);
		}
	}

	setupVaseAttackCollision() {
		try {
			if (this.gameManager && this.gameManager.debugMode) {
				this.input.on('pointerdown', (pointer) => {
					if (this.breakableVases) {
						this.breakableVases.children.entries.forEach(vase => {
							if (vase.active) {
								const bounds = vase.getBounds();
								if (bounds.contains(pointer.worldX, pointer.worldY)) {
									vase.onPlayerAttack(1);
								}
							}
						});
					}
				});
			}

		} catch (error) {
			console.error("Error setting up vase attack collision:", error);
		}
	}
	setupHPBarIntegration() {
	    if (this.player) {
	        this.player.health = 100;
	        this.player.maxHealth = 100;
	    }
	
	    this.updateHPBar();
	    this.updateGoldDisplay();
	    this.time.delayedCall(100, () => {
	    	this.updateGoldDisplay();
	    });
	    
	    EventBus.on('request-initial-gold', () => {
	     this.time.delayedCall(50, () => {
        		this.updateGoldDisplay();
        	});
        });
        
        EventBus.on('main-scene-started', () => {
        	this.time.delayedCall(200, () => {
        		this.updateGoldDisplay();
        	});
        });
	}
	
	setupPlayerLevelSystem() {
		try {
			this.playerLevelSystem = new PlayerLevel(this, 10, 50);
			this.playerLevelSystem.level = 1;
			this.playerLevelSystem.experience = 0;
			this.playerLevelSystem.nextLevelExp = 100;
			this.playerLevelSystem.updateText();
			this.playerLevelSystem.updateExpBar();
			if (this.gameManager && this.gameManager.debugMode) {
				this.time.addEvent({
					delay: 5000,
					callback: () => {
						if (this.playerLevelSystem) {
							this.playerLevelSystem.addExperience(25);
						}
					},
					loop: true
				});
			}
			
		} catch (error) {
			console.error('Error setting up Player Level System:', error);
		}
	}
	

	playerTakeDamage(damage) {
		if (!this.player) return;

		this.player.health = Math.max(0, this.player.health - damage);
		this.updateHPBar();

		if (this.player.setTint) {
			this.player.setTint(0xff0000);
			this.time.delayedCall(100, () => {
				if (this.player && this.player.clearTint) {
					this.player.clearTint();
				}
			});
		}

		if (this.player.health <= 0) {
			this.handlePlayerDeath();
		}
	}

	playerHeal(healAmount) {
		if (!this.player) return;

		this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
		this.updateHPBar();

		if (this.player.setTint) {
			this.player.setTint(0x00ff00);
			this.time.delayedCall(100, () => {
				if (this.player && this.player.clearTint) {
					this.player.clearTint();
				}
			});
		}
	}

	updateHPBar() {
		if (!this.player) {
			return;
		}

		const healthData = {
			currentHP: this.player.health || 100,
			maxHP: this.player.maxHealth || 100,
			health: this.player.health || 100,
			maxHealth: this.player.maxHealth || 100
		};

		EventBus.emit('player-health-updated', healthData);
	}
	
	updateGoldDisplay() {
		const currentGold = this.gameManager ? this.gameManager.getGold() : 500;
		const goldData = {
			gold: currentGold,
			totalGold: currentGold,
			currentGold: currentGold
		};
		
		EventBus.emit('player-gold-updated', goldData);
		EventBus.emit('player-stats-updated', goldData);
	}

	handlePlayerDeath() {
		if (this.player && this.player.setAlpha) {
			this.player.setAlpha(0.5);
		}

		this.time.delayedCall(2000, () => {
			this.player.health = this.player.maxHealth;
			if (this.player && this.player.setAlpha) {
				this.player.setAlpha(1);
			}
			this.updateHPBar();
		});
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */