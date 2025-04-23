// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class HealthBar extends Phaser.GameObjects.Container {

    constructor(scene, x, y, width, height) {
        super(scene, x ?? 100, y ?? 30);

        /* START-USER-CTR-CODE */
        this.width = width || 200;
        this.height = height || 20;
        
        // Create health bar elements
        this.createHealthBar();
        
        // Set fixed to camera
        this.setScrollFactor(0);
        this.setDepth(100);
        
        // Add to scene
        scene.add.existing(this);
        
        // Reference to scene's health bar
        scene.healthBar = this;
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    createHealthBar() {
        // Background (border)
        this.background = this.scene.add.rectangle(
            0, 0, 
            this.width + 4, this.height + 4, 
            0x000000
        );
        this.background.setOrigin(0, 0);
        this.add(this.background);
        
        // Red background (empty health)
        this.redBar = this.scene.add.rectangle(
            2, 2, 
            this.width, this.height, 
            0xff0000
        );
        this.redBar.setOrigin(0, 0);
        this.add(this.redBar);
        
        // Green foreground (current health)
        this.greenBar = this.scene.add.rectangle(
            2, 2, 
            this.width, this.height, 
            0x00ff00
        );
        this.greenBar.setOrigin(0, 0);
        this.add(this.greenBar);
        
        // Health text display
        this.healthText = this.scene.add.text(
            this.width / 2 + 2, 
            this.height / 2 + 2, 
            '100/100', 
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.healthText.setOrigin(0.5, 0.5);
        this.add(this.healthText);
        
        // Add health icon if available
        if (this.scene.textures.exists('health_icon')) {
            this.healthIcon = this.scene.add.image(-25, this.height/2, 'health_icon');
            this.healthIcon.setScale(0.5);
            this.healthIcon.setOrigin(0.5);
            this.add(this.healthIcon);
        }
    }
    
    updateHealth(currentHealth, maxHealth) {
        // Calculate health percentage
        const percentage = Math.max(0, Math.min(1, currentHealth / maxHealth));
        
        // Update green bar width
        this.greenBar.width = this.width * percentage;
        
        // Update text
        this.healthText.setText(`${Math.ceil(currentHealth)}/${maxHealth}`);
        
        // Shake effect on low health
        if (percentage < 0.3 && currentHealth > 0) {
            this.playLowHealthEffect();
        }
        
        // Color shift based on health percentage
        if (percentage > 0.6) {
            // Full green when health is high
            this.greenBar.setFillStyle(0x00ff00);
        } else if (percentage > 0.3) {
            // Yellow when health is medium
            this.greenBar.setFillStyle(0xffff00);
        } else {
            // Orange when health is low
            this.greenBar.setFillStyle(0xff7700);
        }
    }
    
    playLowHealthEffect() {
        // Only play effect if not already playing
        if (this.isPlayingEffect) return;
        
        this.isPlayingEffect = true;
        
        // Subtle shake effect
        this.scene.tweens.add({
            targets: this,
            x: this.x + 2,
            duration: 50,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.isPlayingEffect = false;
            }
        });
        
        // Pulse the health bar 
        this.scene.tweens.add({
            targets: this.greenBar,
            alpha: 0.7,
            duration: 300,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.greenBar.alpha = 1;
            }
        });
        
        // Play warning sound if available
        try {
            if (this.scene.sound && this.scene.cache.audio.exists('low_health_sound')) {
                const sound = this.scene.sound.add('low_health_sound');
                sound.play({ volume: 0.3 });
            }
        } catch (error) {
            console.warn("Could not play low health sound:", error);
        }
    }
    
    showDamageFlash() {
        // Create a visual feedback when taking damage
        const flash = this.scene.add.rectangle(
            0, 0,
            this.width + 4, this.height + 4,
            0xff0000, 0.5
        );
        flash.setOrigin(0, 0);
        this.add(flash);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    showHealEffect() {
        // Create a visual feedback when healing
        const healEffect = this.scene.add.rectangle(
            0, 0,
            this.width + 4, this.height + 4,
            0x00ff00, 0.5
        );
        healEffect.setOrigin(0, 0);
        this.add(healEffect);
        
        this.scene.tweens.add({
            targets: healEffect,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                healEffect.destroy();
            }
        });
    }
    
    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here