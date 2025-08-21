export const WORLD_CONFIG = {
  WIDTH: 2560,
  HEIGHT: 2560,
  BOUNDS: {
    MIN_X: 0,
    MIN_Y: 0,
    MAX_X: 2560,
    MAX_Y: 2560
  }
};

export const PORTAL_CONFIG = {
  ACTIVATION_INTERVAL: 20000,
  GLOW_RADIUS: 60,
  OVERLAP_SIZE: 100,
  TELEPORT_DELAY: 500,
  COLORS: {
    ACTIVE_TINT: 0x00ff00,
    ORIGINAL_TINT: 0xffffff,
    GLOW_COLOR: 0x00ff00
  },
  POSITIONS: [
    { x: 72, y: 57 },
    { x: 2482, y: 57 },
    { x: 2482, y: 2420 },
    { x: 72, y: 2420 }
  ],
  AVAILABLE_SCENES: [
    "MiniMapDarkForastScene",
    "MiniMapBossFightScene", 
    "MiniMapBeachScene",
    "MiniMapLavaScene"
  ]
};

export const WAVE_CONFIG = {
  ADVANCE_TIMER: 30000,
  ENEMIES_PER_ADVANCE: 10,
  INITIAL_WAVE: 1,
  MAX_WAVE: 100
};

export const PLAYER_CONFIG = {
  DEFAULTS: {
    health: 100,
    maxHealth: 100,
    damage: 10,
    moveSpeed: 100,
    fireRate: 1,
    attackRange: 80,
    level: 1,
    experience: 0,
    nextLevelExp: 100
  },
  LEVEL_UP: {
    EXP_MULTIPLIER: 1.2,
    BASE_EXP_REQUIREMENT: 100
  },
  COMBAT: {
    EXP_PER_KILL: 10,
    BASE_GOLD_REWARD: 2,
    MAX_GOLD_REWARD: 7
  }
};

export const GAME_BALANCE = {
  GOLD: {
    STARTING_AMOUNT: 500,
    MIN_REWARD: 2,
    MAX_REWARD: 7
  },
  DIFFICULTY: {
    SCALING_INTERVAL: 60,
    MAX_ENEMIES_BASE: 30,
    MAX_ENEMIES_CAP: 60,
    ENEMIES_PER_DIFFICULTY: 3,
    SPAWN_DELAY_BASE: 3000,
    SPAWN_DELAY_MIN: 100,
    SPAWN_DELAY_REDUCTION: 300
  },
  VASES: {
    SPAWN_CHANCE: 1.0,
    MAX_COUNT: 500
  }
};

export const UPGRADE_CONFIGS = {
  maxHealth: { 
    base: 100, 
    perLevel: 20, 
    baseCost: 100, 
    multiplier: 1.5, 
    maxLevel: 15,
    name: "Max Health",
    description: "Increases maximum health"
  },
  baseDamage: { 
    base: 10, 
    perLevel: 2, 
    baseCost: 150, 
    multiplier: 1.6, 
    maxLevel: 15,
    name: "Base Damage",
    description: "Increases base damage output"
  },
  moveSpeed: { 
    base: 200, 
    perLevel: 15, 
    baseCost: 125, 
    multiplier: 1.4, 
    maxLevel: 12,
    name: "Movement Speed",
    description: "Increases movement speed"
  },
  attackSpeed: { 
    base: 1, 
    perLevel: 0.1, 
    baseCost: 175, 
    multiplier: 1.7, 
    maxLevel: 10,
    name: "Attack Speed",
    description: "Increases attack frequency"
  },
  critChance: { 
    base: 5, 
    perLevel: 2, 
    baseCost: 200, 
    multiplier: 1.8, 
    maxLevel: 10,
    name: "Critical Chance",
    description: "Increases chance for critical hits"
  },
  critDamage: { 
    base: 150, 
    perLevel: 25, 
    baseCost: 250, 
    multiplier: 1.9, 
    maxLevel: 8,
    name: "Critical Damage",
    description: "Increases critical hit damage"
  },
  pickupRange: { 
    base: 50, 
    perLevel: 10, 
    baseCost: 120, 
    multiplier: 1.3, 
    maxLevel: 12,
    name: "Pickup Range",
    description: "Increases item collection range"
  },
  armor: { 
    base: 0, 
    perLevel: 2, 
    baseCost: 180, 
    multiplier: 1.6, 
    maxLevel: 10,
    name: "Armor",
    description: "Reduces incoming damage"
  },
  expMultiplier: { 
    base: 100, 
    perLevel: 10, 
    baseCost: 300, 
    multiplier: 2.0, 
    maxLevel: 8,
    name: "Experience Multiplier",
    description: "Increases experience gain"
  },
  goldMultiplier: { 
    base: 100, 
    perLevel: 20, 
    baseCost: 350, 
    multiplier: 2.2, 
    maxLevel: 8,
    name: "Gold Multiplier",
    description: "Increases gold gain"
  }
};

