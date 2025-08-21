// You can write more code here

/* START OF COMPILED CODE */

import BaseGameScene from "./BaseGameScene";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import StoneStatuePrefab from "../prefabs/StoneStatuePrefab";
import VaseSpawner from "../utils/VaseSpawner.js";
import PlayerLevel from "../prefabs/PlayerLevel.js";
import MobManager from "../managers/MobManager.js";
/* START-USER-IMPORTS */
import { EventBus } from "../game/EventBus";
import GameConfig from "../config/GameConfig.js";
/* END-USER-IMPORTS */

export default class MainMapScene extends BaseGameScene {
  constructor() {
    super("MainMapScene");

    /* START-USER-CTR-CODE */
    this.initializeSceneState();
    /* END-USER-CTR-CODE */
  }

  initializeSceneState() {
    this.portals = [];
    this.activePortal = null;
    this.portalTimer = null;
    this.portalActivationInterval = GameConfig.PORTAL.ACTIVATION_INTERVAL;
    this.availableScenes = GameConfig.PORTAL.AVAILABLE_SCENES;
    this.isTeleporting = false;
    
    // Game systems
    this.vaseSpawner = null;
    this.playerLevelSystem = null;
    this.mobManager = null;
    
    // Game state
    this.gameTimer = null;
    this.gameStartTime = 0;
    this.gameTime = 0;
    this.isGameRunning = false;
    this.enemySpawnTimer = null;
    this.waveTimer = null;
    this.difficultyTimer = null;
  }

  create() {
    this.setupWorld();
    super.create();
    
    this.editorCreate();
    this.initializeAllSystems();
  }

  setupWorld() {
    // Using centralized world configuration
    const { WIDTH, HEIGHT } = GameConfig.WORLD;
    this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
    this.physics.world.setBounds(WIDTH, HEIGHT);
  }

  initializeAllSystems() {
    try {
      this.setupCollisions();
      this.player = this.playerPrefab;
      this.initializeManagers();
      
      const systemsToSetup = [
        'setupPlayerAttack',
        'setupZombieCollisionSystem', 
        'setupHPBarIntegration',
        'setupPlayerLevelSystem',
        'setupVaseSpawning',
        'initializeMobManager',
        'setupLavaAnimations',
        'ensureEnemyGroups'
      ];
      
      systemsToSetup.forEach(method => {
        if (typeof this[method] === 'function') {
          this[method]();
        }
      });
      
      this.startEnemySpawning();
    } catch (error) {
      console.error("Error initializing systems:", error);
    }
  }

  initializeMobManager() {
    if (!this.gameManager || !this.player) return;
    
    try {
      this.mobManager = new MobManager(this);
      this.mobManager.initialize(this.gameManager, this.player);

      if (this.walkingArea_1) {
        this.mobManager.setWalkingAreaFromTilemap(this.walkingArea_1);
      }

      this.gameplayManager = { mobManager: this.mobManager };
      this.mobManager.startWave(GameConfig.WAVE.INITIAL_WAVE);
    } catch (error) {
      console.error("MobManager initialization failed:", error);
    }
  }

  startEnemySpawning() {
    this.startGameTimer();
    this.startMobSpawning();
    this.startWaveTimer();
    
    EventBus.emit("timer-start", {
      gameTime: this.gameTime,
      currentWave: this.currentWave || GameConfig.WAVE.INITIAL_WAVE,
      isGameRunning: true
    });
  }

