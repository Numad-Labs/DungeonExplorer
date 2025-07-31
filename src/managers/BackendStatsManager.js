import { getUpgrades } from '../services/api/gameApiService';

/**
 * BackendStatsManager - Handles fetching and applying backend stat upgrades to game characters
 */
export class BackendStatsManager {
    static instance = null;
    
    constructor() {
        if (BackendStatsManager.instance) return BackendStatsManager.instance;
        BackendStatsManager.instance = this;
        
        this.backendUpgrades = null;
        this.isLoaded = false;
    }
    
    static getInstance() {
        if (!BackendStatsManager.instance) {
            BackendStatsManager.instance = new BackendStatsManager();
        }
        return BackendStatsManager.instance;
    }
    
    /**
     * Fetch player upgrades from backend API
     */
    async loadBackendUpgrades() {
        // Don't load upgrades if user is not authenticated
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('[BackendStatsManager] No auth token, skipping backend upgrades');
            this.backendUpgrades = {};
            this.isLoaded = false;
            return {};
        }
        
        try {
            console.log('[BackendStatsManager] Loading backend upgrades...');
            const response = await getUpgrades();
            const upgrades = response.data || response;
            
            // Convert backend upgrades to game-usable format
            this.backendUpgrades = this.convertBackendUpgrades(upgrades);
            this.isLoaded = true;
            
            console.log('[BackendStatsManager] Backend upgrades loaded:', this.backendUpgrades);
            return this.backendUpgrades;
        } catch (error) {
            console.error('[BackendStatsManager] Failed to load backend upgrades:', error);
            this.backendUpgrades = {};
            this.isLoaded = false;
            return {};
        }
    }
    
    /**
     * Convert backend upgrade format to game stat modifiers
     */
    convertBackendUpgrades(backendUpgrades) {
        const gameUpgrades = {};
        
        if (!Array.isArray(backendUpgrades)) {
            console.warn('[BackendStatsManager] Invalid backend upgrades format');
            return {};
        }
        
        backendUpgrades.forEach(upgrade => {
            const { type, level } = upgrade;
            
            switch (type) {
                case 'MAX_HEALTH':
                    // Base 100 HP + 20 per level
                    gameUpgrades.maxHealthBonus = level * 20;
                    break;
                    
                case 'DAMAGE_BOOST':
                    // Base 10 damage + 5 per level
                    gameUpgrades.damageBonus = level * 5;
                    break;
                    
                case 'MOVESPEED':
                    // Base 150 speed + 10 per level
                    gameUpgrades.moveSpeedBonus = level * 10;
                    break;
                    
                case 'COOLDOWN_REDUCTION':
                    // Reduce cooldowns by 5% per level (max 50%)
                    gameUpgrades.cooldownReduction = Math.min(level * 0.05, 0.5);
                    break;
                    
                case 'ATTACK_RANGE':
                    // Base 100 range + 15 per level
                    gameUpgrades.attackRangeBonus = level * 15;
                    break;
                    
                case 'PICKUP_RADIUS':
                    // Base 50 pickup + 10 per level
                    gameUpgrades.pickupRangeBonus = level * 10;
                    break;
                    
                case 'HP_REGEN':
                    // 1 HP per second per level
                    gameUpgrades.hpRegenBonus = level * 1;
                    break;
                    
                default:
                    console.warn(`[BackendStatsManager] Unknown upgrade type: ${type}`);
            }
        });
        
        return gameUpgrades;
    }
    
    /**
     * Apply backend upgrades to a player character
     */
    applyBackendUpgradesToPlayer(player) {
        if (!player || !this.backendUpgrades || !this.isLoaded) {
            console.log('[BackendStatsManager] Cannot apply upgrades - missing data');
            return;
        }
        
        console.log('[BackendStatsManager] Applying backend upgrades to player...');
        
        const upgrades = this.backendUpgrades;
        
        // Apply health bonus
        if (upgrades.maxHealthBonus) {
            const oldHealth = player.maxHealth;
            player.maxHealth = 100 + upgrades.maxHealthBonus; // Base 100 + bonus
            player.health = player.maxHealth; // Set to full health
            console.log(`[BackendStatsManager] Applied health: ${oldHealth} -> ${player.maxHealth}`);
        }
        
        // Apply damage bonus
        if (upgrades.damageBonus) {
            const oldDamage = player.damage;
            player.damage = 10 + upgrades.damageBonus; // Base 10 + bonus
            console.log(`[BackendStatsManager] Applied damage: ${oldDamage} -> ${player.damage}`);
        }
        
        // Apply move speed bonus
        if (upgrades.moveSpeedBonus) {
            const oldSpeed = player.moveSpeed;
            player.moveSpeed = 150 + upgrades.moveSpeedBonus; // Base 150 + bonus
            console.log(`[BackendStatsManager] Applied speed: ${oldSpeed} -> ${player.moveSpeed}`);
        }
        
        // Apply attack range bonus
        if (upgrades.attackRangeBonus) {
            const oldRange = player.attackRange;
            player.attackRange = 100 + upgrades.attackRangeBonus; // Base 100 + bonus
            console.log(`[BackendStatsManager] Applied range: ${oldRange} -> ${player.attackRange}`);
        }
        
        // Apply pickup range bonus
        if (upgrades.pickupRangeBonus) {
            const oldPickup = player.pickupRange;
            player.pickupRange = 50 + upgrades.pickupRangeBonus; // Base 50 + bonus
            console.log(`[BackendStatsManager] Applied pickup: ${oldPickup} -> ${player.pickupRange}`);
        }
        
        // Apply cooldown reduction (affects fire rate)
        if (upgrades.cooldownReduction && player.fireRate) {
            const oldFireRate = player.fireRate;
            player.fireRate = player.fireRate * (1 + upgrades.cooldownReduction);
            console.log(`[BackendStatsManager] Applied fire rate: ${oldFireRate} -> ${player.fireRate}`);
        }
        
        // Store HP regen for later use (would need to be applied in update loop)
        if (upgrades.hpRegenBonus) {
            player.hpRegenRate = upgrades.hpRegenBonus;
            console.log(`[BackendStatsManager] Set HP regen rate: ${player.hpRegenRate}/sec`);
        }
        
        // Update attack system if it exists
        if (player.scene?.playerAttackSystem?.updateStats) {
            player.scene.playerAttackSystem.updateStats();
        }
        
        console.log('[BackendStatsManager] Backend upgrades applied successfully');
    }
    
    /**
     * Get current backend upgrades (for UI display)
     */
    getBackendUpgrades() {
        return this.backendUpgrades || {};
    }
    
    /**
     * Check if backend upgrades are loaded
     */
    isBackendUpgradesLoaded() {
        return this.isLoaded;
    }
}

export default BackendStatsManager;