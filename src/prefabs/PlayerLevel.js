// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PlayerLevel extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 10, y ?? 10);

		/* START-USER-CTR-CODE */
		this.background = scene.add.rectangle(0, 0, 300, 30, 0x000000, 0.7);
		this.background.setOrigin(0, 0);
		this.add(this.background);
		
		this.levelText = scene.add.text(10, 15, "LEVEL: 1", {
			fontFamily: 'Arial, sans-serif',
			fontSize: '10px', 
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 4,
			align: 'left'
		});
		this.levelText.setOrigin(0, 0.5);
		this.add(this.levelText);
		
		this.expText = scene.add.text(120, 15, "EXP: 0/100", {
			fontFamily: 'Arial, sans-serif',
			fontSize: '10px', 
			color: '#ffff00',
			stroke: '#000000',
			strokeThickness: 4,
			align: 'left'
		});
		this.expText.setOrigin(0, 0.5);
		this.add(this.expText);
		
		this.setScrollFactor(0);
		this.setDepth(1000);
		
		this.level = 1;
		this.experience = 0;
		this.nextLevelExp = 100;
		
		this.onLevelUpCallbacks = [];
		
		scene.playerLevelSystem = this;
		
		this.updateText();
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	addExperience(amount) {
		try {
			console.log(`Adding ${amount} experience points`);
			
			if (typeof amount !== 'number' || isNaN(amount)) {
				console.warn("Invalid experience amount:", amount);
				amount = 1;
			}
			
			this.experience += amount;
			
			this.checkLevelUp();
			this.updateText();
			this.createFloatingText(`+${amount} EXP`);
			
			return this;
		} catch (error) {
			console.error("Error adding experience:", error);
			return this;
		}
	}
	
	checkLevelUp() {
		if (this.experience >= this.nextLevelExp) {
			this.level++;
			this.experience -= this.nextLevelExp;
			this.nextLevelExp = Math.floor(100 * Math.pow(1.2, this.level - 1));
			
			this.levelUpEffect();
			try {
				this.onLevelUpCallbacks.forEach(callback => callback(this.level));
			} catch (error) {
				console.error("Error in level up callback:", error);
			}
			this.checkLevelUp();
		}
	}
	
	updateText() {
		this.levelText.setText(`LEVEL: ${this.level}`);
		this.expText.setText(`EXP: ${this.experience}/${this.nextLevelExp}`);
		
		const totalWidth = Math.max(204, this.levelText.width + this.expText.width + 30);
		this.background.width = totalWidth;
		
		if (this.progressBarFill) {
			this.updateProgressBar();
		}
	}
	
	createFloatingText(message) {
		try {
			const player = this.scene.player;
			if (!player) {
				console.warn("Player not found for floating text");
				return;
			}
			
			const floatingText = this.scene.add.text(
				player.x,
				player.y - 30,
				message,
				{
					fontFamily: 'Arial, sans-serif',
					fontSize: '20px',
					color: '#FFD700',
					stroke: '#000000',
					strokeThickness: 4
				}
			);
			floatingText.setOrigin(0.5);
			
			this.scene.tweens.add({
				targets: floatingText,
				y: floatingText.y - 60,
				alpha: 0,
				duration: 1500,
				onComplete: () => {
					floatingText.destroy();
				}
			});
		} catch (error) {
			console.error("Error creating floating text:", error);
		}
	}
	
	levelUpEffect() {
		try {
			const player = this.scene.player;
			if (!player) {
				console.warn("Player not found for level up effect");
				return;
			}
			const levelUpText = this.scene.add.text(
				player.x,
				player.y - 40,
				'LEVEL UP!',
				{
					fontFamily: 'Arial, sans-serif',
					fontSize: '28px',
					color: '#00FF00',
					stroke: '#000000',
					strokeThickness: 5
				}
			);
			levelUpText.setOrigin(0.5);
			
			for (let i = 0; i < 20; i++) {
				const angle = Math.random() * Math.PI * 2;
				const distance = 20 + Math.random() * 40;
				const size = 5 + Math.random() * 10;
				
				const circle = this.scene.add.circle(
					player.x,
					player.y,
					size,
					0x00FF00,
					0.8
				);
				
				this.scene.tweens.add({
					targets: circle,
					x: player.x + Math.cos(angle) * distance,
					y: player.y + Math.sin(angle) * distance,
					alpha: 0,
					scale: 0.5,
					duration: 1000,
					ease: 'Power1',
					onComplete: () => {
						circle.destroy();
					}
				});
			}
			
			this.scene.tweens.add({
				targets: levelUpText,
				scaleX: 1.5,
				scaleY: 1.5,
				duration: 200,
				yoyo: true,
				repeat: 1,
				onComplete: () => {
					this.scene.tweens.add({
						targets: levelUpText,
						alpha: 0,
						y: levelUpText.y - 50,
						duration: 1000,
						onComplete: () => {
							levelUpText.destroy();
						}
					});
				}
			});
		} catch (error) {
			console.error("Error creating level up effect:", error);
		}
	}
	
	onLevelUp(callback) {
		if (typeof callback === 'function') {
			this.onLevelUpCallbacks.push(callback);
		}
		return this;
	}
	
	getLevel() {
		return this.level;
	}
	
	getLevelProgress() {
		return this.experience / this.nextLevelExp;
	}
	
	setUIPosition(x, y) {
		this.setPosition(x, y);
		console.log("UI Position set to:", x, y);
		return this;
	}
	
	createProgressBar(x, y, width, height) {
		try {
			if (this.progressBarBg) {
				this.progressBarBg.destroy();
				this.progressBarFill.destroy();
			}
			
			this.progressBarBg = this.scene.add.rectangle(
				0, 40, width, height,
				0x000000, 0.7
			);
			this.progressBarBg.setScrollFactor(0);
			this.progressBarBg.setOrigin(0, 0.5);
			this.progressBarBg.setDepth(99);
			this.add(this.progressBarBg);
			
			this.progressBarFill = this.scene.add.rectangle(
				2, 40, 0, height - 4,
				0x00FFFF, 1
			);
			this.progressBarFill.setScrollFactor(0);
			this.progressBarFill.setOrigin(0, 0.5);
			this.progressBarFill.setDepth(99);
			this.add(this.progressBarFill);
			
			this.progressBarWidth = width - 4;
			this.updateProgressBar();
			
			return this;
		} catch (error) {
			console.error("Error creating progress bar:", error);
			return this;
		}
	}
	
	updateProgressBar() {
		try {
			if (this.progressBarFill && this.progressBarWidth) {
				const progress = this.getLevelProgress();
				const width = this.progressBarWidth * progress;
				
				this.progressBarFill.width = width;
			}
		} catch (error) {
			console.error("Error updating progress bar:", error);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here