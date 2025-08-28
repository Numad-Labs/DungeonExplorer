import Zombie from "../prefabs/Enemies/Zombie1";
import Zombie2 from "../prefabs/Enemies/Zombie2";
import PoliceDroid from "../prefabs/Enemies/PoliceDroid";
import Assassin from "../prefabs/Enemies/Assassin";
import AssassinTank from "../prefabs/Enemies/AssassinTank";
import AssassinArcher from "../prefabs/Enemies/AssassinArcher";
import BigDude from "../prefabs/Enemies/BigDude.js";
import Wreacker from "../prefabs/Enemies/Wreacker.js";
import Choppor from "../prefabs/Enemies/Choppor.js";
import Crawler from "../prefabs/Enemies/Crawler.js";
import Bomber from "../prefabs/Enemies/Bomber.Scene.js";
import Saber from "../prefabs/Enemies/Saber.js";
import Guardian from "../prefabs/Enemies/Guardian.js";
import Charger from "../prefabs/Enemies/Charger.Scene.js";
import { EventBus } from "../game/EventBus";
import { MOB_TELEPORT_CONFIG } from "../config/MobTeleportConfig.js";

const MOB_CONFIGS = {
  zombie: {
    class: Zombie,
    texture: "zombierun",
    baseHealth: 30,
    baseDamage: 10,
    baseSpeed: 50,
    expValue: 12,
    goldValue: 5,
    spawnWeight: 50,
    unlockTime: 0,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  zombieBig: {
    class: Zombie2,
    texture: "Zombie2RunAni",
    baseHealth: 50,
    baseDamage: 20,
    baseSpeed: 40,
    expValue: 25,
    goldValue: 15,
    spawnWeight: 25,
    unlockTime: 30000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  policeDroid: {
    class: PoliceDroid,
    texture: "Police run",
    baseHealth: 35,
    baseDamage: 1,
    baseSpeed: 55,
    expValue: 18,
    goldValue: 10,
    spawnWeight: 20,
    unlockTime: 30000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  assassin: {
    class: Assassin,
    texture: "Dagger Bandit-Run",
    baseHealth: 25,
    baseDamage: 25,
    baseSpeed: 70,
    expValue: 30,
    goldValue: 20,
    spawnWeight: 15,
    unlockTime: 60000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  assassinTank: {
    class: AssassinTank,
    texture: "assassinTank",
    baseHealth: 80,
    baseDamage: 30,
    baseSpeed: 30,
    expValue: 48,
    goldValue: 35,
    spawnWeight: 8,
    unlockTime: 90000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  assassinArcher: {
    class: AssassinArcher,
    texture: "assassinArcher",
    baseHealth: 20,
    baseDamage: 18,
    baseSpeed: 45,
    expValue: 36,
    goldValue: 25,
    spawnWeight: 12,
    unlockTime: 90000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  bigDude: {
    class: BigDude,
    texture: "run_2",
    baseHealth: 90,
    baseDamage: 22,
    baseSpeed: 30,
    expValue: 60,
    goldValue: 35,
    spawnWeight: 14,
    unlockTime: 120000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  wreacker: {
    class: Wreacker,
    texture: "WreackerRun",
    baseHealth: 30,
    baseDamage: 22,
    baseSpeed: 35,
    expValue: 60,
    goldValue: 35,
    spawnWeight: 14,
    unlockTime: 120000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  choppor: {
    class: Choppor,
    texture: "Warrior-Run",
    baseHealth: 30,
    baseDamage: 22,
    baseSpeed: 35,
    expValue: 60,
    goldValue: 35,
    spawnWeight: 14,
    unlockTime: 150000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  bomber: {
    class: Bomber,
    texture: "Bomber_Activited_run_v01",
    baseHealth: 10,
    baseDamage: 42,
    baseSpeed: 35,
    expValue: 24,
    goldValue: 15,
    spawnWeight: 14,
    unlockTime: 180000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  saber: {
    class: Saber,
    texture: "saber_run_53x53_v01",
    baseHealth: 10,
    baseDamage: 42,
    baseSpeed: 40,
    expValue: 24,
    goldValue: 25,
    spawnWeight: 4,
    unlockTime: 210000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  guardian: {
    class: Guardian,
    texture: "guradian_walk224x45",
    baseHealth: 90,
    baseDamage: 22,
    baseSpeed: 30,
    expValue: 60,
    goldValue: 35,
    spawnWeight: 14,
    unlockTime: 240000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  crawler: {
    class: Crawler,
    texture: "crawler_run_32x16_v01",
    baseHealth: 1000,
    baseDamage: 12,
    baseSpeed: 45,
    expValue: 24,
    goldValue: 15,
    spawnWeight: 14,
    unlockTime: 270000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
  charger: {
    class: Charger,
    texture: "harger_run_32x32_v01",
    baseHealth: 90,
    baseDamage: 32,
    baseSpeed: 45,
    expValue: 28,
    goldValue: 35,
    spawnWeight: 14,
    unlockTime: 300000,
    expDropChance: 0.8,
    goldDropChance: 0.2,
  },
};

export default class MobManager {
  constructor(scene) {
    this.scene = scene;
    this.gameManager = null;
    this.player = null;

    // Core tracking
    this.mobGroup = null;
    this.activeMobs = new Map();

    // Spawn settings
    this.spawnTimer = null;
    this.waveTimer = null;
    this.maxMobs = 100;
    this.spawnDelay = 2000;

    // Wave system
    this.currentWave = 0;
    this.waveActive = false;
    this.waveMobs = [];

    // Time-based mob unlocking
    this.gameStartTime = null;
    this.isGameStarted = false;
    this.notifiedUnlocks = new Set();

    // Walking Area Management
    this.walkingAreaData = null;
    this.walkablePositions = [];
    this.tileSize = 32;
    this.mapWidth = 80;
    this.mapHeight = 80;
    this.isWalkingAreaInitialized = false;

    // Teleportation settings
    this.teleportConfig = MOB_TELEPORT_CONFIG;
    this.lastTeleportCheck = 0;
    this.lastObstacleCheck = 0;
    this.enableObstacleTeleport = true;

    // Statistics
    this.stats = {
      totalSpawned: 0,
      totalKilled: 0,
      killsByType: new Map(),
      totalTeleported: 0,
    };

    Object.keys(MOB_CONFIGS).forEach((type) => {
      this.stats.killsByType.set(type, 0);
    });
  }

  getMobUnlockStatus() {
    const gameTime = this.getGameTimeElapsed();
    const status = {};
    
    Object.entries(MOB_CONFIGS).forEach(([type, config]) => {
      status[type] = {
        unlocked: gameTime >= config.unlockTime,
        unlockTime: config.unlockTime,
        timeToUnlock: Math.max(0, config.unlockTime - gameTime),
        unlockTimeFormatted: this.formatTime(config.unlockTime / 1000)
      };
    });
    
    return status;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  }

  getTimeToNextUnlock() {
    const gameTime = this.getGameTimeElapsed();
    
    const nextUnlock = Object.values(MOB_CONFIGS)
      .filter(config => config.unlockTime > gameTime)
      .sort((a, b) => a.unlockTime - b.unlockTime)[0];
    
    if (!nextUnlock) {
      return 0;
    }
    
    return nextUnlock.unlockTime - gameTime;
  }

  initialize(gameManager, player) {
    this.gameManager = gameManager;
    this.player = player;
    this.setupMobGroup();
    this.startSpawning();
    this.setupEventListeners();
    
    this.gameStartTime = Date.now();
    this.isGameStarted = true;
    
    Object.entries(MOB_CONFIGS).forEach(([type, config]) => {
      if (config.unlockTime === 0) {
        this.notifiedUnlocks.add(type);
      }
    });
    
    this.displayMobUnlockSchedule();
  }

  setupMobGroup() {
    this.mobGroup = this.scene.physics.add.group();
    this.scene.physics.add.collider(
      this.mobGroup,
      this.mobGroup,
      this.handleMobCollision,
      null,
      this
    );
    this.scene.zombieGroup = this.mobGroup;
    this.scene.enemies = this.mobGroup;
  }

  startSpawning() {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnDelay,
      callback: () => this.spawnRandomMob(),
      loop: true,
    });

    this.waveTimer = this.scene.time.addEvent({
      delay: 20000,
      callback: () => this.triggerNextWave(),
      loop: false,
    });
  }

  triggerNextWave() {
    const nextWave = this.currentWave + 1;
    this.startWave(nextWave);

    if (this.waveTimer) this.waveTimer.destroy();
    this.waveTimer = this.scene.time.addEvent({
      delay: 20000,
      callback: () => this.triggerNextWave(),
      loop: false,
    });
  }

  setupEventListeners() {
    if (this.gameManager?.events) {
      this.gameManager.events.on(
        "difficultyUpdated",
        this.updateDifficulty,
        this
      );
    }
  }

  spawnMob(type, x, y) {
    const config = MOB_CONFIGS[type];
    if (!config) {
      console.warn(`Unknown mob type: ${type}`);
      return null;
    }

    try {
      const mob = new config.class(this.scene, x, y);
      this.applyStats(mob, config);
      this.setupMobProperties(mob, type);
      this.scene.add.existing(mob);
      this.mobGroup.add(mob);
      this.trackMob(mob, type);
      this.stats.totalSpawned++;
      return mob;
    } catch (error) {
      console.error(`Error spawning ${type}:`, error);
      return null;
    }
  }

  applyStats(mob, config) {
    const difficulty = this.gameManager?.gameProgress?.currentDifficulty || 1;
    const waveBonus = this.currentWave * 0.1;
    const healthScale = 1 + (difficulty - 1) * 0.2 + waveBonus;
    const damageScale = 1 + (difficulty - 1) * 0.1 + waveBonus * 0.5;
    const speedScale = 1 + (difficulty - 1) * 0.05;

    mob.maxHealth = Math.floor(config.baseHealth * healthScale);
    mob.health = mob.maxHealth;
    mob.damage = Math.floor(config.baseDamage * damageScale);
    mob.speed = Math.floor(config.baseSpeed * speedScale);
    mob.expValue = Math.floor(config.expValue * (1 + waveBonus));
    mob.goldValue = Math.floor(config.goldValue * (1 + waveBonus));
    mob.expDropChance = config.expDropChance;
    mob.goldDropChance = config.goldDropChance;
  }

  setupMobProperties(mob, type) {
    mob.mobType = type;
    mob.spawnTime = Date.now();
    mob.isWaveMob = this.waveActive;

    this.addSpecialAbilities(mob, type);

    const originalDie = mob.die?.bind(mob);
    mob.die = () => {
      this.handleMobDeath(mob);
      if (originalDie) originalDie();
    };

    mob.spawnRewards = () => this.spawnMobRewards(mob);
  }

  addSpecialAbilities(mob, type) {
    const specialAbilities = {
      policeDroid: {
        type: "projectile",
        range: 200,
        cooldown: 2000,
        speed: 150,
        color: 0xff0000,
        size: 3,
      },
      zombieBig: { type: "explosion", range: 80, damage: 15, color: 0xff4444 },
      assassinArcher: {
        type: "projectile",
        range: 250,
        cooldown: 2500,
        speed: 120,
        color: 0xff0000,
        size: 2,
      },
    };

    const ability = specialAbilities[type];
    if (ability) {
      if (ability.type === "projectile") {
        this.addProjectileAttack(mob, ability);
      } else if (ability.type === "explosion") {
        this.addDeathExplosion(mob, ability);
      }
    }
  }

  addProjectileAttack(mob, config) {
    mob.projectileConfig = config;
    mob.lastProjectileTime = 0;
    mob.hasProjectileAttack = true;
  }

  addDeathExplosion(mob, config) {
    mob.explosionConfig = config;
    const originalDie = mob.die?.bind(mob);
    mob.die = () => {
      this.createDeathExplosion(mob, config);
      if (originalDie) originalDie();
    };
  }

  updateMobAbilities(time, delta) {
    this.getAllActiveMobs().forEach((mob) => {
      if (mob.hasProjectileAttack) {
        this.updateProjectileAttack(mob, time);
      }
    });
  }

  updateProjectileAttack(mob, time) {
    if (!this.player || mob.isDead || !mob.projectileConfig) return;

    const distance = Phaser.Math.Distance.Between(
      mob.x,
      mob.y,
      this.player.x,
      this.player.y
    );
    const config = mob.projectileConfig;

    if (
      distance <= config.range &&
      time - mob.lastProjectileTime > config.cooldown
    ) {
      this.fireProjectile(mob, config);
      mob.lastProjectileTime = time;
    }
  }

  fireProjectile(mob, config) {
    if (!this.player) return;

    const projectile = this.scene.add.circle(
      mob.x,
      mob.y,
      config.size,
      config.color
    );
    projectile.setStrokeStyle(1, 0x000000);
    this.scene.physics.add.existing(projectile);
    projectile.body.setCircle(config.size);
    projectile.setDepth(15);

    const angle = Phaser.Math.Angle.Between(
      mob.x,
      mob.y,
      this.player.x,
      this.player.y
    );
    projectile.body.setVelocity(
      Math.cos(angle) * config.speed,
      Math.sin(angle) * config.speed
    );

    const hitOverlap = this.scene.physics.add.overlap(
      this.player,
      projectile,
      () => {
        if (this.player.takeDamage) this.player.takeDamage(mob.damage);
        this.createHitEffect(projectile.x, projectile.y);
        hitOverlap.destroy();
        projectile.destroy();
      }
    );

    this.scene.time.delayedCall(3000, () => {
      if (projectile && projectile.active) {
        hitOverlap.destroy();
        projectile.destroy();
      }
    });

    this.createMuzzleFlash(mob);
  }

  createMuzzleFlash(mob) {
    const flash = this.scene.add.circle(mob.x, mob.y, 12, 0xffff00, 0.8);
    flash.setDepth(-20);
    this.scene.tweens.add({
      targets: flash,
      scale: { from: 1, to: 2 },
      alpha: { from: 0.8, to: 0 },
      duration: 200,
      onComplete: () => flash.destroy(),
    });
  }

  createHitEffect(x, y) {
    const hit = this.scene.add.circle(x, y, 8, 0xff0000, 0.7);
    hit.setDepth(25);
    this.scene.tweens.add({
      targets: hit,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 0.7, to: 0 },
      duration: 300,
      onComplete: () => hit.destroy(),
    });
  }

  createDeathExplosion(mob, config) {
    if (!this.player) return;

    const explosion = this.scene.add.circle(
      mob.x,
      mob.y,
      config.range,
      config.color,
      0.6
    );
    explosion.setDepth(30);
    this.scene.tweens.add({
      targets: explosion,
      scale: { from: 0, to: 1.5 },
      alpha: { from: 0.6, to: 0 },
      duration: 500,
      onComplete: () => explosion.destroy(),
    });

    const distanceToPlayer = Phaser.Math.Distance.Between(
      mob.x,
      mob.y,
      this.player.x,
      this.player.y
    );
    if (distanceToPlayer <= config.range) {
      if (this.player.takeDamage) this.player.takeDamage(config.damage);
      if (this.player.body) {
        const angle = Phaser.Math.Angle.Between(
          mob.x,
          mob.y,
          this.player.x,
          this.player.y
        );
        const knockbackForce = 150;
        this.player.body.velocity.x += Math.cos(angle) * knockbackForce;
        this.player.body.velocity.y += Math.sin(angle) * knockbackForce;
      }
    }

    this.getAllActiveMobs().forEach((otherMob) => {
      if (otherMob === mob || otherMob.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        mob.x,
        mob.y,
        otherMob.x,
        otherMob.y
      );
      if (distance <= config.range && otherMob.takeDamage) {
        otherMob.takeDamage(Math.floor(config.damage * 0.5));
      }
    });

    this.scene.cameras.main.shake(200, 0.005);
  }

  spawnMobRewards(mob) {
    try {
      this.trySpawnExperienceOrb(mob);
      this.trySpawnGoldOrb(mob);
    } catch (error) {
      console.error("Error spawning mob rewards:", error);
    }
  }

  trySpawnExperienceOrb(mob) {
    const config = MOB_CONFIGS[mob.mobType];
    if (!config) return;

    let dropChance = config.expDropChance || 0.8;
    if (mob.isSpecialWave) dropChance *= 1.2;
    if (mob.specialWaveType === "boss") dropChance = 1.0;
    if (mob.specialWaveType === "elite")
      dropChance = Math.min(1.0, dropChance * 1.1);

    if (Math.random() < dropChance) {
      let expValue = 1;
      if (mob.expValue) {
        if (mob.expValue >= 40) expValue = 5;
        else if (mob.expValue >= 25) expValue = 3;
        else if (mob.expValue >= 15) expValue = 2;
        else expValue = 1;
      }

      if (Math.random() < 0.05) expValue *= 3;
      if (mob.specialWaveType === "boss") expValue *= 5;

      if (this.scene.spawnExperienceOrb) {
        this.scene.spawnExperienceOrb(mob.x, mob.y, expValue);
      }
    }
  }

  trySpawnGoldOrb(mob) {
    const config = MOB_CONFIGS[mob.mobType];
    if (!config) return;

    let dropChance = config.goldDropChance || 0.4;
    if (mob.isSpecialWave) dropChance *= 1.3;
    if (mob.specialWaveType === "boss") dropChance = 1.0;
    if (mob.specialWaveType === "elite")
      dropChance = Math.min(1.0, dropChance * 1.2);

    if (Math.random() < dropChance) {
      let goldValue = mob.goldValue || config.goldValue;
      if (Math.random() < 0.08) goldValue *= 2;
      if (mob.specialWaveType === "boss") goldValue *= 3;

      if (this.scene.spawnGoldOrb) {
        this.scene.spawnGoldOrb(mob.x, mob.y, goldValue);
      }
    }
  }

  trackMob(mob, type) {
    const id = `mob_${Date.now()}_${Math.random()}`;
    mob.trackingId = id;
    this.activeMobs.set(id, {
      mob: mob,
      type: type,
      spawnTime: Date.now(),
      isAlive: true,
    });
  }

  spawnRandomMob() {
    if (!this.player || this.getActiveMobCount() >= this.maxMobs) return;
    const mobType = this.selectMobType();
    const position = this.getSpawnPosition();
    return this.spawnMob(mobType, position.x, position.y);
  }

  getGameTimeElapsed() {
    if (!this.isGameStarted || !this.gameStartTime) {
      return 0;
    }
    return Date.now() - this.gameStartTime;
  }

  getAvailableMobTypes() {
    const gameTime = this.getGameTimeElapsed();
    
    const availableTypes = Object.keys(MOB_CONFIGS).filter((type) => {
      const config = MOB_CONFIGS[type];
      return gameTime >= config.unlockTime;
    });
    
    return availableTypes;
  }

  selectMobType() {
    const availableTypes = this.getAvailableMobTypes();
    
    if (availableTypes.length === 0) {
      return 'zombie';
    }

    const weightedTypes = [];
    availableTypes.forEach((type) => {
      const weight = MOB_CONFIGS[type].spawnWeight;
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type);
      }
    });

    return Phaser.Utils.Array.GetRandom(weightedTypes);
  }

  displayMobUnlockSchedule() {
    const sortedMobs = Object.entries(MOB_CONFIGS)
      .sort((a, b) => a[1].unlockTime - b[1].unlockTime)
      .map(([type, config]) => {
        const timeInSeconds = config.unlockTime / 1000;
        const timeFormatted = timeInSeconds >= 60 
          ? `${Math.floor(timeInSeconds / 60)}:${(timeInSeconds % 60).toString().padStart(2, '0')}` 
          : `${timeInSeconds}s`;
        return `${timeFormatted} - ${type}`;
      });
    
    sortedMobs.forEach(mobInfo => console.log(mobInfo));
  }

  checkForNewMobUnlocks() {
    const gameTime = this.getGameTimeElapsed();
    
    Object.entries(MOB_CONFIGS).forEach(([type, config]) => {
      if (gameTime >= config.unlockTime && !this.notifiedUnlocks.has(type)) {
        this.showMobUnlockNotification(type);
        this.notifiedUnlocks.add(type);
      }
    });
  }

  showMobUnlockNotification(mobType) {
    const config = MOB_CONFIGS[mobType];
    const timeInSeconds = config.unlockTime / 1000;
    
    EventBus.emit('mob-unlocked', {
      mobType: mobType,
      unlockTime: config.unlockTime,
      message: `New enemy type unlocked: ${mobType}!`
    });
  }

  getSpawnPosition() {
    if (!this.player) return { x: 1280, y: 1280 };

    for (let attempts = 0; attempts < 30; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Phaser.Math.Between(300, 500);
      const testX = this.player.x + Math.cos(angle) * distance;
      const testY = this.player.y + Math.sin(angle) * distance;

      if (this.isPositionOnWalkableTile(testX, testY)) {
        return { x: testX, y: testY };
      }
    }
    return { x: this.player.x + 400, y: this.player.y };
  }

  isValidSpawnPosition(worldX, worldY) {
    const collisionLayers = [this.scene.map_Col_1, this.scene.backGround];

    for (const layer of collisionLayers) {
      if (layer) {
        const tileX = Math.floor((worldX - layer.x) / this.tileSize);
        const tileY = Math.floor((worldY - layer.y) / this.tileSize);
        const tile = layer.getTileAt(tileX, tileY);
        if (tile && tile.collides) {
          return false;
        }
      }
    }

    const statues = [
      this.scene.stoneStatuePrefab,
      this.scene.stoneStatuePrefab_1,
      this.scene.stoneStatuePrefab_2,
      this.scene.stoneStatuePrefab_3,
    ];

    for (const statue of statues) {
      if (statue?.active) {
        const distance = Phaser.Math.Distance.Between(
          worldX,
          worldY,
          statue.x,
          statue.y
        );
        if (distance < 100) {
          return false;
        }
      }
    }

    return true;
  }

  setWalkingAreaFromTilemap(tilemapLayer) {
    if (!tilemapLayer || !tilemapLayer.layer) {
      console.warn("Invalid tilemap layer provided");
      return;
    }
    this.walkingAreaLayer = tilemapLayer;
    this.mapWidth = tilemapLayer.layer.width;
    this.mapHeight = tilemapLayer.layer.height;
    this.tileSize = tilemapLayer.layer.tileWidth || 32;
    this.isWalkingAreaInitialized = true;
  }

  initializeWalkingArea(flatData, width = 80, height = 80, tileSize = 32) {
    if (!flatData || !Array.isArray(flatData)) return;

    this.mapWidth = width;
    this.mapHeight = height;
    this.tileSize = tileSize;
    this.walkingAreaData = [];

    for (let y = 0; y < height; y++) {
      this.walkingAreaData[y] = [];
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        this.walkingAreaData[y][x] = flatData[index] || 0;
      }
    }

    this.cacheWalkablePositions();
    this.isWalkingAreaInitialized = true;
  }

  cacheWalkablePositions() {
    this.walkablePositions = [];
    if (!this.walkingAreaData) return;

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (this.walkingAreaData[y] && this.walkingAreaData[y][x] !== 0) {
          const worldX = x * this.tileSize + this.tileSize / 2;
          const worldY = y * this.tileSize + this.tileSize / 2;
          this.walkablePositions.push({
            tileX: x,
            tileY: y,
            worldX,
            worldY,
            tileValue: this.walkingAreaData[y][x],
          });
        }
      }
    }
  }

  isPositionWalkable(worldX, worldY) {
    if (!this.isWalkingAreaInitialized) return true;
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);
    return this.isTileWalkable(tileX, tileY);
  }

  isTileWalkable(tileX, tileY) {
    if (!this.walkingAreaData) return true;
    if (
      tileX < 0 ||
      tileX >= this.mapWidth ||
      tileY < 0 ||
      tileY >= this.mapHeight
    )
      return false;
    return (
      this.walkingAreaData[tileY] && this.walkingAreaData[tileY][tileX] !== 0
    );
  }

  getRandomWalkablePosition() {
    if (this.walkablePositions.length === 0) return null;
    const randomIndex = Math.floor(
      Math.random() * this.walkablePositions.length
    );
    return { ...this.walkablePositions[randomIndex] };
  }

  getRandomWalkablePositionNear(
    centerX,
    centerY,
    minDistance = 100,
    maxDistance = 300,
    maxAttempts = 20
  ) {
    if (!this.isWalkingAreaInitialized) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Phaser.Math.Between(minDistance, maxDistance);
      return {
        worldX: centerX + Math.cos(angle) * distance,
        worldY: centerY + Math.sin(angle) * distance,
      };
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Phaser.Math.Between(minDistance, maxDistance);
      const testX = centerX + Math.cos(angle) * distance;
      const testY = centerY + Math.sin(angle) * distance;

      if (this.isPositionWalkable(testX, testY)) {
        return { worldX: testX, worldY: testY };
      }
    }

    const randomPos = this.getRandomWalkablePosition();
    return randomPos
      ? { worldX: randomPos.worldX, worldY: randomPos.worldY }
      : null;
  }

  getWalkableSpawnPosition() {
    if (!this.player) {
      const randomPos = this.getRandomWalkablePosition();
      return randomPos
        ? { x: randomPos.worldX, y: randomPos.worldY }
        : { x: 0, y: 0 };
    }

    const position = this.getRandomWalkablePositionNear(
      this.player.x,
      this.player.y,
      300,
      500
    );
    return position
      ? { x: position.worldX, y: position.worldY }
      : { x: this.player.x + 400, y: this.player.y };
  }

  startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.waveActive = true;
    this.waveMobs = [];

    EventBus.emit("wave-notification", { wave: waveNumber });

    const mobCount = this.calculateWaveSize(waveNumber);
    const specialWaveType = this.getSpecialWaveType(waveNumber);

    if (specialWaveType) {
      this.startSpecialWave(waveNumber, specialWaveType);
    } else {
      this.startNormalWave(waveNumber, mobCount);
    }
  }

  startNormalWave(waveNumber, mobCount) {
    for (let i = 0; i < mobCount; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const type = this.selectMobType();
        const position = this.getSpawnPosition();
        const mob = this.spawnMob(type, position.x, position.y);
        if (mob) this.waveMobs.push(mob);
      });
    }
  }

  startSpecialWave(waveNumber, specialType) {
    const waveConfigs = {
      swarm: { count: Math.min(15 + waveNumber * 3, 30), types: ["zombie"] },
      elite: {
        count: Math.floor(this.calculateWaveSize(waveNumber) * 0.4),
        types: ["assassinTank", "assassinArcher"],
      },
      mixed: {
        count: Math.floor(this.calculateWaveSize(waveNumber) * 1.3),
        types: Object.keys(MOB_CONFIGS),
      },
      boss: {
        count: Math.max(1, Math.floor(waveNumber / 10)),
        types: ["assassinTank"],
      },
    };

    const config = waveConfigs[specialType];
    if (!config) {
      this.startNormalWave(waveNumber, this.calculateWaveSize(waveNumber));
      return;
    }

    for (let i = 0; i < config.count; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const type = Phaser.Utils.Array.GetRandom(config.types);
        const position = this.getSpawnPosition();
        const mob = this.spawnMob(type, position.x, position.y);

        if (mob) {
          this.applySpecialWaveModifiers(mob, specialType);
          this.waveMobs.push(mob);
          this.createSpawnPortalEffect(position.x, position.y);
        }
      });
    }
  }

  applySpecialWaveModifiers(mob, specialType) {
    const modifiers = {
      elite: {
        healthMult: 2,
        damageMult: 1.5,
        expMult: 2,
        goldMult: 2,
        expChance: 1.2,
        goldChance: 1.3,
      },
      boss: {
        healthMult: 6,
        damageMult: 3,
        expMult: 10,
        goldMult: 15,
        expChance: 1,
        goldChance: 1,
        tint: 0xff0000,
      },
    };

    const modifier = modifiers[specialType];
    if (modifier) {
      mob.maxHealth *= modifier.healthMult;
      mob.health = mob.maxHealth;
      mob.damage *= modifier.damageMult;
      mob.expValue *= modifier.expMult;
      mob.goldValue *= modifier.goldMult;
      mob.expDropChance = Math.min(1.0, mob.expDropChance * modifier.expChance);
      mob.goldDropChance = Math.min(
        1.0,
        mob.goldDropChance * modifier.goldChance
      );
      if (modifier.tint) mob.setTint(modifier.tint);
    }

    mob.isSpecialWave = true;
    mob.specialWaveType = specialType;
  }

  getSpecialWaveType(waveNumber) {
    if (waveNumber % 10 === 0) return "boss";
    if (waveNumber % 7 === 0) return "elite";
    if (waveNumber % 5 === 0) return "swarm";
    if (waveNumber % 8 === 0) return "mixed";
    return null;
  }

  createSpawnPortalEffect(x, y) {
    const portal = this.scene.add.circle(x, y, 20, 0x8800ff, 0.8);
    this.scene.tweens.add({
      targets: portal,
      scale: { from: 0, to: 2 },
      alpha: { from: 0.8, to: 0 },
      duration: 500,
      onComplete: () => portal.destroy(),
    });
  }

  calculateWaveSize(waveNumber) {
    const baseSize = 8;
    const waveScaling = Math.floor(waveNumber * 1.2);
    const difficultyBonus = Math.floor(
      (this.gameManager?.gameProgress?.currentDifficulty || 1) * 1.5
    );
    return Math.min(25, baseSize + waveScaling + difficultyBonus);
  }

  checkWaveCompletion() {
    if (!this.waveActive) return;
    const aliveWaveMobs = this.waveMobs.filter(
      (mob) => mob && mob.active && !mob.isDead
    );
    if (aliveWaveMobs.length === 0) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveActive = false;
    const completedWave = this.currentWave;
    const specialType =
      this.waveMobs.length > 0 ? this.waveMobs[0].specialWaveType : null;
    this.waveMobs = [];

    let expBonus = completedWave * 100;
    let goldBonus = completedWave * 50;

    const bonusMultipliers = { swarm: 1.5, elite: 2, mixed: 1.8, boss: 3 };
    if (specialType && bonusMultipliers[specialType]) {
      expBonus *= bonusMultipliers[specialType];
      goldBonus *= bonusMultipliers[specialType];
    }

    if (this.gameManager) {
      this.gameManager.addExperience(expBonus);
      this.gameManager.addGold(goldBonus);
    }
  }

  handleMobDeath(mob) {
    if (!mob.trackingId) return;
    const trackingData = this.activeMobs.get(mob.trackingId);
    if (!trackingData) return;

    this.cleanupMobHealthBar(mob);
    this.stats.totalKilled++;
    const currentKills = this.stats.killsByType.get(mob.mobType) || 0;
    this.stats.killsByType.set(mob.mobType, currentKills + 1);

    if (this.gameManager) this.gameManager.addEnemyKill();
    this.spawnMobRewards(mob);
    if (mob.isWaveMob) this.checkWaveCompletion();
    this.activeMobs.delete(mob.trackingId);
  }

  cleanupMobHealthBar(mob) {
    try {
      const mobX = mob.x;
      const mobY = mob.y;
      const childrenToDestroy = [];

      this.scene.children.list.forEach((child) => {
        if (!child || !child.x || !child.y) return;
        const distance = Phaser.Math.Distance.Between(
          child.x,
          child.y,
          mobX,
          mobY - 20
        );
        const isLikelyHealthBar =
          distance < 40 &&
          ((child.type === "Rectangle" &&
            child.displayWidth <= 50 &&
            child.displayHeight <= 8) ||
            (child.type === "Container" &&
              child.getBounds &&
              child.getBounds().width <= 50) ||
            (child.type === "Graphics" && child.displayWidth <= 50));

        if (isLikelyHealthBar) childrenToDestroy.push(child);
      });

      childrenToDestroy.forEach((element) => {
        if (element && element.active && element.destroy) element.destroy();
      });

      [
        "healthBar",
        "healthBarBg",
        "healthBarContainer",
        "healthBarFill",
        "healthBarBackground",
      ].forEach((prop) => {
        if (mob[prop] && mob[prop].destroy) {
          mob[prop].destroy();
          mob[prop] = null;
        }
      });
    } catch (error) {
      console.error("Error cleaning up mob health bar:", error);
    }
  }

  handleMobCollision(mob1, mob2) {
    const distance = Phaser.Math.Distance.Between(
      mob1.x,
      mob1.y,
      mob2.x,
      mob2.y
    );
    if (distance < 25) {
      const angle = Phaser.Math.Angle.Between(mob1.x, mob1.y, mob2.x, mob2.y);
      const force = 20;
      const pushX = Math.cos(angle) * force;
      const pushY = Math.sin(angle) * force;

      if (mob2.body) {
        mob2.body.velocity.x += pushX;
        mob2.body.velocity.y += pushY;
      }
      if (mob1.body) {
        mob1.body.velocity.x -= pushX;
        mob1.body.velocity.y -= pushY;
      }
    }
  }

  updateDifficulty(difficulty) {
    this.maxMobs = Math.min(60, 30 + difficulty * 3);
    this.spawnDelay = Math.max(1000, 3000 - difficulty * 200);
    if (this.spawnTimer) this.spawnTimer.delay = this.spawnDelay;
  }

  getActiveMobCount() {
    return Array.from(this.activeMobs.values()).filter((data) => data.isAlive)
      .length;
  }

  getAllActiveMobs() {
    return Array.from(this.activeMobs.values())
      .filter((data) => data.isAlive)
      .map((data) => data.mob);
  }

  getMobsByType(type) {
    return Array.from(this.activeMobs.values())
      .filter((data) => data.type === type && data.isAlive)
      .map((data) => data.mob);
  }

  killAllMobs() {
    this.getAllActiveMobs().forEach((mob) => {
      if (mob.takeDamage) mob.takeDamage(9999);
    });
  }

  getWaveProgress() {
    if (!this.waveActive) {
      return {
        completed: true,
        remaining: 0,
        total: 0,
        waveNumber: this.currentWave,
        nextWaveTime: this.waveTimer
          ? Math.ceil(this.waveTimer.getRemaining() / 1000)
          : 0,
      };
    }

    const aliveCount = this.waveMobs.filter(
      (m) => m.active && !m.isDead
    ).length;
    return {
      completed: false,
      remaining: aliveCount,
      total: this.waveMobs.length,
      waveNumber: this.currentWave,
      nextWaveTime: 0,
    };
  }

  getCurrentWave() {
    return this.currentWave;
  }
  isWaveActive() {
    return this.waveActive;
  }
  getTimeToNextWave() {
    return this.waveTimer ? Math.ceil(this.waveTimer.getRemaining() / 1000) : 0;
  }

  checkAndTeleportDistantMobs() {
    if (!this.player || !this.isWalkingAreaInitialized) return;

    let teleportedCount = 0;
    const config = this.teleportConfig;

    this.getAllActiveMobs().forEach((mob) => {
      if (teleportedCount >= config.maxTeleportsPerCheck) return;

      const distanceToPlayer = Phaser.Math.Distance.Between(
        mob.x,
        mob.y,
        this.player.x,
        this.player.y
      );
      if (distanceToPlayer > config.maxDistanceFromPlayer) {
        if (this.teleportMobToWalkableArea(mob)) {
          teleportedCount++;
          this.stats.totalTeleported++;
          this.createTeleportEffect(mob.x, mob.y, mob);
        }
      }
    });
  }

  teleportMobToWalkableArea(mob) {
    if (!this.player || !mob || mob.isDead) return false;

    for (let attempts = 0; attempts < 30; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Phaser.Math.Between(300, 500);
      const testX = this.player.x + Math.cos(angle) * distance;
      const testY = this.player.y + Math.sin(angle) * distance;

      if (this.isPositionOnWalkableTile(testX, testY)) {
        mob.x = testX;
        mob.y = testY;

        if (mob.body) {
          mob.body.x = testX - mob.body.width / 2;
          mob.body.y = testY - mob.body.height / 2;
          mob.body.velocity.x = 0;
          mob.body.velocity.y = 0;
        }
        return true;
      }
    }

    const emergencyPosition = this.findNearbyWalkableTile(
      this.player.x,
      this.player.y,
      this.scene.walkingArea_1,
      10
    );
    if (emergencyPosition) {
      mob.x = emergencyPosition.worldX;
      mob.y = emergencyPosition.worldY;

      if (mob.body) {
        mob.body.x = emergencyPosition.worldX - mob.body.width / 2;
        mob.body.y = emergencyPosition.worldY - mob.body.height / 2;
        mob.body.velocity.x = 0;
        mob.body.velocity.y = 0;
      }

      return true;
    }
    return false;
  }

  isPositionOnWalkableTile(worldX, worldY) {
    if (!this.scene.walkingArea_1) return true;

    const walkingAreaLayer = this.scene.walkingArea_1;
    const tileX = Math.floor((worldX - walkingAreaLayer.x) / this.tileSize);
    const tileY = Math.floor((worldY - walkingAreaLayer.y) / this.tileSize);
    const tile = walkingAreaLayer.getTileAt(tileX, tileY);
    return tile && tile.index !== 0;
  }

  teleportMobNearPlayer(mob) {
    if (!this.player || !mob || mob.isDead) return false;

    const config = this.teleportConfig;
    let newPosition = this.getRandomWalkablePositionNear(
      this.player.x,
      this.player.y,
      config.teleportRange.min,
      config.teleportRange.max,
      30
    );

    if (!newPosition) {
      const fallbackPosition = this.getRandomWalkablePosition();
      if (!fallbackPosition) return false;
      newPosition = {
        worldX: fallbackPosition.worldX,
        worldY: fallbackPosition.worldY,
      };
    }

    mob.x = newPosition.worldX;
    mob.y = newPosition.worldY;

    if (mob.body) {
      mob.body.x = newPosition.worldX - mob.body.width / 2;
      mob.body.y = newPosition.worldY - mob.body.height / 2;
      mob.body.velocity.x = 0;
      mob.body.velocity.y = 0;
    }

    return true;
  }

  teleportMobsOnObstacleTiles() {
    if (!this.scene.walkingArea_1) {
      console.warn("No walkingArea_1 found for obstacle teleportation");
      return;
    }

    const walkingAreaLayer = this.scene.walkingArea_1;
    let teleportedCount = 0;
    let checkedCount = 0;

    this.getAllActiveMobs().forEach((mob) => {
      if (mob.isDead || !mob.active) return;
      checkedCount++;

      if (this.isMobOnObstacleTile(mob, walkingAreaLayer)) {
        const newPosition = this.findNearbyWalkableTile(
          mob.x,
          mob.y,
          walkingAreaLayer
        );

        if (newPosition) {
          mob.x = newPosition.worldX;
          mob.y = newPosition.worldY;

          if (mob.body) {
            mob.body.x = newPosition.worldX - mob.body.width / 2;
            mob.body.y = newPosition.worldY - mob.body.height / 2;
            mob.body.velocity.x = 0;
            mob.body.velocity.y = 0;
          }

          this.createObstacleTeleportEffect(
            newPosition.worldX,
            newPosition.worldY
          );
          teleportedCount++;
          this.stats.totalObstacleTeleports++;
        } else {
          console.warn(
            `Could not find walkable position near mob at (${Math.floor(
              mob.x
            )}, ${Math.floor(mob.y)})`
          );
        }
      }
    });
  }

  isMobOnObstacleTile(mob, walkingAreaLayer) {
    const tileX = Math.floor((mob.x - walkingAreaLayer.x) / this.tileSize);
    const tileY = Math.floor((mob.y - walkingAreaLayer.y) / this.tileSize);
    const tile = walkingAreaLayer.getTileAt(tileX, tileY);

    if (!tile) {
      return false;
    }
    const isObstacle = tile.index === 0;

    return isObstacle;
  }

  findNearbyWalkableTile(
    centerX,
    centerY,
    walkingAreaLayer,
    maxSearchRadius = 5
  ) {
    for (let radius = 1; radius <= maxSearchRadius; radius++) {
      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          if (Math.abs(x) !== radius && Math.abs(y) !== radius) continue;

          const testWorldX = centerX + x * this.tileSize;
          const testWorldY = centerY + y * this.tileSize;

          const tileX = Math.floor(
            (testWorldX - walkingAreaLayer.x) / this.tileSize
          );
          const tileY = Math.floor(
            (testWorldY - walkingAreaLayer.y) / this.tileSize
          );

          const tile = walkingAreaLayer.getTileAt(tileX, tileY);
          if (tile && tile.index !== 0) {
            return {
              tileX: tileX,
              tileY: tileY,
              worldX:
                tileX * this.tileSize + this.tileSize / 2 + walkingAreaLayer.x,
              worldY:
                tileY * this.tileSize + this.tileSize / 2 + walkingAreaLayer.y,
            };
          }
        }
      }
    }

    return null;
  }

  createObstacleTeleportEffect(x, y) {
    if (!this.scene.add) return;

    const flash = this.scene.add.circle(x, y, 20, 0xff4444, 0.8);
    flash.setDepth(25);

    this.scene.tweens.add({
      targets: flash,
      scale: { from: 0.5, to: 2 },
      alpha: { from: 0.8, to: 0 },
      duration: 400,
      onComplete: () => flash.destroy(),
    });
  }

  createTeleportEffect(x, y, mob) {
    const config = this.teleportConfig;
    const effects = config.effects;

    if (this.gameManager?.debugMode && !effects.showEffectsInDebug) return;

    const teleportOutEffect = this.scene.add.circle(
      x,
      y,
      effects.effectRadius,
      effects.teleportOutColor,
      0.7
    );
    teleportOutEffect.setDepth(effects.effectDepth);

    this.scene.tweens.add({
      targets: teleportOutEffect,
      scale: { from: 0.5, to: 2 },
      alpha: { from: 0.7, to: 0 },
      duration: effects.effectDuration,
      onComplete: () => teleportOutEffect.destroy(),
    });

    this.scene.time.delayedCall(200, () => {
      const teleportInEffect = this.scene.add.circle(
        mob.x,
        mob.y,
        effects.effectRadius,
        effects.teleportInColor,
        0.8
      );
      teleportInEffect.setDepth(effects.effectDepth);

      this.scene.tweens.add({
        targets: teleportInEffect,
        scale: { from: 2, to: 0.5 },
        alpha: { from: 0.8, to: 0 },
        duration: effects.effectDuration,
        onComplete: () => teleportInEffect.destroy(),
      });

      if (mob && mob.active && !mob.isDead) {
        const originalTint = mob.tintTopLeft;
        mob.setTint(effects.teleportInColor);
        this.scene.time.delayedCall(effects.mobFlashDuration, () => {
          if (mob && mob.active && !mob.isDead) {
            if (originalTint) {
              mob.setTint(originalTint);
            } else {
              mob.clearTint();
            }
          }
        });
      }
    });
  }

  getStatistics() {
    const currentMobStatus = this.getMobUnlockStatus();
    const unlockedCount = Object.values(currentMobStatus).filter(status => status.unlocked).length;
    const totalMobTypes = Object.keys(MOB_CONFIGS).length;
    
    return {
      totalSpawned: this.stats.totalSpawned,
      totalKilled: this.stats.totalKilled,
      totalTeleported: this.stats.totalTeleported,
      totalObstacleTeleports: this.stats.totalObstacleTeleports,
      activeCount: this.getActiveMobCount(),
      killsByType: Object.fromEntries(this.stats.killsByType),
      currentWave: this.currentWave,
      waveActive: this.waveActive,
      waveProgress: this.getWaveProgress(),
      obstacleTeleportEnabled: this.enableObstacleTeleport,
      gameTimeElapsed: this.getGameTimeElapsed(),
      mobTypesUnlocked: unlockedCount,
      totalMobTypes: totalMobTypes,
      nextUnlockIn: this.getTimeToNextUnlock(),
      mobUnlockStatus: currentMobStatus
    };
  }

  setObstacleTeleportEnabled(enabled) {
    this.enableObstacleTeleport = enabled;
  }

  update(time, delta) {
    const toRemove = [];

    if (
      time - this.lastTeleportCheck >
      this.teleportConfig.teleportCheckInterval
    ) {
      this.checkAndTeleportDistantMobs();
      this.lastTeleportCheck = time;
    }

    if (this.enableObstacleTeleport && time - this.lastObstacleCheck > 2000) {
      this.teleportMobsOnObstacleTiles();
      this.lastObstacleCheck = time;
    }

    if (this.isGameStarted && time % 2000 < 100) {
      this.checkForNewMobUnlocks();
    }

    this.activeMobs.forEach((data, id) => {
      if (!data.mob.active || data.mob.isDead) {
        toRemove.push(id);
      }
    });

    toRemove.forEach((id) => this.activeMobs.delete(id));
    this.updateMobAbilities(time, delta);
  }

  shutdown() {
    if (this.spawnTimer) this.spawnTimer.destroy();
    if (this.waveTimer) this.waveTimer.destroy();

    this.getAllActiveMobs().forEach((mob) => {
      this.cleanupMobHealthBar(mob);
      if (mob.destroy) mob.destroy();
    });

    this.activeMobs.clear();
    this.waveMobs = [];
    if (this.mobGroup) this.mobGroup.clear(true, true);
  }
}
