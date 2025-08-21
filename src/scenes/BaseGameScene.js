import GameManager from "../managers/GameManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";
import PlayerLevel from "../prefabs/PlayerLevel";
import { EventBus } from "../game/EventBus";
import GameConfig from "../config/GameConfig.js";

export default class BaseGameScene extends Phaser.Scene {
  constructor(sceneKey) {
    super(sceneKey);
    this.initializeProperties();
  }

  initializeProperties() {
    // Core managers
    this.gameManager = null;
    this.gameplayManager = null;
    this.powerUpManager = null;
    
    // Player systems
    this.playerAttackSystem = null;
    this.playerAttack = null;
    this.playerLevelSystem = null;
    this.player = null;
    
    // Game state
    this.isTeleporting = false;
    this.debugMode = false;
    this.gameStartTime = 0;
    this.enemiesKilled = 0;
    this.currentWave = 0;
    this.isWaveActive = false;
    this.waveEnemiesRemaining = 0;
    
    // Physics groups
    this.enemies = null;
    this.experienceOrbs = null;
    this.goldOrbs = null;
    this.zombieGroup = null;
    this.staticObstacles = null;
    this.collisionLayers = [];
    
    // UI elements
    this.statsContainer = null;
    this.statsUpdateTimer = null;
    this.upgradeDebugText = null;
    
    // Timers
    this.enemySpawnTimer = null;
  }

  preload() {
    this.loadEssentialAssets();
  }

  loadEssentialAssets() {
    // Load only essential assets that every scene needs
    const assets = [
      { type: 'image', key: 'Exp', path: GameConfig.ASSETS.PICKUPS.EXP },
      { type: 'image', key: 'Health_Potion_01', path: GameConfig.ASSETS.PICKUPS.HEALTH_POTION }
    ];

    const spritesheets = [
      {
        key: 'AOE_Fire_Ball_Projectile_VFX_V01',
        path: GameConfig.ASSETS.EFFECTS.FIRE_BALL,
        config: GameConfig.ASSETS.SPRITESHEETS.FIRE_BALL
      },
      {
        key: 'AOE_Fire_Blast_Attack_VFX_V01',
        path: GameConfig.ASSETS.EFFECTS.FIRE_BLAST,
        config: GameConfig.ASSETS.SPRITESHEETS.FIRE_BLAST
      },
      {
        key: 'AOE_Ice_Shard_Projectile_VFX_V01',
        path: GameConfig.ASSETS.EFFECTS.ICE_SHARD,
        config: GameConfig.ASSETS.SPRITESHEETS.ICE_SHARD
      }
    ];

    assets.forEach(asset => this.load.image(asset.key, asset.path));
    spritesheets.forEach(sheet => this.load.spritesheet(sheet.key, sheet.path, sheet.config));
  }

  create() {
    this.initializeCore();
    this.initializeManagers();
    this.initializeUI();
    this.setupEventListeners();
    
    EventBus.emit("current-scene-ready", this);
  }

  initializeCore() {
    // Get or create game manager
    this.gameManager = this.game.registry.get("gameManager") || new GameManager();
    this.game.registry.set("gameManager", this.gameManager);
    this.gameManager.setCurrentScene(this);

    // Initialize game state
    this.gameStartTime = Date.now();
    this.resetGameState();
    
    // Initialize collision system
    this.initializeCollisionSystem();
  }

  resetGameState() {
    this.currentWave = 0;
    this.isWaveActive = false;
    this.waveEnemiesRemaining = 0;
    this.enemiesKilled = 0;
    this.isTeleporting = false;
  }

  initializeManagers() {
    try {
      this.initializePowerUpManager();
      this.initializeGameplayManager();
    } catch (error) {
      console.error("Manager initialization failed:", error);
    }
  }

  initializePowerUpManager() {
    if (!this.powerUpManager) {
      this.powerUpManager = new PowerUpManager(this);
      this.powerUpManager.initialize();
    }
  }

  initializeGameplayManager() {
    try {
      if (!this.gameplayManager) {
        this.gameplayManager = new GameplayManager(this);
        this.gameplayManager.initialize?.();
      }
    } catch (error) {
      console.warn("GameplayManager initialization failed:", error);
      this.gameplayManager = null;
    }
  }

