// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PlayerPrefab extends Phaser.GameObjects.Image {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 24, y ?? 24, texture || "playerAsset", frame ?? 0);

		/* START-USER-CTR-CODE */
		// Add physics to the player
		scene.physics.add.existing(this, false);
		this.body.allowGravity = false;
		this.body.setSize(24, 24, false);
		this.body.setOffset(12, 12);

		// Set up camera to follow player
		const cam = scene.cameras.main;
		cam.startFollow(this, true, 0.1, 0.1);
		cam.setZoom(2);
		cam.fadeIn(1000);

		// Movement properties
		this.moveSpeed = 150;
		this.lastDirection = 'down';
		this.isMovingToTarget = false;

		// Mouse input handlers
		this.scene.input.on('pointerdown', this.handlePointerDown, this);
		this.scene.input.on('pointerup', this.handlePointerUp, this);

		// Register update cycle
		scene.events.on('update', this.update, this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	// Handle left mouse button press
	handlePointerDown(pointer) {
		if (pointer.leftButtonDown()) {
			this.isMovingToTarget = true;
		}
	}

	// Handle left mouse button release
	handlePointerUp(pointer) {
		if (!pointer.leftButtonDown()) {
			this.isMovingToTarget = false;
		}
	}

	// Main update function
	update() {
		// Get keyboard input
		const keyboard = this.scene.input.keyboard;
		const up = keyboard.addKey('W').isDown;
		const down = keyboard.addKey('S').isDown;
		const left = keyboard.addKey('A').isDown;
		const right = keyboard.addKey('D').isDown;

		// Reset velocity
		this.body.velocity.x = 0;
		this.body.velocity.y = 0;

		// Process keyboard input first (priority)
		let usingKeyboard = false;
		let moveX = 0;
		let moveY = 0;

		// Get movement direction from keyboard
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

		// Apply keyboard movement if any keys are pressed
		if (usingKeyboard) {
			// Cancel any mouse target movement
			this.isMovingToTarget = false;

			// Apply movement if we have any direction
			if (moveX !== 0 || moveY !== 0) {
				// Normalize for diagonal movement
				const vector = new Phaser.Math.Vector2(moveX, moveY).normalize();
				
				// Apply velocity
				this.body.velocity.x = vector.x * this.moveSpeed;
				this.body.velocity.y = vector.y * this.moveSpeed;
				
				// Update facing direction
				if (Math.abs(vector.x) > Math.abs(vector.y)) {
					this.lastDirection = vector.x > 0 ? 'right' : 'left';
				} else {
					this.lastDirection = vector.y > 0 ? 'down' : 'up';
				}
			}
		}
		// If not using keyboard, check for mouse movement
		else if (this.isMovingToTarget) {
			// Get current cursor position
			const pointer = this.scene.input.activePointer;
			
			// Convert screen position to world position
			const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
			const targetX = worldPoint.x;
			const targetY = worldPoint.y;
			
			// Calculate distance to cursor position
			const distance = Phaser.Math.Distance.Between(
				this.x, this.y,
				targetX, targetY
			);
			
			// Only move if we're not already at the cursor position
			if (distance > 5) {
				// Calculate direction to cursor
				const angle = Phaser.Math.Angle.Between(
					this.x, this.y,
					targetX, targetY
				);
				
				// Move towards cursor
				this.body.velocity.x = Math.cos(angle) * this.moveSpeed;
				this.body.velocity.y = Math.sin(angle) * this.moveSpeed;
				
				// Update facing direction based on movement angle
				if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
					this.lastDirection = Math.cos(angle) > 0 ? 'right' : 'left';
				} else {
					this.lastDirection = Math.sin(angle) > 0 ? 'down' : 'up';
				}
			}
		}
		
		// Update sprite frame based on direction
		this.updatePlayerFrame();
	}

	// Update the player's sprite frame based on direction
	updatePlayerFrame() {
		switch (this.lastDirection) {
			case 'right':
				this.setFrame(2); // Right-facing frame
				break;
			case 'left':
				this.setFrame(1); // Left-facing frame
				break;
			case 'up':
				this.setFrame(3); // Up-facing frame
				break;
			case 'down':
				this.setFrame(0); // Down-facing frame
				break;
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here