// MOB CONFIGURATION
export const MOB_CONFIGS = {
  zombie: {
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
    texture: "Bomber_Activited_run_v01",
    baseHealth: 10,
    baseDamage: 42,
    baseSpeed: 35,
    expValue: 20,
    goldValue: 15,
    spawnWeight: 14,
    minWave: 3,
    expDropChance: 0.42,
    goldDropChance: 0.6,
  },
  crawler: {
    texture: "CrawlerRun",
    baseHealth: 25,
    baseDamage: 30,
    baseSpeed: 60,
    expValue: 40,
    goldValue: 25,
    spawnWeight: 12,
    minWave: 4,
    expDropChance: 0.85,
    goldDropChance: 0.65,
  },
  saber: {
    texture: "saber",
    baseHealth: 40,
    baseDamage: 35,
    baseSpeed: 55,
    expValue: 45,
    goldValue: 30,
    spawnWeight: 10,
    minWave: 4,
    expDropChance: 0.88,
    goldDropChance: 0.7,
  },
  guardian: {
    texture: "guardian",
    baseHealth: 120,
    baseDamage: 25,
    baseSpeed: 25,
    expValue: 60,
    goldValue: 45,
    spawnWeight: 6,
    minWave: 5,
    expDropChance: 0.95,
    goldDropChance: 0.8,
  },
  charger: {
    texture: "charger",
    baseHealth: 60,
    baseDamage: 40,
    baseSpeed: 80,
    expValue: 50,
    goldValue: 35,
    spawnWeight: 8,
    minWave: 5,
    expDropChance: 0.9,
    goldDropChance: 0.75,
  }
};

export const MOB_SYSTEM_CONFIG = {
  SPAWN_SETTINGS: {
    INITIAL_SPAWN_DELAY: 2000,
    MIN_SPAWN_DELAY: 800,
    MAX_SPAWN_DELAY: 3000,
    SPAWN_DELAY_REDUCTION_PER_WAVE: 50,
    MAX_MOBS_BASE: 20,
    MAX_MOBS_PER_WAVE: 2,
    MAX_MOBS_CAP: 50
  },
  WAVE_SETTINGS: {
    WAVE_DURATION: 30000,
    MOBS_PER_WAVE_BASE: 10,
    MOBS_PER_WAVE_INCREASE: 3,
    HEALTH_SCALING_PER_WAVE: 0.15,
    DAMAGE_SCALING_PER_WAVE: 0.1
  },
  TELEPORT_SETTINGS: {
    CHECK_INTERVAL: 2000,
    DISTANCE_THRESHOLD: 600,
    SAFE_DISTANCE: 150,
    EFFECT_DURATION: 500,
    EFFECT_RADIUS: 30,
    COLORS: {
      TELEPORT_OUT: 0xff4444,
      TELEPORT_IN: 0x44ff44
    },
    EFFECT_DEPTH: 100,
    MOB_FLASH_DURATION: 300
  },
  ABILITIES: {
    COOLDOWNS: {
      CHARGE: 5000,
      BOMB: 3000,
      GUARD: 8000
    },
    RANGES: {
      CHARGE_DETECT: 200,
      BOMB_EXPLODE: 100,
      GUARD_BLOCK: 50
    }
  }
};

export const ASSET_PATHS = {
  PICKUPS: {
    EXP: "./assets/PickUp/Exp.png",
    HEALTH_POTION: "./assets/PickUp/Health_Potion_01.png"
  },
  EFFECTS: {
    FIRE_BALL: "./assets/Hero/AttackPatterns/fire_ball.png",
    FIRE_BLAST: "./assets/Hero/AttackPatterns/fire_blast.png",
    ICE_SHARD: "./assets/Hero/AttackPatterns/ice_shard.png"
  },
  SPRITESHEETS: {
    FIRE_BALL: { frameWidth: 32, frameHeight: 32 },
    FIRE_BLAST: { frameWidth: 48, frameHeight: 48 },
    ICE_SHARD: { frameWidth: 32, frameHeight: 32 }
  }
};

export const DEBUG_CONFIG = {
  ENABLED: false,
  CONTROLS: {
    TOGGLE_DEBUG: 'D',
    TRIGGER_LEVEL_UP: 'T',
    HEAL_PLAYER: 'H',
    ADD_GOLD: 'Y',
    MANUAL_ATTACK: 'K'
  },
  AUTO_FEATURES: {
    LEVEL_UP_INTERVAL: 5000, // 5 seconds
    AUTO_EXP_AMOUNT: 25
  }
};