  initializeUI() {
    this.createStatsDisplay();
  }

  // Player system initialization - streamlined
  initializePlayerSystems() {
    if (!this.player) {
      console.warn("Player not found, cannot initialize player systems");
      return;
    }

    this.setupPlayerLevel();
    this.setupPlayerAttack();
    this.setupLevelUpCallback();
    this.setupInitialSkills();
  }

  setupPlayerLevel() {
    this.playerLevelSystem = new PlayerLevel(this, 20, 20);
    this.add.existing(this.playerLevelSystem);
  }

  setupPlayerAttack() {
    this.playerAttack = new PlayerAttack(this, this.player);
    this.add.existing(this.playerAttack);
    this.playerAttackSystem = this.playerAttack;
  }

  setupLevelUpCallback() {
    this.playerLevelSystem.onLevelUp((newLevel) => {
      if (this.powerUpManager?.skillUpgradeManager) {
        this.powerUpManager.skillUpgradeManager.playerLevel = newLevel;
        this.powerUpManager.skillUpgradeManager.showSkillUpgradeSelection();
      } else {
        console.error("PowerUpManager or SkillUpgradeManager not found!");
      }
    });
  }

  setupInitialSkills() {
    this.powerUpManager?.skillUpgradeManager?.setupInitialSkills();
  }

  // Collision system - simplified
  initializeCollisionSystem() {
    const groups = ['enemies', 'experienceOrbs', 'goldOrbs', 'zombieGroup'];
    groups.forEach(group => {
      this[group] = this.physics.add.group();
    });
    
    this.staticObstacles = this.physics.add.staticGroup();
  }

  // Stats display - more modular using config
  createStatsDisplay() {
    try {
      this.createStatsContainer();
      this.createStatsBackground();
      this.createStatsTexts();
      this.startStatsUpdateTimer();
    } catch (error) {
      console.error("Stats display creation failed:", error);
    }
  }

  createStatsContainer() {
    const { x, y } = GameConfig.UI.STATS_DISPLAY.POSITION;
    this.statsContainer = this.add.container(
      this.cameras.main.width + x,
      y
    );
    this.statsContainer.setScrollFactor(0);
    this.statsContainer.setDepth(1000);
  }

  createStatsBackground() {
    const { width, height } = GameConfig.UI.STATS_DISPLAY.SIZE;
    const { color, alpha } = GameConfig.UI.STATS_DISPLAY.BACKGROUND;
    const statsBg = this.add.rectangle(-width, 0, width, height, color, alpha);
    statsBg.setOrigin(0, 0);
    this.statsContainer.add(statsBg);
  }

  createStatsTexts() {
    const textStyle = GameConfig.UI.STATS_DISPLAY.TEXT_STYLE;
    const startY = 10;
    const lineHeight = 15;

    const statTexts = [
      { key: 'levelText', text: 'Level: 1' },
      { key: 'expText', text: 'EXP: 0/100' },
      { key: 'killsText', text: 'Kills: 0' },
      { key: 'goldText', text: 'Gold: 0' },
      { key: 'timeText', text: 'Time: 00:00' },
      { key: 'waveText', text: 'Wave: 0' }
    ];

    statTexts.forEach((stat, index) => {
      this[stat.key] = this.add.text(-190, startY + (index * lineHeight), stat.text, textStyle);
      this.statsContainer.add(this[stat.key]);
    });
  }

  startStatsUpdateTimer() {
    this.statsUpdateTimer = this.time.addEvent({
      delay: GameConfig.UI.STATS_DISPLAY.UPDATE_INTERVAL,
      callback: this.updateStatsDisplay,
      callbackScope: this,
      loop: true
    });
  }

  // Stats update - optimized
  updateStatsDisplay() {
    if (!this.gameManager) return;

    try {
      const currentTime = Date.now() - this.gameStartTime;
      const stats = this.getGameStats();

      this.updateStatTexts(stats, currentTime);
    } catch (error) {
      console.error("Stats display update failed:", error);
    }
  }

  getGameStats() {
    return this.gameplayManager?.mobManager?.getStatistics() || {};
  }

