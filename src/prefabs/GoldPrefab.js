// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class GoldPrefab extends Phaser.GameObjects.Image {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 16, y ?? 16, texture || "Exp", frame);

		/* START-USER-CTR-CODE */
        scene.physics.add.existing(this, false);

        this.body.setCircle(10);
        this.body.setCollideWorldBounds(false);

        this.body.setBounce(0, 0);
        this.body.setDrag(10, 10);

        this.goldValue = 1;
        this.magneticRange = 100;
        this.magneticForce = 150;
        this.maxForce = 300;

        this.initialY = y;
        this.floatOffset = 5;
        this.floatSpeed = 1.5;
        this.floatTime = Math.random() * Math.PI * 2;

        this.isBeingCollected = false;
        this.isAttracted = false;

        this.updateListener = this.update.bind(this);
        scene.events.on('update', this.updateListener);
        /* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

    setGoldValue(value) {
        this.goldValue = value;
        const scale = 0.8 + (Math.min(value, 10) / 10 * 0.5);
        this.setScale(scale);

        // Yellow/gold color variations based on value
        if (value >= 10) {
            this.setTint(0xFF8C00); // Dark orange for high value
        } else if (value >= 5) {
            this.setTint(0xFFD700); // Gold for medium value
        } else if (value >= 2) {
            this.setTint(0xFFFF00); // Yellow for low-medium value
        } else {
            this.setTint(0xFFFACD); // Light yellow for low value
        }

        return this;
    }

    update(time, delta) {
        if (this.isBeingCollected || !this.active) return;

        try {
            const player = this.scene.player;
            if (!player) return;

            if (!this.isAttracted) {
                this.floatTime += delta / 1000;
                this.y = this.initialY + Math.sin(this.floatTime * this.floatSpeed) * this.floatOffset;
            }

            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                player.x, player.y
            );

            if (distance <= this.magneticRange) {
                this.isAttracted = true;

                const dx = player.x - this.x;
                const dy = player.y - this.y;

                const length = Math.sqrt(dx * dx + dy * dy);
                const ndx = dx / length;
                const ndy = dy / length;

                const forceFactor = 1 - (distance / this.magneticRange);
                const speed = this.magneticForce + (this.maxForce - this.magneticForce) * forceFactor;

                this.body.velocity.x = ndx * speed;
                this.body.velocity.y = ndy * speed;

                this.initialY = this.y;

                if (distance < 15) {
                    this.collect();
                }
            } else {
                this.isAttracted = false;

                if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                    this.body.velocity.x *= 0.95;
                    this.body.velocity.y *= 0.95;

                    if (Math.abs(this.body.velocity.x) < 1) this.body.velocity.x = 0;
                    if (Math.abs(this.body.velocity.y) < 1) this.body.velocity.y = 0;
                }
            }
        } catch (error) {
            console.error("Error in GoldPrefab update:", error);
            this.destroy();
        }
    }

    collect() {
        if (this.isBeingCollected) return this.goldValue;

        this.isBeingCollected = true;

        try {
            if (this.scene.gameManager) {
                this.scene.gameManager.addGold(this.goldValue);
            } else {
                console.warn("No game manager found to add gold to");
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
            console.error("Error collecting gold:", error);
            this.cleanupAndDestroy();
        }

        return this.goldValue;
    }

    createFloatingText(message) {
        try {
            const floatingText = this.scene.add.text(
                this.x,
                this.y - 20,
                message,
                {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    color: '#FFD700',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            );
            floatingText.setOrigin(0.5);

            this.scene.tweens.add({
                targets: floatingText,
                y: floatingText.y - 40,
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