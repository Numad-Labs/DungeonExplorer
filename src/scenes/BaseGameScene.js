import GameManager from "../managers/GameManager";
import UIManager from "../managers/UIManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";
import { createUpgradeDebugDisplay } from "../UpgradeIntegration";

export default class BaseGameScene extends Phaser.Scene {
    constructor(sceneKey) {
        super(sceneKey);
        
        // Game managers
        this.gameManager = null;
        this.uiManager = null;
        this.gameplayManager = null;
        this.powerUpManager = null;
        this.playerAttackSystem = null;
        
        // Player reference
        this.player = null;
        
        // Scene state
        this.isTeleporting = false;
        // Debug mode
        this.debugMode = false;
    }
    
    create() {
        this.gameManager = GameManager.get();
        console.log("BaseGameScene create: GameManager available =", !!this.gameManager);
    }
    
    // Initialize all game managers
    initializeManagers() {
        try {
            // Get the game manager instance (should already be set in create())
            if (!this.gameManager) {
                this.gameManager = GameManager.get();
            }
            
            console.log("Initializing managers with GameManager:", !!this.gameManager);
            
            // Create UI manager
            this.uiManager = new UIManager(this);
            this.uiManager.initialize();
            
            // Create gameplay manager for handling enemies, orbs, etc.
            this.gameplayManager = new GameplayManager(this);
            this.gameplayManager.initialize(this.player);
            
            // Create power-up manager
            this.powerUpManager = new PowerUpManager(this);
            this.powerUpManager.initialize();
            
            // Apply saved player stats from game manager
            if (this.player) {
                console.log("Applying player stats from GameManager to player");
                this.gameManager.applyPlayerStats(this.player);
                
                // Create debug display if in debug mode
                if (this.gameManager.debugMode) {
                    createUpgradeDebugDisplay(this, this.player);
                }
            } else {
                console.warn("Player not available when initializing managers");
            }
            
            console.log("Game managers initialized");
        } catch (error) {
            console.error("Error initializing managers:", error);
        }
    }
    
    // Setup player attack system
    setupPlayerAttack() {
        try {
            // Initialize player attack system
            this.playerAttackSystem = new PlayerAttack(this, this.player);
            
            if (this.playerAttackSystem.updateStats) {
                this.playerAttackSystem.updateStats();
            }
            console.log("Player attack system initialized");
        } catch (error) {
            console.error("Error setting up player attack:", error);
        }
    }
    
    // Handle teleportation between scenes
    handleTeleport(player, teleportZone, destScene) {
        // Prevent multiple teleports
        if (this.isTeleporting) return;
        
        // Get destination scene
        const targetScene = destScene || "MainMapScene"; // Default fallback
        
        // Set teleporting flag
        this.isTeleporting = true;
        
        // Create a teleport effect
        this.createTeleportEffect(player.x, player.y);
        
        // Save game state before transition
        if (this.gameManager) {
            this.gameManager.handleSceneTransition(this, targetScene);
        }
        
        // Transition to the new scene after a short delay
        this.time.delayedCall(500, () => {
            this.scene.start(targetScene);
            this.isTeleporting = false;
        });
    }
    
    // Create a visual teleport effect
    createTeleportEffect(x, y) {
        try {
            // Simple flash effect
            const flash = this.add.circle(x, y, 50, 0xffffff, 0.8);
            
            // Animate it
            this.tweens.add({
                targets: flash,
                scale: 2,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    flash.destroy();
                }
            });
        } catch (error) {
            console.error("Error creating teleport effect:", error);
        }
    }
    
    // Setup test controls for development
    setupTestControls() {
        try {
            // Debug toggle key (Backtick/Tilde key)
            this.input.keyboard.on('keydown-BACKTICK', () => {
                if (this.gameManager) {
                    const isDebug = this.gameManager.toggleDebugMode();
                    
                    if (isDebug) {
                        // Create debug display
                        if (this.player) {
                            createUpgradeDebugDisplay(this, this.player);
                        }
                    } else {
                        // Remove debug display
                        if (this.upgradeDebugText) {
                            this.upgradeDebugText.destroy();
                            this.upgradeDebugText = null;
                        }
                    }
                }
            });
            
            // These controls will be available in all builds but only shown in debug mode
            // T key to test teleportation
            this.input.keyboard.on('keydown-T', () => {
                // Test teleport to FirstArea (default)
                const destScene = this.scene.key === "FirstArea" ? "MainMapScene" : "FirstArea";
                this.handleTeleport(this.player, null, destScene);
            });
            
            // H key to heal player
            this.input.keyboard.on('keydown-H', () => {
                if (this.player && this.player.heal) {
                    this.player.heal(10);
                }
            });
            
            // D key to damage player
            this.input.keyboard.on('keydown-D', () => {
                if (this.player && this.player.takeDamage) {
                    this.player.takeDamage(10);
                }
            });
            
            // L key to add a level (for testing)
            this.input.keyboard.on('keydown-L', () => {
                if (this.gameManager) {
                    // Add enough XP to level up immediately
                    this.gameManager.addExperience(this.gameManager.playerStats.nextLevelExp);
                }
            });
            
            // P key to show power-up selection (for testing)
            this.input.keyboard.on('keydown-P', () => {
                if (this.powerUpManager) {
                    this.powerUpManager.showPowerUpSelection();
                }
            });
            
            // G key to add gold (for testing)
            this.input.keyboard.on('keydown-G', () => {
                if (this.gameManager) {
                    this.gameManager.addGold(100);
                    console.log(`Added 100 gold, total: ${this.gameManager.gold}`);
                }
            });
            
            console.log("Test controls enabled");
        } catch (error) {
            console.error("Error setting up test controls:", error);
        }
    }
    
    // Default update method that can be overridden by child classes
    update(time, delta) {
        try {
            // Update managers
            if (this.gameplayManager) {
                this.gameplayManager.update(time, delta);
            }
            
            if (this.uiManager) {
                this.uiManager.update(time, delta);
            }
            
            // Update player attack system
            if (this.playerAttackSystem && this.playerAttackSystem.updateStats) {
                this.playerAttackSystem.updateStats();
            }
        } catch (error) {
            console.error(`Error in ${this.scene.key} update:`, error);
        }
    }
    
    // Clean up resources when scene is shut down
    shutdown() {
        // Clean up managers
        if (this.gameplayManager) {
            this.gameplayManager.shutdown();
        }
        
        if (this.uiManager) {
            this.uiManager.shutdown();
        }
        
        if (this.powerUpManager) {
            this.powerUpManager.shutdown();
        }
        
        // Remove all input listeners
        this.input.keyboard.removeAllListeners();
        
        if (this.gameManager) {
            this.gameManager.saveGame();
        }
        
        if (this.upgradeDebugText) {
            this.upgradeDebugText.destroy();
            this.upgradeDebugText = null;
        }
        console.log(`${this.scene.key} shut down`);
    }
}