  updateStatTexts(stats, currentTime) {
    const updates = [
      { element: this.levelText, text: `Level: ${this.getPlayerLevel()}` },
      { element: this.expText, text: `EXP: ${this.getPlayerExp()}` },
      { element: this.killsText, text: `Kills: ${stats.totalKilled || this.enemiesKilled}` },
      { element: this.goldText, text: `Gold: ${this.gameManager.gold || 0}` },
      { element: this.timeText, text: `Time: ${this.formatTime(currentTime)}` },
      { element: this.waveText, text: `Wave: ${stats.currentWave || this.currentWave}` }
    ];

    updates.forEach(update => {
      update.element?.setText(update.text);
    });
  }

  getPlayerLevel() {
    return this.playerLevelSystem?.getLevel() || 1;
  }

  getPlayerExp() {
    if (!this.playerLevelSystem) return '0/100';
    return `${this.playerLevelSystem.experience}/${this.playerLevelSystem.nextLevelExp}`;
  }

  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  // Event system - consolidated
  setupEventListeners() {
    this.setupWindowEventListeners();
    this.setupKeyboardListeners();
  }

  setupWindowEventListeners() {
    window.addEventListener("gameStateUpdated", this.updateStatsDisplay.bind(this));
    window.addEventListener("levelUp", this.updateStatsDisplay.bind(this));
  }

  setupKeyboardListeners() {
    // Use config for debug controls
    this.input.keyboard.on(`keydown-${GameConfig.DEBUG.CONTROLS.TOGGLE_DEBUG}`, () => {
      this.debugMode = !this.debugMode;
    });
  }

  // Player interaction - simplified
  onPlayerCreated(player) {
    this.player = player;
    this.initializePlayerSystems();
    this.setupExperienceCollection();
  }

  setupExperienceCollection() {
    if (!this.player || !this.experienceOrbs) return;

    // Experience collection
    this.physics.add.overlap(this.player, this.experienceOrbs, (player, orb) => {
      this.collectExperience(orb);
    });

    // Enemy interactions
    if (this.enemies) {
      this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision.bind(this));
    }

