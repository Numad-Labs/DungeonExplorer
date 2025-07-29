import BreakableVase from "../prefabs/BreakableVase.js";

export default class VaseSpawner {
    constructor(scene) {
        this.scene = scene;
        this.spawnedVases = [];
        this.maxVases = 25; // Reduced from 50
        this.spawnChance = 0.1; // Reduced from 0.15
        this.respawnEnabled = false; // Disabled for now
        this.respawnDelay = 30000;
        this.respawnChance = 0.1;
        
        // Ensure scene is ready before setting up groups
        if (!scene || !scene.physics) {
            console.error('VaseSpawner: Scene or physics not ready');
            return;
        }
        
        // Create or ensure breakableVases group exists
        if (!scene.breakableVases) {
            try {
                scene.breakableVases = scene.physics.add.staticGroup();
                console.log('VaseSpawner: Created breakableVases group');
            } catch (error) {
                console.error('VaseSpawner: Error creating breakableVases group:', error);
                return;
            }
        }
        
        if (this.respawnEnabled) {
            this.setupRespawnTimer();
        }
    }
    
    spawnVasesOnTilemap(tilemapLayer, options = {}) {
        const config = {
            spawnChance: options.spawnChance || this.spawnChance,
            maxVases: options.maxVases || this.maxVases,
            textureKey: options.textureKey || "Vase",
            excludeTileIndices: options.excludeTileIndices || [0],
            targetTileIndex: options.targetTileIndex || null,
            ...options
        };
        
        // Add null checks for tilemap and layer
        if (!tilemapLayer || !tilemapLayer.tilemap || !tilemapLayer.layer) {
            console.error('VaseSpawner: Invalid tilemap layer provided');
            return 0;
        }
        
        const tilemap = tilemapLayer.tilemap;
        const layerData = tilemapLayer.layer;
        let vasesSpawned = 0;
        let tilesChecked = 0;
        
        // Add bounds checking for performance
        const maxY = Math.min(layerData.height, 100);
        const maxX = Math.min(layerData.width, 100);
        
        for (let y = 0; y < maxY; y++) {
            for (let x = 0; x < maxX; x++) {
                if (vasesSpawned >= config.maxVases) break;
                
                const tile = tilemap.getTileAt(x, y, false, layerData.name);
                
                // Enhanced null checking for tile
                if (tile && tile.index !== undefined && tile.index !== null && tile.index !== 0) {
                    tilesChecked++;
                    
                    // Safe property access with fallbacks
                    const tileWidth = tile.width || 32;
                    const tileHeight = tile.height || 32;
                    const pixelX = tile.pixelX !== undefined ? tile.pixelX : (x * tileWidth);
                    const pixelY = tile.pixelY !== undefined ? tile.pixelY : (y * tileHeight);
                    
                    if (tilesChecked <= 5) {
                        console.log(`Tile at ${x},${y}: index ${tile.index}, pixelX: ${pixelX}, pixelY: ${pixelY}`);
                    }
                    
                    let shouldSpawn = false;
                    
                    if (config.targetTileIndex !== null) {
                        shouldSpawn = tile.index === config.targetTileIndex;
                    } else {
                        shouldSpawn = !config.excludeTileIndices.includes(tile.index);
                    }
                    
                    if (shouldSpawn && Math.random() < config.spawnChance) {
                        const worldX = pixelX + (tileWidth / 2) + (tilemapLayer.x || 0);
                        const worldY = pixelY + (tileHeight / 2) + (tilemapLayer.y || 0);
                        
                        const vase = this.createVase(worldX, worldY, config.textureKey);
                        
                        if (vase) {
                            vase.spawnPosition = { x: worldX, y: worldY };
                            this.spawnedVases.push(vase.spawnPosition);
                            vasesSpawned++;
                            
                            if (config.removeTiles !== false) {
                                // Safe tile removal
                                try {
                                    tilemap.removeTileAt(x, y, false, layerData.name);
                                } catch (error) {
                                    console.warn('Failed to remove tile:', error);
                                }
                            }
                        }
                    }
                }
            }
            if (vasesSpawned >= config.maxVases) break;
        }
        
        console.log(`VaseSpawner: Spawned ${vasesSpawned} vases from ${tilesChecked} tiles checked`);
        return vasesSpawned;
    }
    
    createVase(x, y, textureKey = "Vase") {
        try {
            // Additional safety checks
            if (!this.scene || !this.scene.physics || !this.scene.add) {
                console.error('VaseSpawner: Scene not ready for vase creation');
                return null;
            }
            
            // Check if texture exists
            if (!this.scene.textures.exists(textureKey)) {
                console.warn(`VaseSpawner: Texture '${textureKey}' does not exist, using default`);
                textureKey = 'Vase'; // fallback
                
                // If default also doesn't exist, skip creation
                if (!this.scene.textures.exists(textureKey)) {
                    console.error('VaseSpawner: No valid texture available');
                    return null;
                }
            }
            
            const vase = new BreakableVase(this.scene, x, y, textureKey);
            
            // Check if vase was created successfully
            if (!vase) {
                console.error('VaseSpawner: Failed to create vase');
                return null;
            }
            
            this.scene.add.existing(vase);
            
            // Set visible and active immediately
            vase.setVisible(true);
            vase.setActive(true);
            
            return vase;
            
        } catch (error) {
            console.error("Error creating vase:", error);
            return null;
        }
    }
    
