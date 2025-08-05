// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class SkillCard extends Phaser.GameObjects.Container {

    constructor(scene, x, y, skillKey, skillData, currentLevel, newLevel) {
        super(scene, x ?? 0, y ?? 0);

        /* START-USER-CTR-CODE */
        this.skillKey = skillKey;
        this.skillData = skillData;
        this.currentLevel = currentLevel;
        this.newLevel = newLevel;
        this.isNewSkill = currentLevel === 0;
        
        this.createCard();
        this.setupInteraction();
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    createCard() {
        const backgroundKey = this.skillData.cardBackground || 'card_basic_stats';
        
        if (!this.scene.textures.exists(backgroundKey)) {
            console.warn(`SkillCard: Background texture ${backgroundKey} not found, using fallback`);
            this.createFallbackBackground();
        } else {
            this.cardBackground = this.scene.add.image(0, 0, backgroundKey);
            this.cardBackground.setScale(1.2);
            this.add(this.cardBackground);
        }
        
        // Create glow effect for hover
        if (this.cardBackground) {
            this.glowBackground = this.scene.add.image(0, 0, backgroundKey);
            this.glowBackground.setScale(1.3);
            this.glowBackground.setAlpha(0);
            this.glowBackground.setTint(0xffffff);
            this.glowBackground.setBlendMode(Phaser.BlendModes.ADD);
            this.addAt(this.glowBackground, 0);
        }
        
        this.addRomanNumeral();
        this.addSkillIcon();
        this.addSkillName();
        this.addSkillDescription();
        this.addLevelIndicator();
        this.addUpgradePreview();
        this.setSize(240, 320);
    }
    
    createFallbackBackground() {
        const colorMap = {
            'basic': 0xffd700,
            'stat': 0x888888, 
            'fire': 0xff4444, 
            'ice': 0x4444ff,  
            'lightning': 0xff88ff,
            'holy': 0xffff88,
            'marksman': 0x888888
        };
        
        const bgColor = colorMap[this.skillData.type] || 0x666666;
        
        this.cardBackground = this.scene.add.rectangle(0, 0, 200, 280, bgColor, 0.8);
        this.cardBackground.setStrokeStyle(4, 0xffffff, 1);
        this.add(this.cardBackground);
    }
    
    addRomanNumeral() {
        if (this.newLevel > 0 && this.newLevel <= 10) {
            const romanKey = `Roman_${this.newLevel}`;
            
            if (this.scene.textures.exists(romanKey)) {
                this.romanNumeral = this.scene.add.image(-90, -130, romanKey);
                this.romanNumeral.setScale(0.8);
                this.romanNumeral.setTint(0xffd700);
                this.add(this.romanNumeral);
            } else {
                const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                this.romanNumeral = this.scene.add.text(-90, -130, romanNumerals[this.newLevel], {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ffd700',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5);
                this.add(this.romanNumeral);
            }
        }
    }
    
    addSkillIcon() {
        const glowIcon = this.skillData.icon;
        const normalIcon = this.skillData.iconNormal;
        
        let iconAdded = false;
        
        if (glowIcon && this.scene.textures.exists(glowIcon)) {
            this.skillIcon = this.scene.add.image(0, -20, glowIcon);
            this.skillIcon.setScale(1.0);
            this.add(this.skillIcon);
            iconAdded = true;
        }
        else if (normalIcon && this.scene.textures.exists(normalIcon)) {
            this.skillIcon = this.scene.add.image(0, -20, normalIcon);
            this.skillIcon.setScale(1.0);
            this.add(this.skillIcon);
            iconAdded = true;
        }
        
        if (!iconAdded) {
            console.warn(`SkillCard: No icon found for ${this.skillKey}, creating fallback`);
            this.createFallbackIcon();
        }
    }
    
    createFallbackIcon() {
        const colorMap = {
            'basic': 0xffd700,
            'stat': 0x888888, 
            'fire': 0xff4444, 
            'ice': 0x4444ff,  
            'lightning': 0xff88ff,
            'holy': 0xffff88,
            'marksman': 0x888888
        };
        
        const iconColor = colorMap[this.skillData.type] || 0x666666;
        
        this.skillIcon = this.scene.add.circle(0, -20, 30, iconColor);
        this.skillIcon.setStrokeStyle(3, 0xffffff);
        this.add(this.skillIcon);
        
        const typeIcon = this.scene.add.text(0, -20, this.skillKey.charAt(0).toUpperCase(), {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(typeIcon);
    }
    
    addSkillName() {
        const nameColor = this.isNewSkill ? '#00ff00' : '#ffff00';
        const namePrefix = this.isNewSkill ? 'UNLOCK: ' : '';
        
        this.skillName = this.scene.add.text(0, 30, namePrefix + this.skillData.name, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: nameColor,
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: 200 }
        }).setOrigin(0.5);
        this.add(this.skillName);
    }
    
    addSkillDescription() {
        this.description = this.scene.add.text(0, 60, this.skillData.description, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            wordWrap: { width: 180 }
        }).setOrigin(0.5);
        this.add(this.description);
    }
    
    addLevelIndicator() {
        const levelText = this.isNewSkill ? 
            'NEW SKILL!' : 
            `Level ${this.currentLevel} → ${this.newLevel}`;
        
        const levelColor = this.isNewSkill ? '#00ff00' : '#ffd700';
        
        this.levelIndicator = this.scene.add.text(0, 95, levelText, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: levelColor,
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.levelIndicator);
    }
    
    addUpgradePreview() {
        if (!this.skillData.stats) return;
        
        let previewText = '';
        const stats = this.skillData.stats;
        
        Object.keys(stats).forEach((statKey, index) => {
            const stat = stats[statKey];
            let currentValue, newValue;
            
            if (this.isNewSkill) {
                currentValue = 0;
                newValue = stat.base;
            } else {
                currentValue = stat.base + (this.currentLevel - 1) * stat.perLevel;
                newValue = stat.base + (this.newLevel - 1) * stat.perLevel;
            }
            
            const displayName = this.formatStatName(statKey);
            
            if (index > 0) previewText += '\n';
            
            if (this.isNewSkill) {
                previewText += `${displayName}: ${this.formatStatValue(statKey, newValue)}`;
            } else {
                const increase = newValue - currentValue;
                previewText += `${displayName}: +${this.formatStatValue(statKey, increase)}`;
            }
        });
        
        if (previewText) {
            this.upgradePreview = this.scene.add.text(0, 125, previewText, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#cccccc',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center',
                wordWrap: { width: 180 }
            }).setOrigin(0.5);
            this.add(this.upgradePreview);
        }
    }
    
    formatStatName(statKey) {
        const nameMap = {
            'damage': 'Damage',
            'fireRate': 'Fire Rate',
            'range': 'Range',
            'chainCount': 'Chain Count',
            'duration': 'Duration',
            'health': 'Health',
            'damageMultiplier': 'Damage',
            'speedMultiplier': 'Speed',
            'rangeMultiplier': 'Range'
        };
        
        return nameMap[statKey] || statKey;
    }
    
    formatStatValue(statKey, value) {
        if (statKey.includes('Multiplier')) {
            return `+${(value * 100).toFixed(0)}%`;
        } else if (statKey === 'fireRate') {
            return `+${value.toFixed(1)}/s`;
        } else if (statKey === 'duration') {
            return `+${(value / 1000).toFixed(1)}s`;
        } else {
            return `+${Math.round(value)}`;
        }
    }
    
    setupInteraction() {
        this.setInteractive({ useHandCursor: true });
        
        // Hover effects
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onPointerDown, this);
        
        this.cardBackground.setInteractive({ useHandCursor: true });
        this.cardBackground.on('pointerdown', this.onPointerDown, this);
    }
    
    onPointerOver() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 150,
            ease: 'Back.easeOut'
        });
        
        this.scene.tweens.add({
            targets: this.glowBackground,
            alpha: 0.4,
            scaleX: 1.35,
            scaleY: 1.35,
            duration: 150,
            ease: 'Power2'
        });
        
        if (this.skillIcon) {
            this.scene.tweens.add({
                targets: this.skillIcon,
                scaleX: 1.15,
                scaleY: 1.15,
                y: this.skillIcon.y - 5,
                duration: 150,
                ease: 'Power2'
            });
            
            this.iconPulse = this.scene.tweens.add({
                targets: this.skillIcon,
                alpha: 0.8,
                duration: 800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
        
        if (this.romanNumeral) {
            this.scene.tweens.add({
                targets: this.romanNumeral,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 150,
                ease: 'Power2'
            });
        }
        
        if (this.isNewSkill) {
            this.createHoverParticles();
        }
        
        if (this.skillName) {
            this.scene.tweens.add({
                targets: this.skillName,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Power2'
            });
        }
    }
    
    onPointerOut() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 150,
            ease: 'Power2'
        });
        
        this.scene.tweens.add({
            targets: this.glowBackground,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 150,
            ease: 'Power2'
        });
        
        if (this.skillIcon) {
            this.scene.tweens.add({
                targets: this.skillIcon,
                scaleX: 1.0,
                scaleY: 1.0,
                y: -20,
                alpha: 1,
                duration: 150,
                ease: 'Power2'
            });
            
            if (this.iconPulse) {
                this.iconPulse.stop();
                this.iconPulse = null;
            }
        }
        
        if (this.romanNumeral) {
            this.scene.tweens.add({
                targets: this.romanNumeral,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 150,
                ease: 'Power2'
            });
        }
        
        this.cleanupHoverParticles();
        
        if (this.skillName) {
            this.scene.tweens.add({
                targets: this.skillName,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 150,
                ease: 'Power2'
            });
        }
    }
    
    onPointerDown() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.createSelectionEffect();
                
                if (this.onSelectCallback) {
                    this.onSelectCallback(this.skillKey);
                } else {
                    console.warn(`No selection callback set for skill card: ${this.skillKey}`);
                }
            }
        });
        
        // Enhanced flash effect
        this.scene.tweens.add({
            targets: this.glowBackground,
            alpha: 0.9,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
        
        // Icon selection effect
        if (this.skillIcon) {
            this.scene.tweens.add({
                targets: this.skillIcon,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 100,
                yoyo: true,
                ease: 'Back.easeOut'
            });
        }
        
        // Play sound effect if available
        if (this.scene.sound && this.scene.sound.add) {
            try {
                const sound = this.scene.sound.add('select_sound');
                if (sound) sound.play({ volume: 0.7 });
            } catch (error) {
                console.log("Sound effect not available:", error);
            }
        }
    }
    
    setOnSelectCallback(callback) {
        this.onSelectCallback = callback;
        return this;
    }
    
    updateSkillLevel(currentLevel, newLevel) {
        this.currentLevel = currentLevel;
        this.newLevel = newLevel;
        this.isNewSkill = currentLevel === 0;
        this.removeAll(true);
        this.createCard();
        
        return this;
    }
    
    createHoverParticles() {
        if (this.hoverParticles) return;
        
        this.hoverParticles = [];
        for (let i = 0; i < 6; i++) {
            const particle = this.scene.add.circle(
                this.x + (Math.random() - 0.5) * 200,
                this.y + (Math.random() - 0.5) * 200,
                2 + Math.random() * 3,
                this.isNewSkill ? 0x00ff00 : 0xffd700,
                0.7
            );
            
            particle.setDepth(999);
            
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - 20 - Math.random() * 30,
                alpha: 0,
                duration: 1000 + Math.random() * 1000,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
            
            this.hoverParticles.push(particle);
        }
    }
    
    cleanupHoverParticles() {
        if (this.hoverParticles) {
            this.hoverParticles.forEach(particle => {
                if (particle && particle.active) {
                    particle.destroy();
                }
            });
            this.hoverParticles = null;
        }
    }
    
    createSelectionEffect() {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            
            const burst = this.scene.add.circle(
                this.x,
                this.y,
                3 + Math.random() * 4,
                this.isNewSkill ? 0x00ff00 : 0xffd700,
                0.9
            );
            
            burst.setDepth(1003);
            
            this.scene.tweens.add({
                targets: burst,
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => burst.destroy()
            });
        }
        
        const ring = this.scene.add.circle(this.x, this.y, 10, 0xffffff, 0);
        ring.setStrokeStyle(3, this.isNewSkill ? 0x00ff00 : 0xffd700, 0.8);
        ring.setDepth(1003);
        
        this.scene.tweens.add({
            targets: ring,
            radius: 100,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => ring.destroy()
        });
    }
    
    destroy() {
        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.killTweensOf(this.glowBackground);
        if (this.skillIcon) this.scene.tweens.killTweensOf(this.skillIcon);
        if (this.romanNumeral) this.scene.tweens.killTweensOf(this.romanNumeral);
        if (this.skillName) this.scene.tweens.killTweensOf(this.skillName);
        
        if (this.iconPulse) {
            this.iconPulse.stop();
            this.iconPulse = null;
        }
        
        this.cleanupHoverParticles();
        
        super.destroy();
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here