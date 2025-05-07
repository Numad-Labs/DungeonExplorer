// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class LampPrefab extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, frame) {
        super(scene, x ?? 1125, y ?? 954, texture || "animated lamp posts-4", frame ?? 0);

        this.play("LampPostsAnimation1animated lamp posts");

        /* START-USER-CTR-CODE */
        // Setup physics
        scene.add.existing(this);
        scene.physics.add.existing(this, false);

        this.body.allowGravity = false;
        this.body.setSize(40, 10); 
        this.body.setOffset(15, 75); 
        this.body.moves = false;
        this.body.immovable = true;

        this.isLampInvisible = false;
        this.isPlayerInvisible = false;

        this.lampTop = this.y - 45;   
        this.lampBottom = this.y + 20;   

        scene.events.on('update', () => {
            if (!this.player) return;

            const playerNearLampX = Math.abs(this.player.x - (this.x + this.body.offset.x - 20)) < 45;

            const playerBehindLamp = this.player.y > this.lampTop && 
                                   this.player.y < this.lampBottom && 
                                   playerNearLampX;

            if (playerBehindLamp) {
                if (!this.isLampInvisible) {
                    scene.tweens.add({
                        targets: this,
                        alpha: 0.4,
                        duration: 200,
                        ease: 'Power1',
                        onComplete: () => {
                            this.isLampInvisible = true;
                        }
                    });
                }
                if (!this.isPlayerInvisible) {
                    scene.tweens.add({
                        targets: this.player,
                        alpha: 0.3,
                        duration: 200,
                        ease: 'Power1',
                        onComplete: () => {
                            this.isPlayerInvisible = true;
                        }
                    });
                }
            } else {
                if (this.isLampInvisible) {
                    scene.tweens.add({
                        targets: this,
                        alpha: 1,
                        duration: 200,
                        ease: 'Power1',
                        onComplete: () => {
                            this.isLampInvisible = false;
                        }
                    });
                }
                if (this.isPlayerInvisible) {
                    scene.tweens.add({
                        targets: this.player,
                        alpha: 1,
                        duration: 200,
                        ease: 'Power1',
                        onComplete: () => {
                            this.isPlayerInvisible = false;
                        }
                    });
                }
            }
        });
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    setupCollision(player) {
        if (!this.scene || !player) return;
        
        this.scene.physics.add.collider(player, this, null, null, this);
        this.player = player;
    }

    destroy() {
        if (this.scene) {
            this.scene.events.off('update');
        }
        super.destroy();
    }
    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here