    if (this.zombieGroup) {
      this.physics.add.overlap(this.player, this.zombieGroup, this.handleZombieCollision.bind(this));
    }
  }

  collectExperience(orb) {
    if (this.playerLevelSystem) {
      const expAmount = orb.expValue || 1;
      this.playerLevelSystem.addExperience(expAmount);
    }
    orb.destroy();
  }

  handleEnemyCollision(player, enemy) {
    // Override in child classes
  }

  handleZombieCollision(player, zombie) {
    // Override in child classes
  }

  // Combat system - streamlined using config
  addExperience(amount) {
    this.playerLevelSystem?.addExperience(amount);
  }

  trackEnemyKill(enemy) {
    this.enemiesKilled++;
    this.playerLevelSystem?.addExperience(GameConfig.PLAYER.COMBAT.EXP_PER_KILL);
    this.gameManager?.trackEnemyKill();
  }

  removeZombie(zombie) {
    this.zombieGroup?.remove(zombie);
    this.enemies?.remove(zombie);
  }

  addEnemyToGroups(enemy) {
    if (!enemy) return;

    this.enemies?.add(enemy);
    
    if (this.isZombieType(enemy)) {
      this.zombieGroup?.add(enemy);
    }
  }

  isZombieType(enemy) {
    return enemy.isZombie || enemy.constructor.name.toLowerCase().includes("zombie");
  }

  // Spawning system - basic implementation
  startEnemySpawning() {
    if (this.gameplayManager?.mobManager) {
      try {
        this.gameplayManager.mobManager.startSpawning?.();
        return;
      } catch (error) {
        console.warn("GameplayManager spawning failed:", error);
      }
    }
    
    this.ensureEnemyGroups();
  }

  ensureEnemyGroups() {
    if (!this.enemies) this.enemies = this.physics.add.group();
    if (!this.zombieGroup) this.zombieGroup = this.physics.add.group();
  }

  spawnBasicEnemy() {
    if (!this.player?.active || this.player.isDead) return;
    // Override in child classes for specific enemy spawning
  }

  // Player attack setup - simplified
  setupPlayerAttack() {
    if (!this.player) {
      console.warn("Cannot setup player attack - player not found");
      return;
    }

    if (this.playerAttack) {
      console.log("PlayerAttack system already exists");
      return;
    }

    try {
      this.playerAttack = new PlayerAttack(this, this.player);
      this.add.existing(this.playerAttack);
      this.playerAttackSystem = this.playerAttack;
      this.playerAttack.setActive?.(true);
    } catch (error) {
      console.error("PlayerAttack initialization failed:", error);
    }
  }

  // Utility methods
  showPowerUpSelection() {
    this.powerUpManager?.showPowerUpSelection();
  }

  getPlayerLevel() {
    return this.playerLevelSystem?.getLevel() || 1;
  }

  // Update loop - optimized
  update(time, delta) {
    try {
      if (this.debugMode && this.upgradeDebugText) {
        this.updateDebugDisplay();
      }
    } catch (error) {
      console.error("BaseGameScene update error:", error);
    }
  }

  updateDebugDisplay() {
    if (!this.upgradeDebugText) return;

    try {
      this.upgradeDebugText.setText(debugInfo);
    } catch (error) {
      console.error("Debug display update failed:", error);
    }
  }

  getPlayerHealthDisplay() {
    if (!this.player) return "0/100";
    const health = this.player.health?.toFixed(1) || 0;
    const maxHealth = this.player.maxHealth?.toFixed(1) || 100;
    return `${health}/${maxHealth}`;
  }

  // Cleanup - comprehensive
  shutdown() {
    try {
      this.cleanupTimers();
      this.cleanupEventListeners();
      this.cleanupManagers();
      this.cleanupPhysicsGroups();
      this.cleanupUI();
      this.resetState();
    } catch (error) {
      console.error("BaseGameScene shutdown error:", error);
    }
  }

  cleanupTimers() {
    const timers = ['statsUpdateTimer', 'enemySpawnTimer'];
    timers.forEach(timer => {
      if (this[timer]) {
        this[timer].destroy();
        this[timer] = null;
      }
    });
  }

  cleanupEventListeners() {
    window.removeEventListener("gameStateUpdated", this.updateStatsDisplay);
    window.removeEventListener("levelUp", this.updateStatsDisplay);
    this.input.keyboard.removeAllListeners();
  }

  cleanupManagers() {
    const managers = ['gameplayManager', 'powerUpManager'];
    managers.forEach(manager => {
      if (this[manager]) {
        this[manager].shutdown?.();
        this[manager] = null;
      }
    });
  }

  cleanupPhysicsGroups() {
    const groups = ['enemies', 'experienceOrbs', 'goldOrbs', 'zombieGroup'];
    groups.forEach(group => {
      this[group] = null;
    });

    if (this.staticObstacles) {
      this.staticObstacles.clear(true, true);
      this.staticObstacles = null;
    }
  }

  cleanupUI() {
    if (this.statsContainer) {
      this.statsContainer.destroy();
      this.statsContainer = null;
    }
  }

  resetState() {
    this.collisionLayers = [];
    this.enemiesKilled = 0;
    this.currentWave = 0;
    this.isWaveActive = false;
    this.waveEnemiesRemaining = 0;
    this.gameStartTime = 0;
    
    // Save game state
    this.gameManager?.saveGame();
    if (this.gameManager) {
      this.gameManager.currentWave = 0;
    }
  }

  // Collision registration - utility methods
  registerCollisionLayer(layer, name) {
    if (layer) {
      this.collisionLayers.push({ layer, name });
    }
  }

  registerStaticObstacle(obstacle, name) {
    if (obstacle && this.staticObstacles) {
      this.staticObstacles.add(obstacle);
    }
  }

  setupZombieObstacleCollisions() {
    if (this.zombieGroup && this.staticObstacles) {
      this.physics.add.collider(this.zombieGroup, this.staticObstacles);
    }

    this.collisionLayers.forEach(({ layer }) => {
      if (this.zombieGroup && layer) {
        this.physics.add.collider(this.zombieGroup, layer);
      }
    });
  }
}