    setupVaseCollision(vase) {
        if (!vase || !vase.active) {
            console.warn('VaseSpawner: Invalid vase provided to setupVaseCollision');
            return;
        }
        
        // Ensure breakableVases group exists
        if (!this.scene.breakableVases) {
            console.warn('VaseSpawner: breakableVases group not found, creating it');
            try {
                this.scene.breakableVases = this.scene.physics.add.staticGroup();
            } catch (error) {
                console.error('VaseSpawner: Failed to create breakableVases group:', error);
                return;
            }
        }
        
        // Add vase to group safely
        try {
            if (this.scene.breakableVases && this.scene.breakableVases.add) {
                this.scene.breakableVases.add(vase);
                console.log('VaseSpawner: Vase added to collision group');
            } else {
                console.warn('VaseSpawner: breakableVases group has no add method');
            }
        } catch (error) {
            console.error('VaseSpawner: Error adding vase to collision group:', error);
        }
    }
    
    setupRespawnTimer() {
        if (!this.respawnEnabled) return;
        
        this.respawnTimer = this.scene.time.addEvent({
            delay: this.respawnDelay,
            callback: this.attemptRespawn,
            callbackScope: this,
            loop: true
        });
    }
    
    attemptRespawn() {
     if (!this.respawnEnabled || this.spawnedVases.length === 0) return;
     
     let currentVaseCount = 0;
     try {
      currentVaseCount = this.getGroupSize(this.scene.breakableVases);
     } catch (error) {
      console.warn('VaseSpawner: Error getting current vase count for respawn:', error);
      currentVaseCount = 0;
     }
     
     const maxRespawn = Math.floor(this.maxVases / 4);
     let respawned = 0;
     
     for (const position of this.spawnedVases) {
     if (respawned >= maxRespawn) break;
     if (currentVaseCount + respawned >= this.maxVases) break;
     
     let existingVase = null;
     try {
     existingVase = this.findVaseAtPosition(position.x, position.y);
      } catch (error) {
      console.warn('VaseSpawner: Error checking for existing vase:', error);
      }
      
      if (!existingVase && Math.random() < this.respawnChance) {
       const vase = this.createVase(position.x, position.y);
       if (vase) {
        respawned++;
        this.createSpawnEffect(position.x, position.y);
       }
      }
     }
     
     if (respawned > 0) {
      console.log(`VaseSpawner: Respawned ${respawned} vases`);
     }
    }
	
	// Helper method to safely get group size
	getGroupSize(group) {
		if (!group) return 0;
		
		try {
			// Check for different Phaser group structures
			if (group.children) {
				// Modern Phaser structure
				if (typeof group.children.size !== 'undefined') {
					return group.children.size;
				}
				// Legacy entries array
				if (group.children.entries && Array.isArray(group.children.entries)) {
					return group.children.entries.length;
				}
				// Legacy list array
				if (group.children.list && Array.isArray(group.children.list)) {
					return group.children.list.length;
				}
			}
			
			// Direct size property
			if (typeof group.size !== 'undefined') {
				return group.size;
			}
			
			// Length property
			if (typeof group.length !== 'undefined') {
				return group.length;
			}
			
			return 0;
			
		} catch (error) {
			console.warn('VaseSpawner: Error getting group size:', error);
			return 0;
		}
	}
	
	// Helper method to safely find vase at position
	findVaseAtPosition(x, y) {
		if (!this.scene.breakableVases) return null;
		
		try {
			const group = this.scene.breakableVases;
			let vases = [];
			
			// Get vase array from different group structures
			if (group.children) {
				if (group.children.entries && Array.isArray(group.children.entries)) {
					vases = group.children.entries;
				} else if (group.children.list && Array.isArray(group.children.list)) {
					vases = group.children.list;
				}
			} else if (Array.isArray(group)) {
				vases = group;
			}
			
			// Find vase at position
			for (const vase of vases) {
				if (vase && vase.active && 
					Phaser.Math.Distance.Between(vase.x, vase.y, x, y) < 32) {
					return vase;
				}
			}
			
			return null;
			
		} catch (error) {
			console.warn('VaseSpawner: Error finding vase at position:', error);
			return null;
		}
	}
    
    createSpawnEffect(x, y) {
        try {
            const effect = this.scene.add.circle(x, y, 20, 0x00ff00, 0.3);
            
            this.scene.tweens.add({
                targets: effect,
                scale: { from: 0, to: 1.5 },
                alpha: { from: 0.5, to: 0 },
                duration: 500,
                onComplete: () => effect.destroy()
            });
        } catch (error) {
            console.error("Error creating spawn effect:", error);
        }
    }
    
    destroy() {
        try {
            if (this.respawnTimer) {
                this.respawnTimer.destroy();
                this.respawnTimer = null;
            }
            
            if (this.scene.breakableVases) {
                // Safely clear the group
                try {
                    this.scene.breakableVases.clear(true, true);
                } catch (error) {
                    console.warn('VaseSpawner: Error clearing breakableVases group:', error);
                }
            }
            
            this.spawnedVases = [];
            console.log('VaseSpawner: Cleanup completed');
            
        } catch (error) {
            console.error('VaseSpawner: Error during destroy:', error);
        }
    }
    
    getStatistics() {
     const activeVases = this.getGroupSize(this.scene.breakableVases);
     
     return {
      maxVases: this.maxVases,
      activeVases: activeVases,
      totalSpawnPositions: this.spawnedVases.length,
      respawnEnabled: this.respawnEnabled,
      spawnChance: this.spawnChance
     };
    }
}
