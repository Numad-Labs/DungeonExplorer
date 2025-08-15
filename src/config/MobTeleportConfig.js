export const MOB_TELEPORT_CONFIG = {
  maxDistanceFromPlayer: 450,
  
  teleportRange: {
    min: 300,
    max: 350,
  },
  
  teleportCheckInterval: 100,
  maxTeleportsPerCheck: 10,
  
  effects: {
    teleportOutColor: 0x8800ff,
    teleportInColor: 0x00ffff,  
    effectDuration: 400,
    mobFlashDuration: 10,
    effectRadius: 5,
    effectDepth: -10,
  },
  
  debug: {
    logTeleportations: false,
    showEffectsInDebug: true,
  }
};

/**
 * Update teleportation settings at runtime
 * @param {Object} newConfig - New configuration values
 */
export function updateMobTeleportConfig(newConfig) {
  Object.assign(MOB_TELEPORT_CONFIG, newConfig);
}

/**
 * Get current teleportation configuration
 * @returns {Object} Current configuration
 */
export function getMobTeleportConfig() {
  return { ...MOB_TELEPORT_CONFIG };
}

export function resetMobTeleportConfig() {
  MOB_TELEPORT_CONFIG.maxDistanceFromPlayer = 450;
  MOB_TELEPORT_CONFIG.teleportRange = { min: 300, max: 350 };
  MOB_TELEPORT_CONFIG.teleportCheckInterval = 100;
  MOB_TELEPORT_CONFIG.maxTeleportsPerCheck = 10;
  MOB_TELEPORT_CONFIG.effects = {
    teleportOutColor: 0x8800ff,
    teleportInColor: 0x00ffff,
    effectDuration: 40,
    mobFlashDuration: 150,
    effectRadius: 25,
    effectDepth: -10,
  };
  MOB_TELEPORT_CONFIG.debug = {
    logTeleportations: false,
    showEffectsInDebug: true,
  };
}
