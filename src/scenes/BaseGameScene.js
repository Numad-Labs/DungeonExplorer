import GameManager from "../managers/GameManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";
import PlayerLevel from "../prefabs/PlayerLevel";
import { EventBus } from "../game/EventBus";
import GameConfig from "../config/GameConfig.js";
import AudioManager from "../audio/AudioManager.js";
import PauseManager from "../managers/PauseManager.js";

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
    this.audioManager = null;
    this.pauseManager = null;
    
    // Player systems
    this.playerAttack = null;
    this.playerLevelSystem = null;
    this.player = null;
    
    // Game state
    this.gameStartTime = 0;
    this.enemiesKilled = 0;
    this.currentWave = 0;
    this.debugMode = false;
    
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
    this.statTexts = {};
  }

  preload() {
    this.loadEssentialAssets();
  }

  loadEssentialAssets() {
    // Essential assets
    const assets = [
      ['image', 'Exp', GameConfig.ASSETS.PICKUPS.EXP],
      ['image', 'Health_Potion_01', GameConfig.ASSETS.PICKUPS.HEALTH_POTION],
      ['spritesheet', 'AOE_Fire_Ball_Projectile_VFX_V01', GameConfig.ASSETS.EFFECTS.FIRE_BALL, GameConfig.ASSETS.SPRITESHEETS.FIRE_BALL],
      ['spritesheet', 'AOE_Fire_Blast_Attack_VFX_V01', GameConfig.ASSETS.EFFECTS.FIRE_BLAST, GameConfig.ASSETS.SPRITESHEETS.FIRE_BLAST],
      ['spritesheet', 'AOE_Ice_Shard_Projectile_VFX_V01', GameConfig.ASSETS.EFFECTS.ICE_SHARD, GameConfig.ASSETS.SPRITESHEETS.ICE_SHARD]
    ];

    assets.forEach(([type, key, path, config]) => {
      this.load[type](key, path, config);
    });
  }

  create() {
    this.initializeCore();
    this.createStatsDisplay();
    this.setupEventListeners();
    EventBus.emit("current-scene-ready", this);
  }

  initializeCore() {
    // Setup GameManager
    this.gameManager = this.game.registry.get("gameManager") || new GameManager();
    this.game.registry.set("gameManager", this.gameManager);
    this.gameManager.setCurrentScene(this);
    window.gameManager = this.gameManager;
    this.pauseManager = PauseManager.get();
    this.audioManager = window.audioManager || (this.sound ? new AudioManager(this) : null);
    if (this.audioManager && !window.audioManager) window.audioManager = this.audioManager;
    
    // Initialize systems
    this.gameStartTime = Date.now();
    this.initializePhysicsGroups();
    this.initializeManagers();
    
    window.currentGameScene = this;
  }

  initializeManagers() {
    try {
      if (!this.powerUpManager) {
        this.powerUpManager = new PowerUpManager(this);
        this.powerUpManager.initialize();
      }
      
      if (!this.gameplayManager) {
        this.gameplayManager = new GameplayManager(this);
        this.gameplayManager.initialize?.();
      }
    } catch (error) {
      console.error("Manager initialization failed:", error);
    }
  }

  initializePhysicsGroups() {
    ['enemies', 'experienceOrbs', 'goldOrbs', 'zombieGroup'].forEach(group => {
      this[group] = this.physics.add.group();
    });
    this.staticObstacles = this.physics.add.staticGroup();
  }

  initializePlayerSystems() {
    if (!this.player) return console.warn("Player not found");

    this.playerLevelSystem = new PlayerLevel(this, 20, 20);
    this.add.existing(this.playerLevelSystem);
    this.playerAttack = new PlayerAttack(this, this.player);
    this.add.existing(this.playerAttack);
    
    this.playerLevelSystem.onLevelUp((newLevel) => {
      const skillManager = this.powerUpManager?.skillUpgradeManager;
      if (skillManager) {
        skillManager.playerLevel = newLevel;
        skillManager.showSkillUpgradeSelection();
      }
    });
    
    this.powerUpManager?.skillUpgradeManager?.setupInitialSkills();
  }

  // Stats display
  createStatsDisplay() {
    try {
      const { x, y } = GameConfig.UI.STATS_DISPLAY.POSITION;
      const { width, height } = GameConfig.UI.STATS_DISPLAY.SIZE;
      const { color, alpha } = GameConfig.UI.STATS_DISPLAY.BACKGROUND;
      
      this.statsContainer = this.add.container(this.cameras.main.width + x, y)
        .setScrollFactor(0)
        .setDepth(1000);
      
      const statsBg = this.add.rectangle(-width, 0, width, height, color, alpha).setOrigin(0, 0);
      this.statsContainer.add(statsBg);
      
      const statConfigs = [
        ['level', 'Level: 1'],
        ['exp', 'EXP: 0/100'],
        ['kills', 'Kills: 0'],
        ['gold', 'Gold: 0'],
        ['time', 'Time: 00:00'],
        ['wave', 'Wave: 0']
      ];
      
      statConfigs.forEach(([key, text], index) => {
        this.statTexts[key] = this.add.text(-190, 10 + (index * 15), text, GameConfig.UI.STATS_DISPLAY.TEXT_STYLE);
        this.statsContainer.add(this.statTexts[key]);
      });
      
      // Start update timer
      this.statsUpdateTimer = this.time.addEvent({
        delay: GameConfig.UI.STATS_DISPLAY.UPDATE_INTERVAL,
        callback: this.updateStatsDisplay,
        callbackScope: this,
        loop: true
      });
    } catch (error) {
      console.error("Stats display creation failed:", error);
    }
  }

  // Stats update
  updateStatsDisplay() {
    if (!this.gameManager || this.pauseManager?.isGamePaused()) return;

    try {
      const currentTime = Date.now() - this.gameStartTime;
      const stats = this.gameplayManager?.mobManager?.getStatistics() || {};
      const playerLevel = this.playerLevelSystem?.getLevel() || 1;
      const playerExp = this.playerLevelSystem ? 
        `${this.playerLevelSystem.experience}/${this.playerLevelSystem.nextLevelExp}` : '0/100';

      const updates = {
        level: `Level: ${playerLevel}`,
        exp: `EXP: ${playerExp}`,
        kills: `Kills: ${stats.totalKilled || this.enemiesKilled}`,
        gold: `Gold: ${this.gameManager.gold || 0}`,
        time: `Time: ${this.formatTime(currentTime)}`,
        wave: `Wave: ${stats.currentWave || this.currentWave}`
      };

      Object.entries(updates).forEach(([key, text]) => {
        this.statTexts[key]?.setText(text);
      });
    } catch (error) {
      console.error("Stats display update failed:", error);
    }
  }

  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  setupEventListeners() {
    window.addEventListener("gameStateUpdated", this.updateStatsDisplay.bind(this));
    window.addEventListener("levelUp", this.updateStatsDisplay.bind(this));
    
    this.input.keyboard.on(`keydown-${GameConfig.DEBUG.CONTROLS.TOGGLE_DEBUG}`, () => {
      this.debugMode = !this.debugMode;
    });
  }

  onPlayerCreated(player) {
    this.player = player;
    this.initializePlayerSystems();
    
    if (this.experienceOrbs) {
      this.physics.add.overlap(player, this.experienceOrbs, (player, orb) => {
        if (this.playerLevelSystem) {
          this.playerLevelSystem.addExperience(orb.expValue || 1);
        }
        orb.destroy();
      });
    }
    
    if (this.enemies) {
      this.physics.add.overlap(player, this.enemies, this.handleEnemyCollision.bind(this));
    }
    
    if (this.zombieGroup) {
      this.physics.add.overlap(player, this.zombieGroup, this.handleZombieCollision.bind(this));
    }
  }

  handleEnemyCollision(player, enemy) {
    // Override in child classes
  }

  handleZombieCollision(player, zombie) {
    // Override in child classes
  }

  addExperience(amount) {
    this.playerLevelSystem?.addExperience(amount);
  }

  trackEnemyKill(enemy) {
    this.enemiesKilled++;
    this.playerLevelSystem?.addExperience(GameConfig.PLAYER.COMBAT.EXP_PER_KILL);
    this.gameManager?.trackEnemyKill();
  }

  addEnemyToGroups(enemy) {
    if (!enemy) return;
    this.enemies?.add(enemy);
    if (enemy.isZombie || enemy.constructor.name.toLowerCase().includes("zombie")) {
      this.zombieGroup?.add(enemy);
    }
  }

  removeZombie(zombie) {
    this.zombieGroup?.remove(zombie);
    this.enemies?.remove(zombie);
  }

  startEnemySpawning() {
    try {
      this.gameplayManager?.mobManager?.startSpawning?.();
    } catch (error) {
      if (!this.enemies) this.enemies = this.physics.add.group();
      if (!this.zombieGroup) this.zombieGroup = this.physics.add.group();
    }
  }

  // Utility methods
  showPowerUpSelection() {
    this.powerUpManager?.showPowerUpSelection();
  }

  getPlayerHealthDisplay() {
    if (!this.player) return "0/100";
    const health = this.player.health?.toFixed(1) || 0;
    const maxHealth = this.player.maxHealth?.toFixed(1) || 100;
    return `${health}/${maxHealth}`;
  }

  update(time, delta) {
    if (this.pauseManager?.isGamePaused()) return;
    
    if (this.debugMode) {
      // Add debug functionality if needed
    }
  }

  shutdown() {
    try {
      this.statsUpdateTimer?.destroy();
      window.removeEventListener("gameStateUpdated", this.updateStatsDisplay);
      window.removeEventListener("levelUp", this.updateStatsDisplay);
      this.input.keyboard.removeAllListeners();
      this.gameplayManager?.shutdown?.();
      this.powerUpManager?.shutdown?.();
      this.statsContainer?.destroy();
      this.staticObstacles?.clear(true, true);
      this.enemiesKilled = 0;
      this.currentWave = 0;
      this.gameStartTime = 0;
      this.gameManager?.saveGame();
      
      if (window.currentGameScene === this) {
        delete window.currentGameScene;
      }
    } catch (error) {
      console.error("BaseGameScene shutdown error:", error);
    }
  }

  registerCollisionLayer(layer, name) {
    if (layer) this.collisionLayers.push({ layer, name });
  }

  registerStaticObstacle(obstacle) {
    this.staticObstacles?.add(obstacle);
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
