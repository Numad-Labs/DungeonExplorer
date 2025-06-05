// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */
export default class PlayerPrefab extends Phaser.GameObjects.Sprite {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 24, y ?? 24, texture || "heroAsset", frame ?? 0);

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
		this.isMoving = false;
		this.animationSpeed = 200;
		this.currentAnimFrame = 0;
		this.animationTimer = 0;

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
		this.createAnimations();
		this.setupMouseTracking();

		this.scene.input.on('pointerdown', this.handlePointerDown, this);
		this.scene.input.on('pointerup', this.handlePointerUp, this);

		scene.events.on('update', this.update, this);
		scene.add.existing(this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	createAnimations() {
	
		if (!this.scene.anims.exists('PlayerRunningAni')) {

			this.scene.anims.create({
				key: 'PlayerRunningAni',
				frames: this.scene.anims.generateFrameNumbers('heroAsset', { start: 0, end: 7 }),
				frameRate: 8,
				repeat: -1
			}); 
		}

		if (!this.scene.anims.exists('PlayerIdleAni')) {
			this.scene.anims.create({
				key: 'PlayerIdleAni',
				frames: [{ key: 'heroAsset', frame: 0 }],
				frameRate: 1,
				repeat: 0
			});
		}

		if (!this.scene.anims.exists('PlayerDeathAni')) {
			this.scene.anims.create({
				key: 'PlayerDeathAni',
				frames: this.scene.anims.generateFrameNumbers('heroAsset', { start: 8, end: 15 }),
				frameRate: 6,
				repeat: 0
			});
		}
	}

	setupMouseTracking() {
		this.scene.input.on('pointermove', (pointer) => {
			if (!this.isDead && this.isMovingToTarget) {
				const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
				const deltaX = worldPoint.x - this.x;
				const deltaY = worldPoint.y - this.y;
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					this.lastDirection = deltaX > 0 ? 'right' : 'left';
				} else {
					this.lastDirection = deltaY > 0 ? 'down' : 'up';
				}
			}
		});
	}

	handlePointerDown(pointer) {
		if (pointer.leftButtonDown() && !this.isDead) {
			const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
			const targetX = worldPoint.x;
			const targetY = worldPoint.y;
			
			const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
			if (distance > 10) {
				this.isMovingToTarget = true;
				
				const deltaX = targetX - this.x;
				const deltaY = targetY - this.y;
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					this.lastDirection = deltaX > 0 ? 'right' : 'left';
				} else {
					this.lastDirection = deltaY > 0 ? 'down' : 'up';
				}
				this.updatePlayerAnimation();
			}
		}
	}

	handlePointerUp(pointer) {
		if (!pointer.leftButtonDown()) {
			this.isMovingToTarget = false;
		}
	}

	update(time, delta) {
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

		let usingKeyboard = up || down || left || right;
		let moveX = 0;
		let moveY = 0;
		let wasMoving = this.isMoving;
		this.isMoving = false;

		if (usingKeyboard) {
			this.isMovingToTarget = false;

			if (left) moveX -= 1;
			if (right) moveX += 1;
			if (up) moveY -= 1;
			if (down) moveY += 1;

			if (moveX !== 0 || moveY !== 0) {
				this.isMoving = true;
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
				this.isMoving = true;
				const angle = Phaser.Math.Angle.Between(
					this.x, this.y,
					targetX, targetY
				);
				
				this.body.velocity.x = Math.cos(angle) * this.moveSpeed;
				this.body.velocity.y = Math.sin(angle) * this.moveSpeed;
				const deltaX = targetX - this.x;
				const deltaY = targetY - this.y;
				
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					this.lastDirection = deltaX > 0 ? 'right' : 'left';
				} else {
					this.lastDirection = deltaY > 0 ? 'down' : 'up';
				}
			}
		}

		this.updatePlayerAnimation(time, delta);

		if (wasMoving !== this.isMoving) {
			this.updatePlayerFrame();
		}
	}

	updatePlayerAnimation(time, delta) {
		if (this.isDead) return;

		if (this.isMoving) {
			this.setFlipX(this.lastDirection === 'left');
			if (this.scene.anims.exists('PlayerRunningAni')) {
				if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'PlayerRunningAni') {
					this.anims.play('PlayerRunningAni');
				}
			}
		} else {
	
			if (this.scene.anims.exists('PlayerIdleAni')) {
				if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'PlayerIdleAni') {
					this.anims.play('PlayerIdleAni');
				}
			} else {
				if (this.anims.isPlaying) {
					this.anims.stop();
				}
				this.setFrame(0);
			}
			this.setFlipX(this.lastDirection === 'left');
		}
	}

	updatePlayerFrame() {
		if (this.isDead) return;
		if (!this.anims.isPlaying) {
			let frameOffset = this.isMoving ? this.currentAnimFrame : 0;
			
			switch (this.lastDirection) {
				case 'right':
					this.setFrame(2 + frameOffset);
					break;
				case 'left':
					this.setFrame(1 + frameOffset);
					break;
				case 'up':
					this.setFrame(3 + frameOffset);
					break;
				case 'down':
					this.setFrame(0 + frameOffset);
					break;
			}
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
		const knockbackForce = 0;
		const knockbackDirection = this.lastDirection === 'up' ? 0	 : 
								 this.lastDirection === 'down' ? 0 :
								 this.lastDirection === 'left' ? 0 : 0;
		this.scene.tweens.add({
			targets: this,
			x: this.x + (this.lastDirection === 'left' || this.lastDirection === 'right' ? knockbackForce * knockbackDirection : 0),
			y: this.y + (this.lastDirection === 'up' || this.lastDirection === 'down' ? knockbackForce * knockbackDirection : 0),
			duration: 100,
			yoyo: true,
			ease: 'Power2'
		});
		
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
			alpha: 0.3,
			duration: 100,
			yoyo: true,
			repeat: 9,
			ease: 'Power2',
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
				x: damageText.x + Phaser.Math.Between(-10, 10),
				alpha: 0,
				scale: { from: 1, to: 1.5 },
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
		if (this.scene.anims.exists('PlayerDeathAni')) {
			this.anims.play('PlayerDeathAni');
			this.on('animationcomplete', (animation) => {
				if (animation.key === 'PlayerDeathAni') {
					this.applyDeathEffects();
				}
			});
		} else {
			this.applyDeathEffects();
		}
	}

	applyDeathEffects() {
		this.scene.tweens.add({
			targets: this,
			angle: 90,
			alpha: 0.3,
			scaleX: 0,
			scaleY: 0,
			duration: 500,
			ease: 'Power2'
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
			this.scene.tweens.add({
				targets: this,
				scaleX: 1.1,
				scaleY: 1.1,
				duration: 150,
				yoyo: true,
				ease: 'Power2'
			});
			
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
				scale: { from: 1, to: 1.2 },
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