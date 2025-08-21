// Constants.js - Game-wide constants that don't belong in config

/**
 * Physics and collision constants
 */
export const PHYSICS = {
  GRAVITY: 0,
  BOUNCE: 0,
  FRICTION: 0,
  COLLISION_CATEGORIES: {
    PLAYER: 0x0001,
    ENEMY: 0x0002,
    PROJECTILE: 0x0004,
    WALL: 0x0008,
    PICKUP: 0x0010,
    TRIGGER: 0x0020
  }
};

/**
 * Animation constants
 */
export const ANIMATIONS = {
  FRAME_RATE: 60,
  DEFAULT_DURATION: 500,
  FADE_DURATION: 300,
  QUICK_FADE: 150,
  SLOW_FADE: 800
};

/**
 * Z-Index / Depth constants for proper layering
 */
export const DEPTHS = {
  BACKGROUND: -100,
  TILEMAP_BACKGROUND: -50,
  FLOOR_EFFECTS: -10,
  PICKUPS: 10,
  ENEMIES: 50,
  PLAYER: 100,
  PROJECTILES: 150,
  EFFECTS: 200,
  UI_BACKGROUND: 900,
  UI_ELEMENTS: 1000,
  UI_TOOLTIPS: 1100,
  NOTIFICATIONS: 1500,
  LOADING: 2000,
  DEBUG: 9999
};

/**
 * Color constants (hexadecimal values)
 */
export const COLORS = {
  // UI Colors
  WHITE: 0xffffff,
  BLACK: 0x000000,
  GRAY: 0x808080,
  LIGHT_GRAY: 0xcccccc,
  DARK_GRAY: 0x404040,
  
  // Game Colors
  HEALTH: 0x00ff00,
  DAMAGE: 0xff0000,
  MANA: 0x0080ff,
  EXPERIENCE: 0xffff00,
  GOLD: 0xffd700,
  
  // Status Effects
  POISON: 0x800080,
  FIRE: 0xff4400,
  ICE: 0x00aaff,
  LIGHTNING: 0xffff80,
  
  // Rarity Colors
  COMMON: 0xffffff,
  UNCOMMON: 0x00ff00,
  RARE: 0x0080ff,
  EPIC: 0x8000ff,
  LEGENDARY: 0xff8000,
  
  // UI States
  BUTTON_NORMAL: 0x404040,
  BUTTON_HOVER: 0x606060,
  BUTTON_PRESSED: 0x202020,
  BUTTON_DISABLED: 0x808080,
  
  // Warnings and Alerts
  WARNING: 0xffaa00,
  ERROR: 0xff0000,
  SUCCESS: 0x00ff00,
  INFO: 0x00aaff
};

/**
 * Input constants
 */
export const INPUT = {
  KEYS: {
    // Movement
    MOVE_UP: 'W',
    MOVE_DOWN: 'S',
    MOVE_LEFT: 'A',
    MOVE_RIGHT: 'D',
    
    // Actions
    ATTACK: 'SPACE',
    INTERACT: 'E',
    INVENTORY: 'I',
    PAUSE: 'ESC',
    
    // Abilities
    ABILITY_1: 'Q',
    ABILITY_2: 'R',
    ABILITY_3: 'T',
    ABILITY_4: 'F',
    
    // Debug
    DEBUG_TOGGLE: 'F1',
    DEBUG_INFO: 'F2',
    DEBUG_STATS: 'F3'
  },
  
  MOUSE: {
    LEFT_BUTTON: 0,
    MIDDLE_BUTTON: 1,
    RIGHT_BUTTON: 2
  }
};

/**
 * Text style constants
 */
export const TEXT_STYLES = {
  DEFAULT: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2
  },
  
  LARGE: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3,
    fontStyle: 'bold'
  },
  
  SMALL: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 1
  },
  
  DAMAGE: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '18px',
    color: '#ff0000',
    stroke: '#000000',
    strokeThickness: 2,
    fontStyle: 'bold'
  },
  
  HEAL: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '18px',
    color: '#00ff00',
    stroke: '#000000',
    strokeThickness: 2,
    fontStyle: 'bold'
  },
  
  GOLD: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    color: '#ffd700',
    stroke: '#000000',
    strokeThickness: 2,
    fontStyle: 'bold'
  },
  
  UI_TITLE: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '20px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
    fontStyle: 'bold'
  },
  
  UI_BUTTON: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 1
  }
};

