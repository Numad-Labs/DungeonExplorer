// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PlayerPrefab extends Phaser.GameObjects.Image {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 24, y ?? 24, texture || "playerAsset", frame ?? 0);

		/* START-USER-CTR-CODE */
		scene.physics.add.existing(this, false);
		this.body.allowGravity = false;
		this.body.setSize(24, 24, false);
		this.body.setOffset(12, 12);

		const cam = scene.cameras.main;
		cam.startFollow(this, true, 0.1, 0.1);
		cam.setZoom(2);
		cam.fadeIn(1000);

		this.moveSpeed = 150;
		this.lastDirection = 'down';
		this.isMovingToTarget = false;
		this.maxHealth = 100;
		this.health = this.maxHealth;
		this.isInvulnerable = false;
		this.invulnerabilityTime = 500; 
		this.isDead = false;
		this.damage = 10;
		this.armor = 0;
		this.critChance = 0.05;
		this.critDamage = 1.5;
		this.fireRate = 1;
		this.attackRange = 100;
		this.pickupRange = 50;

		this.gameManager = scene.game.registry.get('gameManager');
		
		if (this.gameManager) {
			console.log("Applying fresh player stats for new run");
			this.gameManager.applyPlayerStats(this);
			console.log("Player stats after applying menu upgrades:", {
				maxHealth: this.maxHealth,
				damage: this.damage,
				moveSpeed: this.moveSpeed,
				armor: this.armor
			});
		}

		this.scene.input.on('pointerdown', this.handlePointerDown, this);
		this.scene.input.on('pointerup', this.handlePointerUp, this);

		scene.events.on('update', this.update, this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	handlePointerDown(pointer) {
		if (pointer.leftButtonDown() && !this.isDead) {
			this.isMovingToTarget = true;
		}
	}

	handlePointerUp(pointer) {
		if (!pointer.leftButtonDown()) {
			this.isMovingToTarget = false;
		}
	}
	update() {
		if (this.isDead) {
			return;
		}
		
		const keyboard = this.scene.input.keyboard;
		const up = keyboard.addKey('W').isDown;
		const down = keyboard.addKey('S').isDown;
		const left = keyboard.addKey('A').isDown;
		const right = keyboard.addKey('D').isDown;

		this.body.velocity.x = 0;
		this.body.velocity.y = 0;

		let usingKeyboard = false;
		let moveX = 0;
		let moveY = 0;

		if (right) {
			moveX += 1;
			usingKeyboard = true;
		}
		if (left) {
			moveX -= 1;
			usingKeyboard = true;
		}
		if (down) {
			moveY += 1;
			usingKeyboard = true;
		}
		if (up) {
			moveY -= 1;
			usingKeyboard = true;
		}

		if (usingKeyboard) {
			this.isMovingToTarget = false;

			if (moveX !== 0 || moveY !== 0) {
				const vector = new Phaser.Math.Vector2(moveX, moveY).normalize();
				
				this.body.velocity.x = vector.x * this.moveSpeed;
				this.body.velocity.y = vector.y * this.moveSpeed;
				
				if (Math.abs(vector.x) > Math.abs(vector.y)) {
					this.lastDirection = vector.x > 0 ? 'right' : 'left';
				} else {
					this.lastDirection = vector.y > 0 ? 'down' : 'up';
				}
			}
		}
		else if (this.isMovingToTarget) {
			const pointer = this.scene.input.activePointer;
			
			const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
			const targetX = worldPoint.x;
			const targetY = worldPoint.y;
			
			const distance = Phaser.Math.Distance.Between(
				this.x, this.y,
				targetX, targetY
			);
			
			if (distance > 5) {
				const angle = Phaser.Math.Angle.Between(
					this.x, this.y,
					targetX, targetY
				);
				
				this.body.velocity.x = Math.cos(angle) * this.moveSpeed;
				this.body.velocity.y = Math.sin(angle) * this.moveSpeed;
				
				if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
					this.lastDirection = Math.cos(angle) > 0 ? 'right' : 'left';
				} else {
					this.lastDirection = Math.sin(angle) > 0 ? 'down' : 'up';
				}
			}
		}
		
		this.updatePlayerFrame();
	}

	updatePlayerFrame() {
		if (this.isDead) return;
		switch (this.lastDirection) {
			case 'right':
				this.setFrame(2);
				break;
			case 'left':
				this.setFrame(1);
				break;
			case 'up':
				this.setFrame(3);
				break;
			case 'down':
				this.setFrame(0);
				break;
		}
	}
	takeDamage(amount, source = "Unknown") {
		if (this.isInvulnerable || this.isDead) return;
		
		const actualDamage = Math.max(1, amount - (this.armor || 0));
		
		this.health -= actualDamage;
		if (this.gameManager && this.gameManager.isGameRunning) {
			this.gameManager.currentRunStats.damageTaken += actualDamage;
		}
		
		console.log(`Player took ${actualDamage} damage from ${source}. Health: ${this.health}/${this.maxHealth}`);
		
		this.showDamageEffect(actualDamage);
		this.setTint(0xff0000);
		
		if (this.scene.sound && this.scene.sound.add) {
			try {
				if (this.scene.cache.audio.exists('player_hit')) {
					const hitSound = this.scene.sound.add('player_hit');
					hitSound.play({ volume: 0.5 });
				}
			} catch (error) {
				console.warn("Could not play hit sound:", error);
			}
		}
		
		this.makeInvulnerable();
		
		if (this.health <= 0) {
			this.die(source);
		}
	}

	makeInvulnerable() {
		if (this.isInvulnerable) return;
		
		this.isInvulnerable = true;
		
		this.scene.tweens.add({
			targets: this,
			alpha: 0.6,
			duration: 100,
			yoyo: true,
			repeat: 5,
			onComplete: () => {
				this.alpha = 1;
				this.clearTint();
			}
		});
		
		this.scene.time.delayedCall(this.invulnerabilityTime, () => {
			this.isInvulnerable = false;
		});
	}

	showDamageEffect(damage) {
		try {
			const damageText = this.scene.add.text(this.x, this.y - 30, `-${damage}`, {
				fontFamily: 'Arial',
				fontSize: '18px',
				color: '#ff4444',
				stroke: '#000000',
				strokeThickness: 2,
				fontStyle: 'bold'
			});
			damageText.setOrigin(0.5);
			damageText.setDepth(1000);
			
			this.scene.tweens.add({
				targets: damageText,
				y: damageText.y - 50,
				alpha: 0,
				duration: 1500,
				ease: 'Power2',
				onComplete: () => {
					damageText.destroy();
				}
			});
			
			if (damage > 20) {
				this.scene.cameras.main.shake(200, 0.01);
			}
			
		} catch (error) {
			console.error("Error showing damage effect:", error);
		}
	}

	die(causeOfDeath = "Skill Issue") {
		if (this.isDead) return;
		
		this.isDead = true;
		this.health = 0;
		this.body.velocity.x = 0;
		this.body.velocity.y = 0;
		this.body.enable = false;
		
		this.scene.input.keyboard.enabled = false;
		this.scene.input.off('pointerdown', this.handlePointerDown, this);
		this.scene.input.off('pointerup', this.handlePointerUp, this);
		
		if (this.scene.enemySpawnTimer) this.scene.enemySpawnTimer.paused = true;
		if (this.scene.orbSpawnTimer) this.scene.orbSpawnTimer.paused = true;
		if (this.scene.difficultyTimer) this.scene.difficultyTimer.paused = true;
		
		if (this.scene.enemies) {
			this.scene.enemies.getChildren().forEach(enemy => {
				if (enemy.body) {
					enemy.body.enable = false;
				}
				if (enemy.updateListener) {
					this.scene.events.off('update', enemy.updateListener);
				}
			});
		}
		
		if (this.gameManager) {
			this.gameManager.handlePlayerDeath(causeOfDeath);
		}
		
		this.scene.tweens.add({
			targets: this,
			angle: 90,
			alpha: 0.3,
			duration: 100
		});
		
		this.scene.time.delayedCall(1000, () => {
			if (window.returnToMenu) {
				window.returnToMenu();
			}
		});
	}
	
	heal(amount) {
		if (this.isDead) return;
		
		const oldHealth = this.health;
		this.health = Math.min(this.health + amount, this.maxHealth);
		
		const actualHeal = this.health - oldHealth;
		
		if (actualHeal > 0) {
			console.log(`Player healed for ${actualHeal}. Health: ${this.health}/${this.maxHealth}`);
			this.showHealEffect(actualHeal);
			this.setTint(0x00ff00);
			this.scene.time.delayedCall(200, () => {
				this.clearTint();
			});
		}
	}
	showHealEffect(healAmount) {
		try {
			const healText = this.scene.add.text(this.x, this.y - 30, `+${healAmount}`, {
				fontFamily: 'Arial',
				fontSize: '16px',
				color: '#44ff44',
				stroke: '#000000',
				strokeThickness: 2,
				fontStyle: 'bold'
			});
			healText.setOrigin(0.5);
			healText.setDepth(1000);
			
			this.scene.tweens.add({
				targets: healText,
				y: healText.y - 40,
				alpha: 0,
				duration: 1200,
				ease: 'Power2',
				onComplete: () => {
					healText.destroy();
				}
			});
			
		} catch (error) {
			console.error("Error showing heal effect:", error);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here