import BreakableVase from "../prefabs/BreakableVase.js";

export default class VaseSpawner {
    constructor(scene) {
        this.scene = scene;
        this.spawnedVases = [];
        this.maxVases = 50;
        this.spawnChance = 0.15;
        this.respawnEnabled = true;
        this.respawnDelay = 30000;
        this.respawnChance = 0.1;
        
        if (!scene.breakableVases) {
            scene.breakableVases = scene.physics.add.staticGroup();
        }
        
        this.setupRespawnTimer();
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
        
        const tilemap = tilemapLayer.tilemap;
        const layerData = tilemapLayer.layer;
        let vasesSpawned = 0;
        let tilesChecked = 0;
        
        console.log(`Spawning vases on layer: ${layerData.name}, size: ${layerData.width}x${layerData.height}`);
        
        for (let y = 0; y < layerData.height; y++) {
            for (let x = 0; x < layerData.width; x++) {
                if (vasesSpawned >= config.maxVases) break;
                
                const tile = tilemap.getTileAt(x, y, false, layerData.name);
                
                if (tile && tile.index !== 0) {
                    tilesChecked++;
                    
                    if (tilesChecked <= 5) {
                        console.log(`Tile at ${x},${y}: index ${tile.index}, pixelX: ${tile.pixelX}, pixelY: ${tile.pixelY}`);
                    }
                    
                    let shouldSpawn = false;
                    
                    if (config.targetTileIndex !== null) {
                        shouldSpawn = tile.index === config.targetTileIndex;
                    } else {
                        shouldSpawn = !config.excludeTileIndices.includes(tile.index);
                    }
                    
                    if (shouldSpawn && Math.random() < config.spawnChance) {
                        const worldX = tile.pixelX + (tile.width / 2) + (tilemapLayer.x || 0);
                        const worldY = tile.pixelY + (tile.height / 2) + (tilemapLayer.y || 0);
                        
                        const vase = this.createVase(worldX, worldY, config.textureKey);
                        
                        if (vase) {
                            vase.spawnPosition = { x: worldX, y: worldY };
                            this.spawnedVases.push(vase.spawnPosition);
                            vasesSpawned++;
                            
                            if (config.removeTiles !== false) {
                                tilemap.removeTileAt(x, y, false, layerData.name);
                            }
                        }
                    }
                }
            }
            if (vasesSpawned >= config.maxVases) break;
        }
        
        return vasesSpawned;
    }
    
    createVase(x, y, textureKey = "Vase") {
        try {
            console.log(`Creating vase at ${x}, ${y} with texture ${textureKey}`);
            const vase = new BreakableVase(this.scene, x, y, textureKey);
            this.scene.add.existing(vase);
            this.setupVaseCollision(vase);
            
            vase.setVisible(true);
            vase.setActive(true);
            
            console.log(`Vase created successfully at ${x}, ${y}`);
            return vase;
        } catch (error) {
            console.error("Error creating vase:", error);
            return null;
        }
    }
    
    setupVaseCollision(vase) {
        if (this.scene.breakableVases) {
            this.scene.breakableVases.add(vase);
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
        
        const currentVaseCount = this.scene.breakableVases.children.entries.length;
        const maxRespawn = Math.floor(this.maxVases / 4);
        
        let respawned = 0;
        
        for (const position of this.spawnedVases) {
            if (respawned >= maxRespawn) break;
            if (currentVaseCount + respawned >= this.maxVases) break;
            
            const existingVase = this.scene.breakableVases.children.entries.find(vase => {
                return vase.active && Phaser.Math.Distance.Between(
                    vase.x, vase.y, position.x, position.y
                ) < 32;
            });
            
            if (!existingVase && Math.random() < this.respawnChance) {
                const vase = this.createVase(position.x, position.y);
                if (vase) {
                    respawned++;
                    this.createSpawnEffect(position.x, position.y);
                }
            }
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
        if (this.respawnTimer) {
            this.respawnTimer.destroy();
            this.respawnTimer = null;
        }
        
        if (this.scene.breakableVases) {
            this.scene.breakableVases.clear(true, true);
        }
        
        this.spawnedVases = [];
    }
    
    getStatistics() {
        const activeVases = this.scene.breakableVases ? 
            this.scene.breakableVases.children.entries.filter(vase => vase.active).length : 0;
        
        return {
            maxVases: this.maxVases,
            activeVases: activeVases,
            totalSpawnPositions: this.spawnedVases.length,
            respawnEnabled: this.respawnEnabled,
            spawnChance: this.spawnChance
        };
    }
}