  startGameTimer() {
    this.gameStartTime = Date.now();
    this.gameTime = 0;
    this.isGameRunning = true;
    
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true
    });
  }

  startMobSpawning() {
    if (this.mobManager) {
      this.mobManager.startWave(GameConfig.WAVE.INITIAL_WAVE);
    } else {
      console.warn("MobManager not available, starting basic spawning");
      this.startBasicEnemySpawning();
    }
  }

  startWaveTimer() {
    this.waveTimer = this.time.addEvent({
      delay: GameConfig.WAVE.ADVANCE_TIMER,
      callback: this.advanceWave,
      callbackScope: this,
      loop: true
    });
  }

  updateGameTime() {
    if (!this.isGameRunning) return;
    
    this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    try {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      EventBus.emit("timer-updated", {
        gameTime: this.gameTime,
        formattedTime,
        currentWave: this.currentWave || GameConfig.WAVE.INITIAL_WAVE,
        isGameRunning: this.isGameRunning
      });
    } catch (error) {
      console.error("Error updating timer display:", error);
    }
  }

  startBasicEnemySpawning() {
    try {
      this.enemySpawnTimer = this.time.addEvent({
        delay: 1000,
        callback: () => {
          console.log("Basic enemy spawn triggered");
        },
        loop: true
      });
    } catch (error) {
      console.error("Error in basic enemy spawning:", error);
    }
  }

  ensureEnemyGroups() {
    try {
      if (!this.enemies && this.gameplayManager?.enemies) {
        this.enemies = this.gameplayManager.enemies;
      } else if (!this.enemies) {
        this.enemies = this.physics.add.group();
      }

      if (this.gameplayManager?.mobManager?.mobGroup) {
        this.enemies = this.gameplayManager.mobManager.mobGroup;
      }

      if (!this.zombieGroup) {
        this.zombieGroup = this.physics.add.group();
      }

      if (!this.breakableVases) {
        this.breakableVases = this.physics.add.staticGroup();
      }

      this.connectAttackSystem();
    } catch (error) {
      console.error("Error ensuring enemy groups:", error);
    }
  }

  connectAttackSystem() {
    try {
      if (this.playerAttackSystem) {
        this.playerAttackSystem.scene = this;
      } else {
        console.warn("PlayerAttack system not yet created");
      }
    } catch (error) {
      console.error("Error connecting attack system:", error);
    }
  }

  advanceWave() {
    this.currentWave = (this.currentWave || GameConfig.WAVE.INITIAL_WAVE) + 1;
    EventBus.emit("wave-updated", { wave: this.currentWave });
  }

  trackEnemyKill(enemy) {
    if (typeof this.removeZombie === 'function') {
      this.removeZombie(enemy);
    }
    
    if (typeof super.trackEnemyKill === 'function') {
      super.trackEnemyKill(enemy);
    }

    this.grantKillRewards();
    this.enemiesKilled = (this.enemiesKilled || 0) + 1;

    if (this.enemiesKilled % GameConfig.WAVE.ENEMIES_PER_ADVANCE === 0) {
      this.advanceWave();
    }
  }

  grantKillRewards() {
    if (this.playerLevelSystem) {
      this.playerLevelSystem.addExperience(GameConfig.PLAYER.COMBAT.EXP_PER_KILL);
    }

    if (this.gameManager) {
      const { BASE_GOLD_REWARD, MAX_GOLD_REWARD } = GameConfig.PLAYER.COMBAT;
      const goldReward = Math.floor(Math.random() * (MAX_GOLD_REWARD - BASE_GOLD_REWARD + 1)) + BASE_GOLD_REWARD;
      this.gameManager.addGold(goldReward);
    }
  }

  /** @returns {void} */
  editorCreate() {
    // mainMap
    const mainMap = this.add.tilemap("mainMap");
    mainMap.addTilesetImage(
      "golden monument anim-going up-packed sheet",
      "golden monument anim-going up-packed sheet"
    );
    mainMap.addTilesetImage("Fire-candelabrum", "Fire-candelabrum");
    mainMap.addTilesetImage("side way-Sheet", "side way-Sheet");
    mainMap.addTilesetImage("Tileset 3", "Tileset 3");
    mainMap.addTilesetImage("Wall_3", "Wall_3");
    mainMap.addTilesetImage(
      "rock pillars coming from darkness-bg_2",
      "rock pillars coming from darkness-bg_2"
    );
    mainMap.addTilesetImage(
      "Crystals1-improved refraction_11",
      "Crystals1-improved refraction_11"
    );
    mainMap.addTilesetImage(
      "Crystals1-improved refraction_6",
      "Crystals1-improved refraction_6"
    );
    mainMap.addTilesetImage(
      "Crystals1-improved refraction_8",
      "Crystals1-improved refraction_8"
    );
    mainMap.addTilesetImage("Survive_Zone", "Survive_Zone");
    mainMap.addTilesetImage(
      "statues-far from platforms-bg_4",
      "statues-far from platforms-bg_4"
    );
    mainMap.addTilesetImage(
      "statues-far from platforms-bg_2",
      "statues-far from platforms-bg_2"
    );
    mainMap.addTilesetImage(
      "statues-far from platforms-bg_1",
      "statues-far from platforms-bg_1"
    );
    mainMap.addTilesetImage(
      "statues-far from platforms-bg_0",
      "statues-far from platforms-bg_0"
    );
    mainMap.addTilesetImage(
      "statues-far from platforms-bg_5",
      "statues-far from platforms-bg_5"
    );
    mainMap.addTilesetImage("Gold", "Gold");
    mainMap.addTilesetImage("Bed", "Bed");
    mainMap.addTilesetImage("Atlas-props", "Atlas-props");
    mainMap.addTilesetImage("platform2", "platform2");
    mainMap.addTilesetImage("platform1", "platform1");
    mainMap.addTilesetImage(
      "lavafal-for Tiled-spritesheet-16frames",
      "lavafal-for Tiled-spritesheet-16frames"
    );

    // map_Col_1
    const map_Col_1 = mainMap.createLayer("Map_Col", ["Bed"], 0, 0);

    // walkingArea_1
    const walkingArea_1 = mainMap.createLayer(
      "WalkingArea",
      ["Tileset 3"],
      -18,
      8
    );

    // backGround_1
    const backGround_1 = mainMap.createLayer("BackGround", ["Wall_3"], -18, 8);

    // backGround
    const backGround = mainMap.createLayer(
      "BackGround_1",
      ["lavafal-for Tiled-spritesheet-16frames"],
      0,
      0
    );

    // wall_RD_1
    const wall_RD_1 = mainMap.createLayer("Wall_RD", ["Tileset 3"], -18, -20);

    // wall_Upper_1
    const wall_Upper_1 = mainMap.createLayer(
      "Wall_Upper",
      ["Tileset 3"],
      12,
      12
    );

    // wall_RU_1
    const wall_RU_1 = mainMap.createLayer("Wall_RU", ["Tileset 3"], -18, -20);

    // wall_down_1
    const wall_down_1 = mainMap.createLayer(
      "Wall_down",
      ["Tileset 3"],
      -18,
      12
    );

    // survive_Zone_1
    const survive_Zone_1 = mainMap.createLayer(
      "Survive_Zone",
      ["Survive_Zone"],
      -18,
      8
    );

    // gold_AC_1
    const gold_AC_1 = mainMap.createLayer("Gold_AC", ["Gold"], -18, -24);

    // map
    const map = mainMap.createLayer("Map_", ["platform1", "platform2"], 0, 0);

    // bed_1
    const bed_1 = mainMap.createLayer("Bed", ["Bed"], 0, 0);

    // vase_AC_1
    const vase_AC_1 = mainMap.createLayer("Vase_AC", ["Atlas-props"], -18, 8);

    // playerPrefab
    const playerPrefab = new PlayerPrefab(this, 1258, 1286);
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
    const telAnimation = this.add.sprite(
      72,
      57,
      "golden monument anim-going up-packed sheet",
      53
    );
    telAnimation.play("TelAnimation");

    // telAnimation_1
    const telAnimation_1 = this.add.sprite(
      2482,
      57,
      "golden monument anim-going up-packed sheet",
      53
    );
    telAnimation_1.play("TelAnimation");

    // telAnimation_2
    const telAnimation_2 = this.add.sprite(
      2482,
      2420,
      "golden monument anim-going up-packed sheet",
      53
    );
    telAnimation_2.play("TelAnimation");

    // telAnimation_3
    const telAnimation_3 = this.add.sprite(
      72,
      2420,
      "golden monument anim-going up-packed sheet",
      53
    );
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

  setupLavaAnimations() {
    try {
      const waterTiles = this.backGround.getTilesWithin();
      waterTiles.forEach((tile) => {
        if (tile && tile.index === 6956) {
          const sprite = this.add.sprite(
            tile.pixelX + tile.width / 2,
            tile.pixelY + tile.height / 2,
            "lava0"
          );
          sprite.play("lava0");
        }
      });
    } catch (error) {
      console.error("Error setting up water animations:", error);
    }
  }

  // Portal system - using centralized portal config (greatly simplified)
  setupPortalSystem() {
    try {
      this.createPortals();
      this.startPortalTimer();
    } catch (error) {
      console.error("Portal system setup failed:", error);
    }
  }

  createPortals() {
    const portalSprites = this.findPortalSprites();
    
    GameConfig.PORTAL.POSITIONS.forEach((position, index) => {
      const portal = this.createPortal(position, portalSprites[index], index);
      this.portals.push(portal);
      this.deactivatePortal(portal);
    });
  }

  findPortalSprites() {
    const allSprites = this.children.list.filter(child => 
      child instanceof Phaser.GameObjects.Sprite &&
      child.texture?.key === "golden monument anim-going up-packed sheet"
    );

    return GameConfig.PORTAL.POSITIONS.map(pos => 
      allSprites.find(sprite => 
        Math.abs(sprite.x - pos.x) < 10 && Math.abs(sprite.y - pos.y) < 10
      )
    );
  }

  createPortal(position, sprite, id) {
    const portalZone = this.add.zone(
      position.x, 
      position.y, 
      GameConfig.PORTAL.OVERLAP_SIZE, 
      GameConfig.PORTAL.OVERLAP_SIZE
    );
    this.physics.world.enable(portalZone);
    portalZone.body.setImmovable(true);

    return {
      id,
      zone: portalZone,
      sprite,
      x: position.x,
      y: position.y,
      isActive: false,
      originalTint: GameConfig.PORTAL.COLORS.ORIGINAL_TINT,
      activeTint: GameConfig.PORTAL.COLORS.ACTIVE_TINT,
      glowEffect: null
    };
  }

  startPortalTimer() {
    if (this.portalTimer) {
      this.portalTimer.destroy();
    }

    this.portalTimer = this.time.addEvent({
      delay: GameConfig.PORTAL.ACTIVATION_INTERVAL,
      callback: this.activateRandomPortal,
      callbackScope: this,
      loop: true
    });
  }

  activateRandomPortal() {
    if (!this.scene?.isActive() || this.isTeleporting) return;

    this.deactivateCurrentPortal();
    
    const randomPortal = this.portals[Math.floor(Math.random() * this.portals.length)];
    const randomScene = GameConfig.PORTAL.AVAILABLE_SCENES[
      Math.floor(Math.random() * GameConfig.PORTAL.AVAILABLE_SCENES.length)
    ];
    
    this.activatePortal(randomPortal, randomScene);
  }

  deactivateCurrentPortal() {
    if (this.activePortal) {
      this.deactivatePortal(this.activePortal);
      this.activePortal = null;
    }
  }

  activatePortal(portal, destinationScene) {
    if (!portal?.sprite?.active) return;

    portal.isActive = true;
    portal.destinationScene = destinationScene;
    this.activePortal = portal;

    this.applyPortalVisualEffects(portal);
    this.setupPortalCollision(portal);
  }

  applyPortalVisualEffects(portal) {
    portal.sprite.setTint(portal.activeTint);
    
    const glow = this.add.circle(
      portal.x, 
      portal.y, 
      GameConfig.PORTAL.GLOW_RADIUS, 
      GameConfig.PORTAL.COLORS.GLOW_COLOR, 
      0.3
    );
    glow.setDepth(portal.sprite.depth - 1);
    portal.glowEffect = glow;

    portal.activeTween = this.tweens.add({
      targets: [portal.sprite, glow],
      alpha: { from: 1, to: 0.7 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  setupPortalCollision(portal) {
    if (this.player?.active) {
      portal.overlapHandler = this.physics.add.overlap(
        this.player,
        portal.zone,
        () => this.handlePortalCollision(portal)
      );
    }
  }

  handlePortalCollision(portal) {
    if (!this.isValidPortalTeleport(portal)) return;
    this.initiateTeleport(portal);
  }

  isValidPortalTeleport(portal) {
    return portal?.isActive && 
           !this.isTeleporting && 
           portal.destinationScene &&
           this.scene?.isActive();
  }

  initiateTeleport(portal) {
    this.isTeleporting = true;
    
    if (this.player?.active && typeof this.createTeleportEffect === 'function') {
      this.createTeleportEffect(this.player.x, this.player.y);
    }

    this.saveGameBeforeTeleport();
    this.cleanupBeforeTeleport();
    
    this.time.delayedCall(GameConfig.PORTAL.TELEPORT_DELAY, () => {
      this.executeSceneTransition(portal.destinationScene);
    });

    this.deactivatePortal(portal);
    this.activePortal = null;
  }

  saveGameBeforeTeleport() {
    if (this.gameManager?.saveGame) {
      try {
        this.gameManager.saveGame();
      } catch (error) {
        console.warn("Failed to save before teleport:", error);
      }
    }
  }

  executeSceneTransition(destinationScene) {
    if (!this.scene?.isActive()) return;

    try {
      if (this.scene.manager?.keys?.[destinationScene]) {
        this.scene.start(destinationScene);
      } else {
        this.scene.start("MainMapScene");
      }
    } catch (error) {
      console.error("Scene transition failed:", error);
      this.isTeleporting = false;
    }
  }

  deactivatePortal(portal) {
    try {
      if (!portal) return;

      portal.isActive = false;
      portal.destinationScene = null;

      if (portal.sprite?.active) {
        portal.sprite.setTint(portal.originalTint);
        portal.sprite.setScale(1);
        portal.sprite.setAlpha(1);
      }

      if (portal.glowEffect?.active) {
        portal.glowEffect.destroy();
        portal.glowEffect = null;
      }

      if (portal.activeTween && this.tweens) {
        this.tweens.remove(portal.activeTween);
        portal.activeTween = null;
      }

      if (portal.overlapHandler && this.physics?.world) {
        this.physics.world.removeCollider(portal.overlapHandler);
        portal.overlapHandler = null;
      }
    } catch (error) {
      console.error("Error deactivating portal:", error);
    }
  }

  cleanupBeforeTeleport() {
    try {
      const timersToClean = ['enemySpawnTimer', 'waveTimer', 'difficultyTimer', 'portalTimer'];

      timersToClean.forEach((timerName) => {
        if (this[timerName] && !this[timerName].hasDispatched) {
          this[timerName].destroy();
          this[timerName] = null;
        }
      });

      const groupsToClean = [
        { obj: this.gameplayManager, prop: "enemies" },
        { obj: this.gameplayManager, prop: "expOrbs" },
        { obj: this, prop: "enemies" },
        { obj: this, prop: "zombieGroup" },
        { obj: this, prop: "experienceOrbs" }
      ];

      groupsToClean.forEach(({ obj, prop }) => {
        if (obj?.[prop]?.active && typeof obj[prop].clear === "function") {
          obj[prop].clear(true, true);
        }
      });

      this.currentWave = 0;
      this.isWaveActive = false;
      this.waveEnemiesRemaining = 0;
      this.enemiesKilled = 0;
    } catch (error) {
      console.error("Error during portal teleport cleanup:", error);
    }
  }

  // Collision system - simplified
  setupZombieCollisionSystem() {
    try {
      if (this.map_Col_1) {
        this.registerCollisionLayer(this.map_Col_1, "Map Collision");
      }
      if (this.backGround) {
        this.registerCollisionLayer(this.backGround, "Background Collision");
      }

      const statues = [
        this.stoneStatuePrefab,
        this.stoneStatuePrefab_1,
        this.stoneStatuePrefab_2,
        this.stoneStatuePrefab_3
      ];

      statues.forEach((statue, index) => {
        if (statue?.active) {
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
      this.setupStatueCollisions();
      this.setupTilemapCollisions();
    } catch (error) {
      console.error("Error setting up player collisions:", error);
    }
  }

  setupStatueCollisions() {
    const statues = [
      this.stoneStatuePrefab,
      this.stoneStatuePrefab_1,
      this.stoneStatuePrefab_2,
      this.stoneStatuePrefab_3
    ];

    statues.forEach(statue => {
      if (statue?.active && this.playerPrefab) {
        statue.setupCollision?.(this.playerPrefab);
      }
    });
  }

  setupTilemapCollisions() {
    if (!this.playerPrefab) return;

    [this.map_Col_1, this.backGround].forEach(layer => {
      if (layer) {
        this.physics.add.collider(this.playerPrefab, layer);
        layer.setCollisionBetween(0, 10000);
      }
    });
  }

  // Health and combat system - using UI config
  setupHPBarIntegration() {
    this.ensurePlayerHealth();
    this.updateHPBar();
    this.updateGoldDisplay();
    this.setupHealthEventListeners();
  }

  ensurePlayerHealth() {
    if (this.player && (!this.player.health || !this.player.maxHealth)) {
      console.warn("Player missing HP values, applying defaults");
      const { health, maxHealth } = GameConfig.PLAYER.DEFAULTS;
      this.player.health = health;
      this.player.maxHealth = maxHealth;
    }
  }

  setupHealthEventListeners() {
    EventBus.on("request-initial-gold", () => {
      this.time.delayedCall(50, () => this.updateGoldDisplay());
    });

    EventBus.on("main-scene-started", () => {
      this.time.delayedCall(200, () => this.updateGoldDisplay());
    });
  }

  playerTakeDamage(damage) {
    if (!this.player) return;

    this.player.health = Math.max(0, this.player.health - damage);
    this.updateHPBar();
    this.showDamageEffect();

    if (this.player.health <= 0) {
      this.handlePlayerDeath();
    }
  }

  showDamageEffect() {
    if (this.player?.setTint) {
      this.player.setTint(GameConfig.UI.HEALTH_BAR.DAMAGE_TINT);
      this.time.delayedCall(GameConfig.UI.HEALTH_BAR.EFFECT_DURATION, () => {
        this.player?.clearTint?.();
      });
    }
  }

  playerHeal(healAmount) {
    if (!this.player) return;

    this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
    this.updateHPBar();
    this.showHealEffect();
  }

  showHealEffect() {
    if (this.player?.setTint) {
      this.player.setTint(GameConfig.UI.HEALTH_BAR.HEAL_TINT);
      this.time.delayedCall(GameConfig.UI.HEALTH_BAR.EFFECT_DURATION, () => {
        this.player?.clearTint?.();
      });
    }
  }

  updateHPBar() {
    if (!this.player) return;

    const healthData = {
      currentHP: this.player.health || GameConfig.PLAYER.DEFAULTS.health,
      maxHP: this.player.maxHealth || GameConfig.PLAYER.DEFAULTS.maxHealth,
      health: this.player.health || GameConfig.PLAYER.DEFAULTS.health,
      maxHealth: this.player.maxHealth || GameConfig.PLAYER.DEFAULTS.maxHealth
    };

    EventBus.emit("player-health-updated", healthData);
  }

  updateGoldDisplay() {
    const currentGold = this.gameManager?.getGold() || GameConfig.BALANCE.GOLD.STARTING_AMOUNT;
    const goldData = { gold: currentGold, totalGold: currentGold, currentGold };

    EventBus.emit("player-gold-updated", goldData);
    EventBus.emit("player-stats-updated", goldData);
  }

  handlePlayerDeath() {
    if (this.player?.setAlpha) {
      this.player.setAlpha(0.5);
    }

    this.time.delayedCall(2000, () => {
      this.player.health = this.player.maxHealth;
      if (this.player?.setAlpha) {
        this.player.setAlpha(1);
      }
      this.updateHPBar();
    });
  }

  // Vase spawning - using config values
  setupVaseSpawning() {
    try {
      if (!this.physics || !this.add) {
        console.error("Scene not ready for vase spawning");
        return;
      }

      if (!this.textures.exists("Vase")) {
        console.error("Vase texture not loaded, skipping vase spawning");
        return;
      }

      this.vaseSpawner = new VaseSpawner(this);

      if (this.vase_1) {
        const vasesSpawned = this.vaseSpawner.spawnVasesOnTilemap(this.vase_1, {
          spawnChance: GameConfig.BALANCE.VASES.SPAWN_CHANCE,
          maxVases: GameConfig.BALANCE.VASES.MAX_COUNT,
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
      if (this.gameManager?.debugMode) {
        this.input.on("pointerdown", (pointer) => {
          if (this.breakableVases) {
            this.breakableVases.children.entries.forEach((vase) => {
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

  // Player level system - using config defaults
  setupPlayerLevelSystem() {
    try {
      this.playerLevelSystem = new PlayerLevel(this, 10, 50);
      
      const { level, experience, nextLevelExp } = GameConfig.PLAYER.DEFAULTS;
      this.playerLevelSystem.level = level;
      this.playerLevelSystem.experience = experience;
      this.playerLevelSystem.nextLevelExp = nextLevelExp;
      
      this.playerLevelSystem.updateText();
      this.playerLevelSystem.updateExpBar();
      
      if (this.gameManager?.debugMode && GameConfig.DEBUG.ENABLED) {
        this.time.addEvent({
          delay: GameConfig.DEBUG.AUTO_FEATURES.LEVEL_UP_INTERVAL,
          callback: () => {
            if (this.playerLevelSystem) {
              this.playerLevelSystem.addExperience(GameConfig.DEBUG.AUTO_FEATURES.AUTO_EXP_AMOUNT);
            }
          },
          loop: true
        });
      }
    } catch (error) {
      console.error("Error setting up Player Level System:", error);
    }
  }

  // Update loop - optimized
  update(time, delta) {
    super.update?.(time, delta);

    try {
      this.updateCamera();
      this.updateManagers(time, delta);
    } catch (error) {
      console.error("Update loop error:", error);
    }
  }

  updateCamera() {
    if (this.player?.active && !this.player.isDead && this.cameras?.main) {
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }
  }

  updateManagers(time, delta) {
    if (this.mobManager) {
      this.mobManager.update(time, delta);
    }
  }

  // Cleanup - consolidated
  shutdown() {
    try {
      this.stopGameSystems();
      this.cleanupTimers();
      this.cleanupPortals();
      this.cleanupManagers();
      this.cleanupEventListeners();
      
      super.shutdown?.();
    } catch (error) {
      console.error("Shutdown error:", error);
    }
  }

  stopGameSystems() {
    this.isGameRunning = false;
    EventBus.emit("timer-stop");
  }

  cleanupTimers() {
    const timers = ['portalTimer', 'gameTimer', 'enemySpawnTimer', 'waveTimer', 'difficultyTimer'];
    
    timers.forEach(timerName => {
      if (this[timerName] && !this[timerName].hasDispatched) {
        this[timerName].destroy();
        this[timerName] = null;
      }
    });
  }

  cleanupPortals() {
    this.portals.forEach(portal => this.deactivatePortal(portal));
    this.portals = [];
    this.activePortal = null;
    this.isTeleporting = false;
  }

  cleanupManagers() {
    if (this.playerLevelSystem) {
      this.playerLevelSystem.destroy();
      this.playerLevelSystem = null;
    }

    if (this.mobManager) {
      this.mobManager.shutdown();
      this.mobManager = null;
    }

    if (window.currentGameScene === this) {
      delete window.currentGameScene;
    }
  }

  cleanupEventListeners() {
    const events = ['request-initial-gold', 'main-scene-started', 'wave-updated'];
    events.forEach(event => EventBus.removeListener(event));
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */
