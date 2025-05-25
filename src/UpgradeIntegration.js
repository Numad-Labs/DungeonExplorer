/**
 * Apply all passive upgrades from the GameManager to the player
 * @param {Object} player - The player object to apply upgrades to
 * @param {Object} gameManager - The GameManager instance with upgrade data
 */
export function applyPassiveUpgrades(player, gameManager) {
  if (!player || !gameManager) {
    console.error("Cannot apply upgrades: Missing player or gameManager");
    return;
  }
  
  console.log("Applying passive upgrades to player:", {
    playerExists: !!player,
    passiveUpgrades: gameManager.passiveUpgrades
  });
  
  try {
    const baseStats = {
      maxHealth: 100,
      health: 100,
      damage: 10,
      moveSpeed: 150,
      fireRate: 1,
      attackRange: 100
    };
    
    Object.keys(baseStats).forEach(stat => {
      if (typeof player[stat] === 'undefined') {
        player[stat] = baseStats[stat];
      }
    });
    
    if (gameManager.passiveUpgrades) {
      if (gameManager.passiveUpgrades.maxHealth) {
        const upgrade = gameManager.passiveUpgrades.maxHealth;
        const oldMaxHealth = player.maxHealth;
        player.maxHealth = baseStats.maxHealth + upgrade.value - baseStats.maxHealth;
        
        if (player.health) {
          player.health += (player.maxHealth - oldMaxHealth);
          if (player.health > player.maxHealth) {
            player.health = player.maxHealth;
          }
        }
        
        console.log(`Applied maxHealth upgrade: ${oldMaxHealth} -> ${player.maxHealth}`);
      }
      
      if (gameManager.passiveUpgrades.baseDamage) {
        const upgrade = gameManager.passiveUpgrades.baseDamage;
        const oldDamage = player.damage;
        player.damage = baseStats.damage + upgrade.value - baseStats.damage;
        console.log(`Applied damage upgrade: ${oldDamage} -> ${player.damage}`);
      }
      
      if (gameManager.passiveUpgrades.moveSpeed) {
        const upgrade = gameManager.passiveUpgrades.moveSpeed;
        const oldSpeed = player.moveSpeed;
        player.moveSpeed = baseStats.moveSpeed + upgrade.value - baseStats.moveSpeed;
        console.log(`Applied moveSpeed upgrade: ${oldSpeed} -> ${player.moveSpeed}`);
      }
      
      if (gameManager.passiveUpgrades.expMultiplier) {
        const upgrade = gameManager.passiveUpgrades.expMultiplier;
        gameManager.playerStats = gameManager.playerStats || {};
        gameManager.playerStats.expMultiplier = upgrade.value;
        console.log(`Applied expMultiplier: ${upgrade.value}`);
      }
      
      if (gameManager.passiveUpgrades.goldMultiplier) {
        const upgrade = gameManager.passiveUpgrades.goldMultiplier;
        gameManager.goldMultiplier = upgrade.value;
        console.log(`Applied goldMultiplier: ${upgrade.value}`);
      }
    }
    
    if (player.updateHealthBar && typeof player.updateHealthBar === 'function') {
      player.updateHealthBar();
    }
    
    if (player.scene && player.scene.playerAttackSystem) {
      if (player.scene.playerAttackSystem.updateStats) {
        player.scene.playerAttackSystem.updateStats();
      }
    }
    
    console.log("Passive upgrades applied successfully");
  } catch (error) {
    console.error("Error applying passive upgrades:", error);
  }
}

/**
 * Initialize a new player with base stats and upgrades
 * @param {Object} player - Player object to initialize
 * @param {Object} gameManager - GameManager with upgrade data
 */
export function initializePlayerWithUpgrades(player, gameManager) {
  if (!player) {
    console.error("Cannot initialize: Missing player object");
    return;
  }
  
  try {
    player.maxHealth = 100;
    player.health = 100;
    player.damage = 10;
    player.moveSpeed = 150;
    player.fireRate = 1;
    player.attackRange = 100;
    
    if (gameManager) {
      applyPassiveUpgrades(player, gameManager);
    }
    
    console.log("Player initialized with upgrades:", {
      health: player.health,
      maxHealth: player.maxHealth,
      damage: player.damage,
      moveSpeed: player.moveSpeed
    });
  } catch (error) {
    console.error("Error initializing player with upgrades:", error);
  }
}

/**
 * Create debug display to show upgrade effects
 * @param {Phaser.Scene} scene - The current game scene
 * @param {Object} player - The player object
 */
export function createUpgradeDebugDisplay(scene, player) {
  if (!scene || !player) return;
  
  try {
    if (scene.upgradeDebugText) {
      scene.upgradeDebugText.destroy();
    }
    
    const debugText = scene.add.text(10, 10, "", {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    debugText.setScrollFactor(0);
    debugText.setDepth(1000);
    
    const updateDebugText = () => {
      const gameManager = scene.gameManager || (scene.game && scene.game.registry.get('gameManager'));
      
      const text = [
        `Player Stats:`,
        `Health: ${player.health?.toFixed(1)}/${player.maxHealth?.toFixed(1)}`,
        `Damage: ${player.damage?.toFixed(1)}`,
        `Speed: ${player.moveSpeed?.toFixed(1)}`,
        `Fire Rate: ${player.fireRate?.toFixed(2)}`,
        `Range: ${player.attackRange?.toFixed(0)}`,
        '',
        `Multipliers:`,
        `EXP: ${gameManager?.playerStats?.expMultiplier?.toFixed(2) || 1}`,
        `Gold: ${gameManager?.goldMultiplier?.toFixed(2) || 1}`
      ].join('\n');
      
      debugText.setText(text);
    };
    
    updateDebugText();
    
    scene.events.on('update', updateDebugText);
    scene.upgradeDebugText = debugText;
    
    return debugText;
  } catch (error) {
    console.error("Error creating upgrade debug display:", error);
    return null;
  }
}