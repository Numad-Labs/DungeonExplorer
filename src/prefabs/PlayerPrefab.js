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
		
		this.damage = 10;
		this.fireRate = 1;
		this.attackRange = 100;

		this.scene.input.on('pointerdown', this.handlePointerDown, this);
		this.scene.input.on('pointerup', this.handlePointerUp, this);

		scene.events.on('update', this.update, this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	handlePointerDown(pointer) {
		if (pointer.leftButtonDown()) {
			this.isMovingToTarget = true;
		}
	}

	handlePointerUp(pointer) {
		if (!pointer.leftButtonDown()) {
			this.isMovingToTarget = false;
		}
	}

	update() {
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
		this.updateHealthBar();
	}

	updatePlayerFrame() {
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
	
	takeDamage(amount) {
		if (this.isInvulnerable) return;
		
		this.health -= amount;
		this.updateHealthBar();
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
		
		this.isInvulnerable = true;
		
		this.scene.tweens.add({
			targets: this,
			alpha: 0.6,
			duration: 100,
			yoyo: true,
			repeat: 4
		});
		
		this.scene.time.delayedCall(this.invulnerabilityTime, () => {
			this.isInvulnerable = false;
			this.clearTint();
			this.alpha = 1;
		});
		
		if (this.health <= 0) {
			this.die();
		}
	}
	
	die() {
		if (this.isDead) return;
		this.isDead = true;
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
		
		this.scene.tweens.add({
			targets: this,
			angle: 90,
			alpha: 0,
			duration: 1000
		});
		
		const screenCenterX = 640; // Fixed center position
		const screenCenterY = 360; // Fixed center position
		
		const gameOverText = this.scene.add.text(
			screenCenterX, 
			screenCenterY - 50, 
			'GAME OVER', 
			{
				fontFamily: 'Arial',
				fontSize: '48px',
				color: '#ff0000',
				stroke: '#000000',
				strokeThickness: 6
			}
		);
		gameOverText.setOrigin(0.5);
		gameOverText.setScrollFactor(0);
		gameOverText.setDepth(1000);
		
		let timeText = "";
		if (this.scene.uiManager && this.scene.uiManager.gameTime) {
			const gameTime = this.scene.uiManager.gameTime;
			const minutes = Math.floor(gameTime / 60);
			const seconds = Math.floor(gameTime % 60);
			timeText = `You survived: ${minutes}m ${seconds}s`;
		} else {
			timeText = "Nice try!";
		}
		
		const survivalText = this.scene.add.text(
			screenCenterX,
			screenCenterY,
			timeText,
			{
				fontFamily: 'Arial',
				fontSize: '24px',
				color: '#ffff00',
				stroke: '#000000',
				strokeThickness: 4
			}
		);
		survivalText.setOrigin(0.5);
		survivalText.setScrollFactor(0);
		survivalText.setDepth(1000);

		const restartText = this.scene.add.text(
			screenCenterX,
			screenCenterY + 50,
			'Skill issue i suppose?!',
			{
				fontFamily: 'Arial',
				fontSize: '24px',
				color: '#ffffff',
				stroke: '#000000',
				strokeThickness: 4
			}
		);
		restartText.setOrigin(0.5);
		restartText.setScrollFactor(0);
		restartText.setDepth(1000);
		
		this.scene.input.keyboard.once('keydown-R', () => {
			this.scene.scene.restart();
		});
		
		if (this.scene.update) {
			const originalUpdate = this.scene.update;
			this.scene.update = () => {
				// Empty update function will effectively freeze the game
				// Only checking for restart input
			};
		}
	}
	
	updateHealthBar() {
		if (this.scene.healthBar) {
			this.scene.healthBar.updateHealth(this.health, this.maxHealth);
		}
	}
	
	heal(amount) {
		this.health = Math.min(this.health + amount, this.maxHealth);
		
		this.updateHealthBar();
		
		this.setTint(0x00ff00);
		this.scene.time.delayedCall(200, () => {
			this.clearTint();
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here