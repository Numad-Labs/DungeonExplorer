// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class ExpOrb extends Phaser.GameObjects.Image {

	constructor(scene, x, y, texture, frame) {
		const textureToUse = (texture || "Exp");
		const textureExists = scene.textures.exists(textureToUse);
		
		super(scene, x ?? 8, y ?? 8, textureExists ? textureToUse : '__WHITE', frame);
		
		if (!textureExists) {
			this.setTint(0x00ffff);
		}

		/* START-USER-CTR-CODE */
		scene.physics.add.existing(this, false);
		
		this.body.setCircle(8);
		this.body.setCollideWorldBounds(true);
		
		this.expValue = 1;
		this.magneticRange = 50;
		this.magneticForce = 100;
		this.maxForce = 200;
		
		this.initialY = y;
		this.floatOffset = 5;
		this.floatSpeed = 1.5;
		this.floatTime = Math.random() * Math.PI * 2;
		
		this.isBeingCollected = false;
		
		this.updateListener = this.update.bind(this);
		scene.events.on('update', this.updateListener);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	setExpValue(value) {
		this.expValue = value;
		const scale = 0.8 + (Math.min(value, 10) / 10 * 0.5);
		this.setScale(scale);
		return this;
	}
	
	update(time, delta) {
	  if (this.isBeingCollected || !this.active) return;
	
	  try {
	    const player = this.scene.player;
	
	    if (!player) return;
	
	    this.floatTime += delta / 1000;
	    this.initialY = this.y - Math.sin(this.floatTime * this.floatSpeed) * this.floatOffset;
	
	    const distance = Phaser.Math.Distance.Between(
	      this.x, this.y,
	      player.x, player.y
	    );
	
	    if (distance <= this.magneticRange) {
	      const forceFactor = 1 - (distance / this.magneticRange);
	      const speed = this.magneticForce + (this.maxForce - this.magneticForce) * forceFactor;
	
	      this.scene.physics.moveToObject(this, player, speed);
	
	      if (distance < 10) {
	        this.collect();
	      }
	    } else {
	      this.body.velocity.x *= 0.95;
	      this.body.velocity.y *= 0.95;
	    }
	  } catch (error) {
	    console.error("Error in ExpOrb update:", error);
	    this.destroy();
	  }
	}
	
	collect() {
		if (this.isBeingCollected) return;
		
		this.isBeingCollected = true;
		
		try {
			if (this.scene.playerLevelSystem) {
				console.log("Adding experience to playerLevelSystem:", this.expValue);
				this.scene.playerLevelSystem.addExperience(this.expValue);
			} else {
				console.warn("No experience system found to add experience to");
			}
			
			this.scene.tweens.add({
				targets: this,
				scale: { from: this.scale, to: 0 },
				alpha: { from: 1, to: 0 },
				duration: 200,
				onComplete: () => {
					this.cleanupAndDestroy();
				}
			});
		} catch (error) {
			console.error("Error collecting experience orb:", error);
			this.cleanupAndDestroy();
		}
	}
	
	cleanupAndDestroy() {
		try {
			if (this.scene && this.updateListener) {
				this.scene.events.off('update', this.updateListener);
			}
		} catch (error) {
			console.error("Error removing update listener:", error);
		}
		
		this.destroy();
	}
	
	destroy(fromScene) {
		try {
			if (this.scene && this.updateListener) {
				this.scene.events.off('update', this.updateListener);
				this.updateListener = null;
			}
		} catch (error) {
			console.error("Error in destroy method:", error);
		}
		
		super.destroy(fromScene);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here