export const PERFORMANCE_CONFIG = {
  UPDATE_INTERVALS: {
    STATS: 1000,        // Update stats display every 1 second
    DIFFICULTY: 30000,  // Check difficulty every 30 seconds
    CLEANUP: 60000      // Cleanup unused objects every minute
  },
  LIMITS: {
    MAX_PARTICLES: 100,
    MAX_ENEMIES: 60,
    MAX_PROJECTILES: 50
  }
};

// Utility functions for config access
export const ConfigUtils = {
  getUpgradeConfig: (upgradeId) => UPGRADE_CONFIGS[upgradeId],
  
  getUpgradeCost: (upgradeId, currentLevel) => {
    const config = UPGRADE_CONFIGS[upgradeId];
    if (!config) return 0;
    return Math.floor(config.baseCost * Math.pow(config.multiplier, currentLevel));
  },
  
  getUpgradeValue: (upgradeId, level) => {
    const config = UPGRADE_CONFIGS[upgradeId];
    if (!config) return 0;
    return config.base + (config.perLevel * level);
  },
  
  isUpgradeMaxed: (upgradeId, currentLevel) => {
    const config = UPGRADE_CONFIGS[upgradeId];
    return config ? currentLevel >= config.maxLevel : true;
  },
  
  getDifficultySpawnDelay: (difficultyLevel) => {
    const { SPAWN_DELAY_BASE, SPAWN_DELAY_MIN, SPAWN_DELAY_REDUCTION } = GAME_BALANCE.DIFFICULTY;
    return Math.max(SPAWN_DELAY_MIN, SPAWN_DELAY_BASE - (difficultyLevel - 1) * SPAWN_DELAY_REDUCTION);
  },
  
  getDifficultyMaxEnemies: (difficultyLevel) => {
    const { MAX_ENEMIES_BASE, MAX_ENEMIES_CAP, ENEMIES_PER_DIFFICULTY } = GAME_BALANCE.DIFFICULTY;
    return Math.min(MAX_ENEMIES_CAP, MAX_ENEMIES_BASE + (difficultyLevel - 1) * ENEMIES_PER_DIFFICULTY);
  },

  // Mob utility functions
  getMobConfig: (mobType) => MOB_CONFIGS[mobType],
  
  getAvailableMobsForWave: (wave) => {
    return Object.entries(MOB_CONFIGS).filter(([type, config]) => config.minWave <= wave);
  },
  
  calculateMobStats: (mobType, wave) => {
    const config = MOB_CONFIGS[mobType];
    if (!config) return null;
    
    const waveMultiplier = 1 + ((wave - 1) * MOB_SYSTEM_CONFIG.WAVE_SETTINGS.HEALTH_SCALING_PER_WAVE);
    const damageMultiplier = 1 + ((wave - 1) * MOB_SYSTEM_CONFIG.WAVE_SETTINGS.DAMAGE_SCALING_PER_WAVE);
    
    return {
      health: Math.floor(config.baseHealth * waveMultiplier),
      damage: Math.floor(config.baseDamage * damageMultiplier),
      speed: config.baseSpeed,
      expValue: config.expValue,
      goldValue: config.goldValue
    };
  },
  
  getWaveSpawnCount: (wave) => {
    const { MOBS_PER_WAVE_BASE, MOBS_PER_WAVE_INCREASE } = MOB_SYSTEM_CONFIG.WAVE_SETTINGS;
    return MOBS_PER_WAVE_BASE + (wave - 1) * MOBS_PER_WAVE_INCREASE;
  },
  
  getSpawnDelay: (wave) => {
    const { INITIAL_SPAWN_DELAY, MIN_SPAWN_DELAY, SPAWN_DELAY_REDUCTION_PER_WAVE } = MOB_SYSTEM_CONFIG.SPAWN_SETTINGS;
    return Math.max(MIN_SPAWN_DELAY, INITIAL_SPAWN_DELAY - (wave - 1) * SPAWN_DELAY_REDUCTION_PER_WAVE);
  }
};

// Export default configuration object
export default {
  WORLD: WORLD_CONFIG,
  PORTAL: PORTAL_CONFIG,
  WAVE: WAVE_CONFIG,
  PLAYER: PLAYER_CONFIG,
  BALANCE: GAME_BALANCE,
  UPGRADES: UPGRADE_CONFIGS,
  MOBS: MOB_CONFIGS,
  MOB_SYSTEM: MOB_SYSTEM_CONFIG,
  ASSETS: ASSET_PATHS,
  DEBUG: DEBUG_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  Utils: ConfigUtils
};