/**
 * Game state constants
 */
export const GAME_STATES = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
  SETTINGS: 'settings'
};

/**
 * Scene constants
 */
export const SCENES = {
  PRELOAD: 'Preload',
  MAIN_MAP: 'MainMapScene',
  DARK_FOREST: 'MiniMapDarkForastScene',
  BOSS_FIGHT: 'MiniMapBossFightScene',
  BEACH: 'MiniMapBeachScene',
  LAVA: 'MiniMapLavaScene',
  GAME_OVER: 'GameOverScene',
  PAUSE: 'PauseScene'
};

/**
 * Audio constants
 */
export const AUDIO = {
  MASTER_VOLUME: 1.0,
  MUSIC_VOLUME: 0.7,
  SFX_VOLUME: 0.8,
  UI_VOLUME: 0.6,
  
  FADE_DURATION: 1000,
  CROSSFADE_DURATION: 2000
};

/**
 * Effect constants
 */
export const EFFECTS = {
  PARTICLE_LIMITS: {
    MAX_PARTICLES: 100,
    MAX_EMITTERS: 10
  },
  
  DEFAULT_DURATIONS: {
    DAMAGE_FLASH: 200,
    HEAL_FLASH: 300,
    TELEPORT: 500,
    EXPLOSION: 800,
    SCREEN_SHAKE: 300
  },
  
  INTENSITIES: {
    LIGHT_SHAKE: 2,
    MEDIUM_SHAKE: 5,
    HEAVY_SHAKE: 10
  }
};

/**
 * Performance constants
 */
export const PERFORMANCE = {
  TARGET_FPS: 60,
  MIN_FPS: 30,
  
  UPDATE_INTERVALS: {
    FAST: 16,    // ~60fps
    NORMAL: 33,  // ~30fps
    SLOW: 100,   // ~10fps
    VERY_SLOW: 1000  // 1fps
  },
  
  CULLING: {
    ENABLED: true,
    MARGIN: 100  // Extra margin around camera view
  }
};

/**
 * Mathematical constants
 */
export const MATH = {
  PI: Math.PI,
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI / 2,
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
  
  EPSILON: 0.001,
  GOLDEN_RATIO: 1.618033988749895
};

/**
 * Direction constants
 */
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  UP_LEFT: { x: -0.707, y: -0.707 },
  UP_RIGHT: { x: 0.707, y: -0.707 },
  DOWN_LEFT: { x: -0.707, y: 0.707 },
  DOWN_RIGHT: { x: 0.707, y: 0.707 }
};

/**
 * Validation regex patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  SCENE_NOT_FOUND: 'Scene not found',
  ASSET_LOAD_FAILED: 'Failed to load asset',
  SAVE_FAILED: 'Failed to save game',
  LOAD_FAILED: 'Failed to load game',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_INPUT: 'Invalid input provided',
  PERMISSION_DENIED: 'Permission denied',
  GENERIC_ERROR: 'An unexpected error occurred'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  GAME_SAVED: 'Game saved successfully',
  GAME_LOADED: 'Game loaded successfully',
  SETTINGS_UPDATED: 'Settings updated',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
  LEVEL_UP: 'Level up!',
  ITEM_ACQUIRED: 'Item acquired'
};

/**
 * Format numbers consistently
 */
export const FORMATTERS = {
  CURRENCY: (amount) => `$${amount.toLocaleString()}`,
  PERCENTAGE: (value) => `${Math.round(value * 100)}%`,
  LARGE_NUMBER: (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  },
  TIME: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};

export default {
  PHYSICS,
  ANIMATIONS,
  DEPTHS,
  COLORS,
  INPUT,
  TEXT_STYLES,
  GAME_STATES,
  SCENES,
  AUDIO,
  EFFECTS,
  PERFORMANCE,
  MATH,
  DIRECTIONS,
  PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FORMATTERS
};
