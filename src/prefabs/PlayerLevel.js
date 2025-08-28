// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { EventBus } from '../game/EventBus';
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
		
		this.expText = scene.add.text(120, 15, "EXP: 0/50", {
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
		this.nextLevelExp = 50;
		
		this.onLevelUpCallbacks = [];
		
		scene.playerLevelSystem = this;
		
		this.updateText();
		this.updateExpBar();
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
			this.updateExpBar();
			
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
			this.nextLevelExp = 50 * this.level;
			
			try {
				this.onLevelUpCallbacks.forEach(callback => callback(this.level));
			} catch (error) {
				console.error("Error in level up callback:", error);
			}
			this.updateExpBar();
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
			
			// Update exp bar in React component
			this.updateExpBar();
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
	
	updateExpBar() {
		try {
			const expData = {
				currentExp: this.experience,
				maxExp: this.nextLevelExp,
				level: this.level,
				experience: this.experience,
				maxExperience: this.nextLevelExp,
				exp: this.experience,
				maxExp: this.nextLevelExp,
				lvl: this.level
			};
			
			EventBus.emit('player-exp-updated', expData);
			EventBus.emit('player-stats-updated', expData);
			
			window.dispatchEvent(new CustomEvent('playerExpUpdated', {
				detail: expData
			}));
			
			window.dispatchEvent(new CustomEvent('playerStatsUpdated', {
				detail: expData
			}));
			
		} catch (error) {
			console.error('Error updating exp bar:', error);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here