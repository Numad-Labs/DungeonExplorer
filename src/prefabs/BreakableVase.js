// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import ExpOrb from "./ExpOrb.js";
import GoldPrefab from "./GoldPrefab.js";
/* END-USER-IMPORTS */

export default class BreakableVase extends Phaser.GameObjects.Image {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 16, y ?? 16, texture || "Vase", frame ?? 0);

		/* START-USER-CTR-CODE */
		try {
			if (!scene || !scene.physics) {
				console.error('BreakableVase: Scene or physics not ready');
				return;
			}
			
			// Initialize properties first
			this.maxHealth = 1;
			this.health = this.maxHealth;
			this.isBroken = false;
			this.canBeAttacked = true;
			this.originalTint = 0xffffff;
			
			// Loot properties
			this.dropChance = {
				gold: 0.4,
				experience: 0.7,
				healing: 0.2
			};
			
			this.dropAmounts = {
				gold: { min: 1, max: 3 },
				experience: { min: 2, max: 5 },
				healing: { min: 10, max: 25 }
			};
			
			this.setTint(this.originalTint);
			this.setInteractive();
			this.randomizeTexture();
			this.createPhysicsBodyImmediate(scene);
			
		} catch (error) {
			console.error('Error in BreakableVase constructor:', error);
		}
		/* END-USER-CTR-CODE */
	}
	
		createPhysicsBodyImmediate(scene) {
		try {
			if (!scene.breakableVases) {
				scene.breakableVases = scene.physics.add.staticGroup();
				console.log('BreakableVase: Created breakableVases group');
			}
			
			// Create physics body
			scene.physics.add.existing(this, true);
			
			if (this.body) {
				this.body.setSize(28, 28);
				this.body.setOffset(2, 2);
				
				scene.breakableVases.add(this);
			} else {
				scene.time.delayedCall(50, () => {
					this.createPhysicsBody(scene);
				});
			}
			
		} catch (error) {
			this.canBeAttacked = true;
			this.isInCollisionSystem = true;
		}
	}
	
	createPhysicsBody(scene) {
		try {
			if (!scene || !scene.physics || this.body) {
				return;
			}
			
			scene.physics.add.existing(this, true);
			
			if (this.body) {
				this.body.setSize(28, 28);
				this.body.setOffset(2, 2);
				scene.time.delayedCall(16, () => {
					this.addToVaseGroup(scene);
				});
			} else {
				return;
			}
			
		} catch (error) {
			console.error('Error creating physics body for BreakableVase:', error);
		}
	}
	
	addToVaseGroup(scene) {
		try {
			// Simple check - if physics world is updating, skip group addition for now
			if (!scene.physics.world || scene.physics.world.isPaused) {
				scene.time.delayedCall(50, () => this.addToVaseGroup(scene));
				return;
			}
			
			// Ensure we have a valid physics body before adding to group
			if (!this.body || !this.body.enable) {
				return;
			}
			
			// Skip group addition entirely if it keeps failing - use alternative approach
			if (!this.addToPhysicsGroup(scene)) {
				// Alternative: Just mark as attackable without group
				this.canBeAttacked = true;
				this.isInCollisionSystem = true; // Custom flag
			}
			
		} catch (error) {
			console.error('Error adding BreakableVase to group:', error);
			// Fallback - just mark the vase as collision-ready
			this.canBeAttacked = true;
			this.isInCollisionSystem = true;
		}
	}
	
	addToPhysicsGroup(scene) {
		try {
			// Ensure breakableVases group exists
			if (!scene.breakableVases) {
				scene.breakableVases = scene.physics.add.staticGroup();
				console.log('BreakableVase: Created breakableVases group in addToPhysicsGroup');
			}
			
			// Simple test - try to get group children first
			if (!scene.breakableVases.children) {
				console.warn('BreakableVase: Group children not available');
				return false;
			}
			
			// Add to group safely with additional checks
			if (scene.breakableVases && scene.breakableVases.add && typeof scene.breakableVases.add === 'function') {
				// Check if already in group (safer check)
				let alreadyInGroup = false;
				try {
					alreadyInGroup = scene.breakableVases.contains && scene.breakableVases.contains(this);
				} catch (containsError) {
					console.warn('Contains check failed, proceeding with add:', containsError);
					alreadyInGroup = false;
				}
				
				if (!alreadyInGroup) {
					scene.breakableVases.add(this);
					console.log('BreakableVase: Successfully added to group');
					return true;
				} else {
					console.log('BreakableVase: Already in group');
					return true;
				}
			} else {
				console.warn('BreakableVase: Group add method not available');
				return false;
			}
			
		} catch (error) {
			console.error('Error in addToPhysicsGroup:', error);
			return false;
		}
	}

	/* START-USER-CODE */
	
	static VASE_FRAMES = [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
		25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
		51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
		77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102
	];
	
	static EXCLUDED_FRAMES = [
		21, 22, 23, 24
	];
	
	randomizeTexture() {
		try {
			const availableFrames = BreakableVase.VASE_FRAMES.filter(
				frame => !BreakableVase.EXCLUDED_FRAMES.includes(frame)
			);
			
			const randomFrame = availableFrames[Math.floor(Math.random() * availableFrames.length)];
			
			if (this.scene.textures.exists(this.texture.key)) {
				const texture = this.scene.textures.get(this.texture.key);
				if (texture.has(randomFrame)) {
					this.setFrame(randomFrame);
				}
			}
		} catch (error) {
			this.setFrame(0);
		}
	}
	
	takeDamage(damage = 1) {
		if (this.isBroken || !this.canBeAttacked) return false;
		
		this.health -= damage;
		
		this.setTint(0xff6666);
		this.scene.time.delayedCall(100, () => {
			if (this.active) {
				this.setTint(this.originalTint);
			}
		});
		
		if (this.health <= 0) {
			this.breakVase();
			return true;
		}
		
		return false;
	}
	
	breakVase() {
		if (this.isBroken) return;
		this.isBroken = true;
		this.canBeAttacked = false;
		this.createBreakEffect();
		this.dropLoot();
		
		// Safely remove from group
		if (this.scene.breakableVases && this.scene.breakableVases.remove) {
			try {
				this.scene.breakableVases.remove(this);
			} catch (error) {
				console.warn('Error removing vase from group:', error);
			}
		}
		
		// Disable physics body safely
		if (this.body && this.scene.physics && this.scene.physics.world) {
			try {
				this.scene.physics.world.disable(this);
			} catch (error) {
				console.warn('Error disabling physics body:', error);
			}
		}
		
		this.destroy();
	}
	
	createBreakEffect() {
		try {
			const particles = this.scene.add.particles(this.x, this.y, '__WHITE', {
				speed: { min: 50, max: 100 },
				scale: { start: 0.3, end: 0 },
				lifespan: 300,
				quantity: 8,
				tint: [0x8B4513, 0xA0522D, 0xCD853F] // Brown colors for pottery
			});
			
			this.scene.time.delayedCall(500, () => {
				if (particles.active) {
					particles.destroy();
				}
			});
			
			if (this.scene.sound && this.scene.sound.get('vase_break')) {
				this.scene.sound.play('vase_break', { volume: 0.3 });
			}
			
		} catch (error) {
			console.error("Error creating break effect:", error);
		}
	}
	
	dropLoot() {
		try {
			let droppedItems = 0;
			
			// Drop gold
			if (Math.random() < this.dropChance.gold) {
				const goldAmount = Phaser.Math.Between(
					this.dropAmounts.gold.min, 
					this.dropAmounts.gold.max
				);
				
				for (let i = 0; i < goldAmount; i++) {
					const offsetX = Phaser.Math.Between(-16, 16);
					const offsetY = Phaser.Math.Between(-16, 16);
					
					try {
						const goldOrb = new GoldPrefab(
							this.scene,
							this.x + offsetX,
							this.y + offsetY
						);
						goldOrb.setGoldValue(1);
						this.scene.add.existing(goldOrb);
						droppedItems++;
					} catch (goldError) {
						console.error("Error creating gold orb:", goldError);
					}
				}
			}
			
			// Drop experience
			if (Math.random() < this.dropChance.experience) {
				const expAmount = Phaser.Math.Between(
					this.dropAmounts.experience.min, 
					this.dropAmounts.experience.max
				);
				
				const offsetX = Phaser.Math.Between(-16, 16);
				const offsetY = Phaser.Math.Between(-16, 16);
				
				try {
					const expOrb = new ExpOrb(
						this.scene,
						this.x + offsetX,
						this.y + offsetY
					);
					expOrb.setExpValue(expAmount);
					this.scene.add.existing(expOrb);
					droppedItems++;
				} catch (expError) {
					console.error("Error creating experience orb:", expError);
				}
			}
			
			// Drop healing item
			if (Math.random() < this.dropChance.healing) {
				const healAmount = Phaser.Math.Between(
					this.dropAmounts.healing.min, 
					this.dropAmounts.healing.max
				);
				
				const offsetX = Phaser.Math.Between(-16, 16);
				const offsetY = Phaser.Math.Between(-16, 16);
				
				this.createHealingItem(this.x + offsetX, this.y + offsetY, healAmount);
				droppedItems++;
			}
			
		} catch (error) {
			console.error("Error dropping loot:", error);
		}
	}
	
	createHealingItem(x, y, healAmount) {
		try {
			const healingOrb = this.scene.add.circle(x, y, 8, 0x00ff00, 0.8);
			this.scene.physics.add.existing(healingOrb, false);
			
			healingOrb.body.setCircle(8);
			healingOrb.body.setCollideWorldBounds(false);
			healingOrb.body.setBounce(0.3, 0.3);
			healingOrb.body.setDrag(100, 100);
			
			const initialY = y;
			const floatTween = this.scene.tweens.add({
				targets: healingOrb,
				y: initialY - 5,
				duration: 1000,
				ease: 'Sine.easeInOut',
				yoyo: true,
				repeat: -1
			});
			
			healingOrb.healValue = healAmount;
			
			if (this.scene.player) {
				const overlap = this.scene.physics.add.overlap(
					this.scene.player, 
					healingOrb, 
					(player, orb) => {
						// Heal the player
						if (player.heal) {
							player.heal(orb.healValue);
						} else if (player.health !== undefined) {
							player.health = Math.min(
								player.health + orb.healValue, 
								player.maxHealth || 100
							);
						}
						this.createFloatingText(`+${orb.healValue} HP`, orb.x, orb.y - 20, '#00ff00');
						
						if (floatTween.active) {
							floatTween.destroy();
						}
						orb.destroy();
					}
				);
			}
			
			this.scene.time.delayedCall(30000, () => {
				if (healingOrb.active) {
					if (floatTween.active) {
						floatTween.destroy();
					}
					healingOrb.destroy();
				}
			});
			
		} catch (error) {
			console.error("Error creating healing item:", error);
		}
	}
	
	createFloatingText(message, x = this.x, y = this.y - 20, color = '#ffffff') {
		try {
			const floatingText = this.scene.add.text(
				x, y, message,
				{
					fontFamily: 'Arial, sans-serif',
					fontSize: '12px',
					color: color,
					stroke: '#000000',
					strokeThickness: 1
				}
			);
			floatingText.setOrigin(0.5);
			
			this.scene.tweens.add({
				targets: floatingText,
				y: floatingText.y - 30,
				alpha: 0,
				duration: 1000,
				onComplete: () => {
					floatingText.destroy();
				}
			});
		} catch (error) {
			console.error("Error creating floating text:", error);
		}
	}
	
	onPlayerAttack(damage = 1) {
		return this.takeDamage(damage);
	}
	
	static spawnVasesOnTilemap(scene, tilemapLayer, spawnChance = 0.3) {
		if (!scene.breakableVases) {
			scene.breakableVases = scene.physics.add.staticGroup();
		}
		
		const tilemap = tilemapLayer.tilemap;
		const layerData = tilemapLayer.layer;
		
		for (let y = 0; y < layerData.height; y++) {
			for (let x = 0; x < layerData.width; x++) {
				const tile = tilemap.getTileAt(x, y, false, layerData.name);
				
				if (tile && tile.index > 0) {
					if (Math.random() < spawnChance) {
						const worldX = tile.pixelX + (tile.width / 2);
						const worldY = tile.pixelY + (tile.height / 2);
						
						const vase = new BreakableVase(scene, worldX, worldY, "Vase");
						scene.add.existing(vase);
						
						tilemap.removeTileAt(x, y, false, layerData.name);
					}
				}
			}
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
