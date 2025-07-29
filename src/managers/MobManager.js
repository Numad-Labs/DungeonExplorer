import Zombie from "../prefabs/Enemies/Zombie1";
import Zombie2 from "../prefabs/Enemies/Zombie2";
import PoliceDroid from "../prefabs/Enemies/PoliceDroid";
import Assassin from "../prefabs/Enemies/Assassin";
import AssassinTank from "../prefabs/Enemies/AssassinTank";
import AssassinArcher from "../prefabs/Enemies/AssassinArcher";
import BigDude from "../prefabs/Enemies/BigDude.js";
import Wreacker from "../prefabs/Enemies/Wreacker.js";
import Choppor from "../prefabs/Enemies/Choppor.js";
import { EventBus } from "../game/EventBus";
import Crawler from "../prefabs/Enemies/Crawler.js";
import Bomber from "../prefabs/Enemies/Bomber.Scene.js";
import Saber from "../prefabs/Enemies/Saber.js";
import Guardian from "../prefabs/Enemies/Guardian.js";
import Charger from "../prefabs/Enemies/Charger.Scene.js";

const MOB_CONFIGS = {
  zombie: {
    class: Zombie,
    texture: "zombierun",
    baseHealth: 30,
    baseDamage: 10,
    baseSpeed: 50,
    expValue: 10,
    goldValue: 5,
    spawnWeight: 50,
    minWave: 1,
    expDropChance: 0.8,
    goldDropChance: 0.4,
  },

  zombieBig: {
    class: Zombie2,
    texture: "Zombie2RunAni",
    baseHealth: 50,
    baseDamage: 20,
    baseSpeed: 40,
    expValue: 20,
    goldValue: 15,
    spawnWeight: 25,
    minWave: 1,
    expDropChance: 0.85,
    goldDropChance: 0.5,
  },

  policeDroid: {
    class: PoliceDroid,
    texture: "Police run",
    baseHealth: 35,
    baseDamage: 15,
    baseSpeed: 55,
    expValue: 15,
    goldValue: 10,
    spawnWeight: 20,
    minWave: 1,
    expDropChance: 0.82,
    goldDropChance: 0.45,
  },

  assassin: {
    class: Assassin,
    texture: "Dagger Bandit-Run",
    baseHealth: 25,
    baseDamage: 25,
    baseSpeed: 70,
    expValue: 25,
    goldValue: 20,
    spawnWeight: 15,
    minWave: 2,
    expDropChance: 0.9,
    goldDropChance: 0.6,
  },

  assassinTank: {
    class: AssassinTank,
    texture: "assassinTank",
    baseHealth: 80,
    baseDamage: 30,
    baseSpeed: 30,
    expValue: 40,
    goldValue: 35,
    spawnWeight: 8,
    minWave: 2,
    expDropChance: 0.95,
    goldDropChance: 0.75,
  },

  assassinArcher: {
    class: AssassinArcher,
    texture: "assassinArcher",
    baseHealth: 20,
    baseDamage: 18,
    baseSpeed: 45,
    expValue: 30,
    goldValue: 25,
    spawnWeight: 12,
    minWave: 2,
    expDropChance: 0.92,
    goldDropChance: 0.7,
  },

  bigDude: {
    class: BigDude,
    texture: "run_2",
    baseHealth: 90,
    baseDamage: 22,
    baseSpeed: 30,
    expValue: 50,
    goldValue: 35,
    spawnWeight: 14,
    minWave: 3,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  wreacker: {
    class: Wreacker,
    texture: "WreackerRun",
    baseHealth: 30,
    baseDamage: 22,
    baseSpeed: 35,
    expValue: 50,
    goldValue: 35,
    spawnWeight: 14,
    minWave: 3,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  choppor: {
    class: Choppor,
    texture: "Warrior-Run",
    baseHealth: 30,
    baseDamage: 22,
    baseSpeed: 35,
    expValue: 50,
    goldValue: 35,
    spawnWeight: 14,
    minWave: 3,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  bomber: {
    class: Bomber,
    texture: "Bomber_Activited_run_v01",
    baseHealth: 10,
    baseDamage: 42,
    baseSpeed: 35,
    expValue: 20,
    goldValue: 15,
    spawnWeight: 14,
    minWave: 4,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  saber: {
    class: Saber,
    texture: "saber_run_53x53_v01",
    baseHealth: 10,
    baseDamage: 42,
    baseSpeed: 40,
    expValue: 20,
    goldValue: 25,
    spawnWeight: 4,
    minWave: 4,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  guardian: {
    class: Guardian,
    texture: "guradian_walk224x45",
    baseHealth: 90,
    baseDamage: 22,
    baseSpeed: 30,
    expValue: 50,
    goldValue: 35,
    spawnWeight: 14,
    minWave: 4,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  crawler: {
    class: Crawler,
    texture: "crawler_run_32x16_v01",
    baseHealth: 10,
    baseDamage: 12,
    baseSpeed: 45,
    expValue: 20,
    goldValue: 15,
    spawnWeight: 14,
    minWave: 5,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  charger: {
    class: Charger,
    texture: "harger_run_32x32_v01",
    baseHealth: 90,
    baseDamage: 32,
    baseSpeed: 45,
    expValue: 24,
    goldValue: 35,
    spawnWeight: 14,
    minWave: 5,
    expDropChance: 0.42,
    goldDropChance: 0.6,
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

    // Walking Area Management
    this.walkingAreaData = null;
    this.walkablePositions = [];
    this.tileSize = 32;
    this.mapWidth = 80;
    this.mapHeight = 80;
    this.isWalkingAreaInitialized = false;

    // Statistics
    this.stats = {
      totalSpawned: 0,
      totalKilled: 0,
      killsByType: new Map(),
    };

    Object.keys(MOB_CONFIGS).forEach((type) => {
      this.stats.killsByType.set(type, 0);
    });
  }

  initialize(gameManager, player) {
    this.gameManager = gameManager;
    this.player = player;

    this.setupMobGroup();
    this.startSpawning();
    this.setupEventListeners();
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

    if (this.waveTimer) {
      this.waveTimer.destroy();
    }

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

    mob.spawnRewards = () => {
      this.spawnMobRewards(mob);
    };
  }

  addSpecialAbilities(mob, type) {
    switch (type) {
      case "policeDroid":
        this.addProjectileAttack(mob, {
          range: 200,
          cooldown: 2000,
          projectileSpeed: 150,
          projectileColor: 0xff0000,
          projectileSize: 3,
        });
        break;

      case "zombieBig":
        this.addDeathExplosion(mob, {
          explosionRange: 80,
          explosionDamage: 15,
          explosionColor: 0xff4444,
        });
        break;

      case "assassinArcher":
        this.addProjectileAttack(mob, {
          range: 250,
          cooldown: 2500,
          projectileSpeed: 120,
          projectileColor: 0xff0000,
          projectileSize: 2,
        });
        break;
    }
  }

  addProjectileAttack(mob, config) {
    mob.projectileConfig = config;
    mob.lastProjectileTime = 0;
    mob.hasProjectileAttack = true;
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
      config.projectileSize,
      config.projectileColor
    );

    projectile.setStrokeStyle(1, 0x000000);

    this.scene.physics.add.existing(projectile);
    projectile.body.setCircle(config.projectileSize);
    projectile.setDepth(15);

    const angle = Phaser.Math.Angle.Between(
      mob.x,
      mob.y,
      this.player.x,
      this.player.y
    );

    projectile.body.setVelocity(
      Math.cos(angle) * config.projectileSpeed,
      Math.sin(angle) * config.projectileSpeed
    );

    const hitOverlap = this.scene.physics.add.overlap(
      this.player,
      projectile,
      () => {
        if (this.player.takeDamage) {
          this.player.takeDamage(mob.damage);
        }

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
    flash.setDepth(20);

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

  addDeathExplosion(mob, config) {
    mob.explosionConfig = config;

    const originalDie = mob.die?.bind(mob);
    mob.die = () => {
      this.createDeathExplosion(mob, config);
      if (originalDie) originalDie();
    };
  }

  createDeathExplosion(mob, config) {
    if (!this.player) return;

    const explosion = this.scene.add.circle(
      mob.x,
      mob.y,
      config.explosionRange,
      config.explosionColor,
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

    if (distanceToPlayer <= config.explosionRange) {
      if (this.player.takeDamage) {
        this.player.takeDamage(config.explosionDamage);
      }

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

      if (distance <= config.explosionRange) {
        if (otherMob.takeDamage) {
          otherMob.takeDamage(Math.floor(config.explosionDamage * 0.5));
        }
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

    if (mob.isSpecialWave) {
      dropChance *= 1.2;
    }

    if (mob.specialWaveType === "boss") {
      dropChance = 1.0;
    }

    if (mob.specialWaveType === "elite") {
      dropChance = Math.min(1.0, dropChance * 1.1);
    }

    if (Math.random() < dropChance) {
      let expValue = 1;

      if (mob.expValue) {
        if (mob.expValue >= 40) expValue = 5;
        else if (mob.expValue >= 25) expValue = 3;
        else if (mob.expValue >= 15) expValue = 2;
        else expValue = 1;
      }

      if (Math.random() < 0.05) {
        expValue *= 3;
      }

      if (mob.specialWaveType === "boss") {
        expValue *= 5;
      }

      if (this.scene.spawnExperienceOrb) {
        this.scene.spawnExperienceOrb(mob.x, mob.y, expValue);
      }
    }
  }

  trySpawnGoldOrb(mob) {
    const config = MOB_CONFIGS[mob.mobType];
    if (!config) return;

    let dropChance = config.goldDropChance || 0.4;

    if (mob.isSpecialWave) {
      dropChance *= 1.3;
    }

    if (mob.specialWaveType === "boss") {
      dropChance = 1.0;
    }

    if (mob.specialWaveType === "elite") {
      dropChance = Math.min(1.0, dropChance * 1.2);
    }

    if (Math.random() < dropChance) {
      let goldValue = mob.goldValue || config.goldValue;

      if (Math.random() < 0.08) {
        goldValue *= 2;
      }

      if (mob.specialWaveType === "boss") {
        goldValue *= 3;
      }

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

  selectMobType() {
    const currentLevel = Math.max(
      this.gameManager?.gameProgress?.currentDifficulty || 1,
      this.currentWave
    );

    const availableTypes = Object.keys(MOB_CONFIGS).filter((type) => {
      return MOB_CONFIGS[type].minWave <= currentLevel;
    });

    const weightedTypes = [];
    availableTypes.forEach((type) => {
      const weight = MOB_CONFIGS[type].spawnWeight;
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type);
      }
    });

    return Phaser.Utils.Array.GetRandom(weightedTypes);
  }

  getSpawnPosition() {
    if (!this.player) return { x: 0, y: 0 };

    if (this.isWalkingAreaInitialized) {
      return this.getWalkableSpawnPosition();
    }

    const angle = Math.random() * Math.PI * 2;
    const distance = Phaser.Math.Between(300, 500);

    return {
      x: this.player.x + Math.cos(angle) * distance,
      y: this.player.y + Math.sin(angle) * distance,
    };
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
    if (!flatData || !Array.isArray(flatData)) {
      return;
    }

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
            worldX: worldX,
            worldY: worldY,
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
        return {
          worldX: testX,
          worldY: testY,
        };
      }
    }

    const randomPos = this.getRandomWalkablePosition();
    return randomPos
      ? { worldX: randomPos.worldX, worldY: randomPos.worldY }
      : null;
  }

  getNearestWalkablePosition(worldX, worldY, maxSearchRadius = 10) {
    if (!this.isWalkingAreaInitialized) return { worldX, worldY };

    const centerTileX = Math.floor(worldX / this.tileSize);
    const centerTileY = Math.floor(worldY / this.tileSize);

    if (this.isTileWalkable(centerTileX, centerTileY)) {
      return {
        worldX: centerTileX * this.tileSize + this.tileSize / 2,
        worldY: centerTileY * this.tileSize + this.tileSize / 2,
      };
    }

    for (let radius = 1; radius <= maxSearchRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

          const checkX = centerTileX + dx;
          const checkY = centerTileY + dy;

          if (this.isTileWalkable(checkX, checkY)) {
            return {
              worldX: checkX * this.tileSize + this.tileSize / 2,
              worldY: checkY * this.tileSize + this.tileSize / 2,
            };
          }
        }
      }
    }

    const randomPos = this.getRandomWalkablePosition();
    return randomPos
      ? { worldX: randomPos.worldX, worldY: randomPos.worldY }
      : { worldX, worldY };
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

  teleportToWalkablePosition(entity, maxSearchRadius = 10) {
    if (!entity || !this.isWalkingAreaInitialized) return false;

    const nearestWalkable = this.getNearestWalkablePosition(
      entity.x,
      entity.y,
      maxSearchRadius
    );

    if (nearestWalkable) {
      entity.x = nearestWalkable.worldX;
      entity.y = nearestWalkable.worldY;

      if (entity.body) {
        entity.body.x = nearestWalkable.worldX - entity.body.width / 2;
        entity.body.y = nearestWalkable.worldY - entity.body.height / 2;
      }

      return true;
    }

    return false;
  }

  teleportMobToWalkable(mob) {
    const currentTileX = Math.floor(mob.x / this.tileSize);
    const currentTileY = Math.floor(mob.y / this.tileSize);

    for (let radius = 1; radius <= 10; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

          const checkX = currentTileX + dx;
          const checkY = currentTileY + dy;

          const tile = this.walkingAreaLayer.getTileAt(checkX, checkY);
          if (tile && tile.index !== 0) {
            const worldX = checkX * this.tileSize + this.tileSize / 2;
            const worldY = checkY * this.tileSize + this.tileSize / 2;

            if (this.player) {
              const distanceToPlayer = Phaser.Math.Distance.Between(
                worldX,
                worldY,
                this.player.x,
                this.player.y
              );
              if (distanceToPlayer < 200) continue;
            }

            mob.x = worldX;
            mob.y = worldY;

            if (mob.body) {
              mob.body.x = mob.x - mob.body.width / 2;
              mob.body.y = mob.y - mob.body.height / 2;
            }
            return;
          }
        }
      }
    }
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

        if (mob) {
          this.waveMobs.push(mob);
        }
      });
    }
  }

  startSpecialWave(waveNumber, specialType) {
    let mobCount, mobTypes;

    switch (specialType) {
      case "swarm":
        mobCount = Math.min(15 + waveNumber * 3, 30);
        mobTypes = ["zombie"];
        break;

      case "elite":
        mobCount = Math.floor(this.calculateWaveSize(waveNumber) * 0.4);
        mobTypes = ["assassinTank", "assassinArcher"];
        break;

      case "mixed":
        mobCount = Math.floor(this.calculateWaveSize(waveNumber) * 1.3);
        mobTypes = [
          "zombie",
          "zombieBig",
          "policeDroid",
          "assassin",
          "bigDude",
          "wreacker",
          "choppor",
          "crawler",
          "bomber",
          "saber",
          "guardian",
          "charger",
        ];
        break;

      case "boss":
        mobCount = Math.max(1, Math.floor(waveNumber / 10));
        mobTypes = ["assassinTank"];
        break;

      default:
        this.startNormalWave(waveNumber, this.calculateWaveSize(waveNumber));
        return;
    }

    for (let i = 0; i < mobCount; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const type = Phaser.Utils.Array.GetRandom(mobTypes);
        const position = this.getSpawnPosition();
        const mob = this.spawnMob(type, position.x, position.y);

        if (mob) {
          if (specialType === "elite" || specialType === "boss") {
            mob.maxHealth *= 2;
            mob.health = mob.maxHealth;
            mob.damage *= 1.5;
            mob.expValue *= 2;
            mob.goldValue *= 2;
            mob.expDropChance = Math.min(1.0, mob.expDropChance * 1.2);
            mob.goldDropChance = Math.min(1.0, mob.goldDropChance * 1.3);
          }

          if (specialType === "boss") {
            mob.maxHealth *= 3;
            mob.health = mob.maxHealth;
            mob.damage *= 2;
            mob.expValue *= 5;
            mob.goldValue *= 5;
            mob.expDropChance = 1.0;
            mob.goldDropChance = 1.0;
            mob.setTint(0xff0000);
          }

          mob.isSpecialWave = true;
          mob.specialWaveType = specialType;
          this.waveMobs.push(mob);

          this.createSpawnPortalEffect(position.x, position.y);
        }
      });
    }
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
              child.getBounds().width <= 50 &&
              child.getBounds().height <= 15) ||
            (child.type === "Graphics" &&
              child.displayWidth <= 50 &&
              child.displayHeight <= 10));

        if (isLikelyHealthBar) {
          childrenToDestroy.push(child);
        }
      });

      childrenToDestroy.forEach((element) => {
        if (element && element.active && element.destroy) {
          element.destroy();
        }
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

    if (specialType) {
      switch (specialType) {
        case "swarm":
          expBonus *= 1.5;
          goldBonus *= 1.5;
          break;
        case "elite":
          expBonus *= 2;
          goldBonus *= 2;
          break;
        case "mixed":
          expBonus *= 1.8;
          goldBonus *= 1.8;
          break;
        case "boss":
          expBonus *= 3;
          goldBonus *= 3;
          break;
      }
    }

    if (this.gameManager) {
      this.gameManager.addExperience(expBonus);
      this.gameManager.addGold(goldBonus);
    }
  }

  showWaveCompletionMessage(waveNumber, specialType, expBonus, goldBonus) {
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    let message = `WAVE ${waveNumber} COMPLETE!`;
    if (specialType) {
      message += `\n${specialType.toUpperCase()} DEFEATED!`;
    }

    const completionText = this.scene.add.text(centerX, centerY - 30, message, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#00ff00",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center",
      fontStyle: "bold",
    });
    completionText.setOrigin(0.5);
    completionText.setScrollFactor(0);
    completionText.setDepth(1000);

    const bonusText = this.scene.add.text(
      centerX,
      centerY + 20,
      `BONUS: +${expBonus} XP, +${goldBonus} Gold`,
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
      }
    );
    bonusText.setOrigin(0.5);
    bonusText.setScrollFactor(0);
    bonusText.setDepth(1000);

    this.scene.tweens.add({
      targets: [completionText, bonusText],
      scale: { from: 0, to: 1 },
      duration: 600,
      ease: "Back.easeOut",
      onComplete: () => {
        this.scene.time.delayedCall(3000, () => {
          this.scene.tweens.add({
            targets: [completionText, bonusText],
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              completionText.destroy();
              bonusText.destroy();
            },
          });
        });
      },
    });

    const successFlash = this.scene.add.rectangle(
      0,
      0,
      this.scene.cameras.main.width * 2,
      this.scene.cameras.main.height * 2,
      0x00ff00,
      0.2
    );
    successFlash.setScrollFactor(0);
    successFlash.setDepth(999);

    this.scene.tweens.add({
      targets: successFlash,
      alpha: 0,
      duration: 400,
      onComplete: () => successFlash.destroy(),
    });
  }

  handleMobDeath(mob) {
    if (!mob.trackingId) return;

    const trackingData = this.activeMobs.get(mob.trackingId);
    if (!trackingData) return;

    this.cleanupMobHealthBar(mob);

    this.stats.totalKilled++;
    const currentKills = this.stats.killsByType.get(mob.mobType) || 0;
    this.stats.killsByType.set(mob.mobType, currentKills + 1);

    if (this.gameManager) {
      this.gameManager.addEnemyKill();
    }

    this.spawnMobRewards(mob);

    if (mob.isWaveMob) {
      this.checkWaveCompletion();
    }

    this.activeMobs.delete(mob.trackingId);
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

    if (this.spawnTimer) {
      this.spawnTimer.delay = this.spawnDelay;
    }
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
      if (mob.takeDamage) {
        mob.takeDamage(9999);
      }
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

  getStatistics() {
    return {
      totalSpawned: this.stats.totalSpawned,
      totalKilled: this.stats.totalKilled,
      activeCount: this.getActiveMobCount(),
      killsByType: Object.fromEntries(this.stats.killsByType),
      currentWave: this.currentWave,
      waveActive: this.waveActive,
      waveProgress: this.getWaveProgress(),
    };
  }

  update(time, delta) {
    const toRemove = [];
    this.activeMobs.forEach((data, id) => {
      if (!data.mob.active || data.mob.isDead) {
        toRemove.push(id);
      } else if (this.isWalkingAreaInitialized && this.walkingAreaLayer) {
        const tileX = Math.floor(data.mob.x / this.tileSize);
        const tileY = Math.floor(data.mob.y / this.tileSize);

        const tile = this.walkingAreaLayer.getTileAt(tileX, tileY);
        if (!tile || tile.index === 0) {
          this.teleportMobToWalkable(data.mob);
        }
      }
    });
    toRemove.forEach((id) => this.activeMobs.delete(id));

    this.updateMobAbilities(time, delta);
  }

  shutdown() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    if (this.waveTimer) {
      this.waveTimer.destroy();
    }

    this.getAllActiveMobs().forEach((mob) => {
      this.cleanupMobHealthBar(mob);
      if (mob.destroy) mob.destroy();
    });

    this.activeMobs.clear();
    this.waveMobs = [];

    if (this.mobGroup) {
      this.mobGroup.clear(true, true);
    }
  }
}
