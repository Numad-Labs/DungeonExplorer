// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PowerUpSelection extends Phaser.GameObjects.Container {

	constructor(scene, x, y, powerUpType, powerUpLevel) {
		super(scene, x ?? 53, y ?? 69);

		/* START-USER-CTR-CODE */
		this.cardBackground = scene.add.image(0, 0, "blank cards7");
		this.add(this.cardBackground);
		
		this.cardBackground.setScale(2.0);
		
		this.titleText = scene.add.text(0, -95, "Power Up", {
			fontFamily: 'Arial, sans-serif',
			fontSize: '24px',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 4,
			align: 'center'
		});
		this.titleText.setOrigin(0.5);
		this.add(this.titleText);
		
		this.iconType = "image";
		
		if (scene.textures.exists("powerup_icon")) {
			this.icon = scene.add.image(0, -30, "powerup_icon");
			this.iconType = "image";
		} else {
			this.icon = scene.add.star(0, -30, 5, 15, 30, 0xFFD700);
			this.iconType = "star";
		}
		this.icon.setScale(1.2);
		this.add(this.icon);
		
		const descriptionBg = scene.add.rectangle(0, 50, 180, 70, 0x000000, 0);
		descriptionBg.setOrigin(0.5);
		this.add(descriptionBg);
		
		this.descriptionText = scene.add.text(0, 50, "Description of the power-up", {
			fontFamily: 'Arial, sans-serif',
			fontSize: '18px',
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 3,
			align: 'center',
			wordWrap: { width: 160 }
		});
		this.descriptionText.setOrigin(0.5);
		this.add(this.descriptionText);
		
		const levelBg = scene.add.rectangle(0, 95, 120, 30, 0x000000, 0.5);
		levelBg.setOrigin(0.5);
		this.add(levelBg);
		
		this.levelText = scene.add.text(0, 95, "Level 10", {
			fontFamily: 'Arial, sans-serif',
			fontSize: '22px',
			color: '#ffff00',
			stroke: '#000000',
			strokeThickness: 3,
			align: 'center'
		});
		this.levelText.setOrigin(0.5);
		this.add(this.levelText);
		
		this.setSize(200, 300);
		this.setInteractive({ useHandCursor: true });
		
		this.on('pointerover', this.onPointerOver, this);
		this.on('pointerout', this.onPointerOut, this);
		this.on('pointerdown', this.onPointerDown, this);
		
		this.cardBackground.setInteractive({ useHandCursor: true });
		this.cardBackground.on('pointerover', this.onPointerOver, this);
		this.cardBackground.on('pointerout', this.onPointerOut, this);
		this.cardBackground.on('pointerdown', this.onPointerDown, this);
		
		this.icon.setInteractive({ useHandCursor: true });
		this.icon.on('pointerdown', this.onPointerDown, this);
		
		descriptionBg.setInteractive({ useHandCursor: true });
		descriptionBg.on('pointerdown', this.onPointerDown, this);
		
		levelBg.setInteractive({ useHandCursor: true });
		levelBg.on('pointerdown', this.onPointerDown, this);
		
		this.powerUpType = powerUpType || 'speed';
		this.powerUpLevel = powerUpLevel || 1;
		
		this.setCardContent();
		
		this.cardId = Phaser.Math.RND.uuid();
		this.onSelectCallback = null;
		
		console.log(`PowerUpSelection card created at ${x}, ${y} for ${powerUpType} level ${powerUpLevel}`);
		console.log(`Card interactive area set: width=${this.width}, height=${this.height}`);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	setCardContent() {
		const powerUpTypes = {
			speed: {
				title: "Speed Boost",
				description: "Increase movement speed by 20%",
				color: 0x00ff00,
				iconTexture: "speed_icon"
			},
			damage: {
				title: "Damage Up",
				description: "Increase attack damage by 15%",
				color: 0xff0000,
				iconTexture: "damage_icon"
			},
			health: {
				title: "Max Health",
				description: "Increase maximum health by 10%",
				color: 0x0000ff,
				iconTexture: "health_icon"
			},
			fireRate: {
				title: "Fire Rate",
				description: "Increase attack speed by 10%",
				color: 0xffff00,
				iconTexture: "firerate_icon"
			},
			range: {
				title: "Attack Range",
				description: "Increase attack range by 15%",
				color: 0x00ffff,
				iconTexture: "range_icon"
			},
			magnet: {
				title: "Magnet",
				description: "Increase exp collection radius by 20%",
				color: 0xff00ff,
				iconTexture: "magnet_icon"
			}
		};
		
		const powerUpData = powerUpTypes[this.powerUpType] || powerUpTypes.speed;
		
		this.titleText.setText(powerUpData.title);
		
		let baseValue = 10;
		const description = powerUpData.description;
		const match = description.match(/\d+/);
		if (match) {
			baseValue = parseInt(match[0]);
		}
		
		const scaledValue = Math.floor(baseValue * (1 + (this.powerUpLevel - 1) * 0.5));
		const updatedDescription = description.replace(/\d+%/, `${scaledValue}%`);
		this.descriptionText.setText(updatedDescription);
		
		this.levelText.setText(`Level ${this.powerUpLevel}`);
		
		if (this.iconType === "image") {
			if (this.scene.textures.exists(powerUpData.iconTexture)) {
				this.icon.setTexture(powerUpData.iconTexture);
			} else if (this.scene.textures.exists("powerup_icon")) {
				this.icon.setTexture("powerup_icon");
			}
		} else if (this.iconType === "star") {
			this.icon.setFillStyle(powerUpData.color);
		}
		
		this.cardBackground.setTint(powerUpData.color);
		
		return this;
	}
	
	onPointerOver() {
		this.scene.tweens.add({
			targets: this,
			scaleX: 0.8,
			scaleY: 0.8,
			duration: 100,
			ease: 'Power1'
		});
		
		if (!this.glowEffect) {
			this.glowEffect = this.scene.add.image(0, 0, this.cardBackground.texture.key)
				.setScale(this.cardBackground.scaleX * 1.1, this.cardBackground.scaleY * 1.1)
				.setAlpha(0.5)
				.setTint(0xffffff)
				.setBlendMode(Phaser.BlendModes.ADD);
			this.addAt(this.glowEffect, 0);
		}
	}
	
	onPointerOut() {
		this.scene.tweens.add({
			targets: this,
			scaleX: 0.6,
			scaleY: 0.6,
			duration: 100,
			ease: 'Power1'
		});
		
		if (this.glowEffect) {
			this.glowEffect.destroy();
			this.glowEffect = null;
		}
	}
	
	onPointerDown() {
		this.scene.tweens.add({
			targets: this,
			scaleX: 1.2,
			scaleY: 1.2,
			duration: 100,
			yoyo: true,
			ease: 'Power1',
			onComplete: () => {
				console.log(`CARD SELECTED: ${this.powerUpType} level ${this.powerUpLevel}`);
				
				if (this.onSelectCallback) {
					this.onSelectCallback(this.powerUpType, this.powerUpLevel);
				} else {
					console.warn("No selection callback set for card");
				}
			}
		});
		
		if (this.scene.sound && this.scene.sound.add) {
			try {
				const sound = this.scene.sound.add('select_sound');
				if (sound) sound.play({ volume: 0.5 });
			} catch (error) {
				console.log("Sound not available:", error);
			}
		}
	}
	
	setOnSelectCallback(callback) {
		this.onSelectCallback = callback;
		console.log(`Selection callback set for ${this.powerUpType}`);
		return this;
	}
	
	setPowerUpType(type) {
		this.powerUpType = type;
		this.setCardContent();
		return this;
	}
	
	setPowerUpLevel(level) {
		this.powerUpLevel = level;
		this.setCardContent();
		return this;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here