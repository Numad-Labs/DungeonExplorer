import SkillCard from "../prefabs/SkillCard";
import { EventBus } from '../game/EventBus';
import PauseManager from './PauseManager.js';

const SKILLS = {
    slash: {
        name: "Slash Attack", description: "Melee area attack", type: "basic", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_attack", icon: "icon_slash_glow_effect", iconNormal: "icon_slash",
        stats: { damage: { base: 10, perLevel: 2 }, fireRate: { base: 1, perLevel: 0.1 }, range: { base: 70, perLevel: 5 } },
        apply: (player, level) => {
            player.slashDamage = SKILLS.slash.stats.damage.base + (level - 1) * SKILLS.slash.stats.damage.perLevel;
            player.slashFireRate = SKILLS.slash.stats.fireRate.base + (level - 1) * SKILLS.slash.stats.fireRate.perLevel;
            player.slashRange = SKILLS.slash.stats.range.base + (level - 1) * SKILLS.slash.stats.range.perLevel;
        }
    },
    fireBullet: {
        name: "Fire Arrow", description: "Fast piercing fire projectile", type: "fire", unlocked: true, maxLevel: 10,
        cardBackground: "card_magic_fire", icon: "icon_fire_arrow_glow_effect", iconNormal: "icon_fire_arrow",
        stats: { damage: { base: 8, perLevel: 1.5 }, fireRate: { base: 1.2, perLevel: 0.15 }, range: { base: 300, perLevel: 20 } },
        apply: (player, level) => {
            player.fireBulletDamage = SKILLS.fireBullet.stats.damage.base + (level - 1) * SKILLS.fireBullet.stats.damage.perLevel;
            player.fireBulletFireRate = SKILLS.fireBullet.stats.fireRate.base + (level - 1) * SKILLS.fireBullet.stats.fireRate.perLevel;
            player.fireBulletRange = SKILLS.fireBullet.stats.range.base + (level - 1) * SKILLS.fireBullet.stats.range.perLevel;
        }
    },
    fireBomb: {
        name: "Fire Ball", description: "Explosive area damage", type: "fire", unlocked: true, maxLevel: 10,
        cardBackground: "card_magic_fire", icon: "icon_fire_ball_glow_effect", iconNormal: "icon_fire_ball",
        stats: { damage: { base: 18, perLevel: 3 }, fireRate: { base: 0.4, perLevel: 0.05 }, range: { base: 220, perLevel: 15 } },
        apply: (player, level) => {
            player.fireBombDamage = SKILLS.fireBomb.stats.damage.base + (level - 1) * SKILLS.fireBomb.stats.damage.perLevel;
            player.fireBombFireRate = SKILLS.fireBomb.stats.fireRate.base + (level - 1) * SKILLS.fireBomb.stats.fireRate.perLevel;
            player.fireBombRange = SKILLS.fireBomb.stats.range.base + (level - 1) * SKILLS.fireBomb.stats.range.perLevel;
        }
    },
    ice: {
        name: "Ice Shard", description: "Slowing ice projectile", type: "ice", unlocked: true, maxLevel: 10,
        cardBackground: "card_magic_order", icon: "icon_ice_shard_glow_effect", iconNormal: "icon_ice_shard",
        stats: { damage: { base: 12, perLevel: 2 }, fireRate: { base: 0.6, perLevel: 0.08 }, range: { base: 180, perLevel: 12 } },
        apply: (player, level) => {
            player.iceDamage = SKILLS.ice.stats.damage.base + (level - 1) * SKILLS.ice.stats.damage.perLevel;
            player.iceFireRate = SKILLS.ice.stats.fireRate.base + (level - 1) * SKILLS.ice.stats.fireRate.perLevel;
            player.iceRange = SKILLS.ice.stats.range.base + (level - 1) * SKILLS.ice.stats.range.perLevel;
        }
    },
    lightning: {
        name: "Lightning Chain", description: "Chaining electric attack", type: "lightning", unlocked: true, maxLevel: 10,
        cardBackground: "card_magic_order", icon: "icon_lightning_chain_glow_effect", iconNormal: "icon_lightning_chain",
        stats: { damage: { base: 20, perLevel: 3 }, fireRate: { base: 0.5, perLevel: 0.06 }, chainCount: { base: 10, perLevel: 1 } },
        apply: (player, level) => {
            player.lightningDamage = SKILLS.lightning.stats.damage.base + (level - 1) * SKILLS.lightning.stats.damage.perLevel;
            player.lightningFireRate = SKILLS.lightning.stats.fireRate.base + (level - 1) * SKILLS.lightning.stats.fireRate.perLevel;
            player.lightningChainCount = SKILLS.lightning.stats.chainCount.base + (level - 1) * SKILLS.lightning.stats.chainCount.perLevel;
        }
    },
    blindingLight: {
        name: "Holy Light", description: "Blinding area effect", type: "holy", unlocked: true, maxLevel: 10,
        cardBackground: "card_magic_order", icon: "icon_holy_light_glow_effect", iconNormal: "icon_holy_light",
        stats: { range: { base: 300, perLevel: 25 }, fireRate: { base: 0.15, perLevel: 0.02 }, duration: { base: 4000, perLevel: 300 } },
        apply: (player, level) => {
            player.blindingLightRange = SKILLS.blindingLight.stats.range.base + (level - 1) * SKILLS.blindingLight.stats.range.perLevel;
            player.blindingLightFireRate = SKILLS.blindingLight.stats.fireRate.base + (level - 1) * SKILLS.blindingLight.stats.fireRate.perLevel;
            player.blindingLightDisableDuration = SKILLS.blindingLight.stats.duration.base + (level - 1) * SKILLS.blindingLight.stats.duration.perLevel;
        }
    },
    marksman: {
        name: "Marksman Shot", description: "High-damage precise shot", type: "marksman", unlocked: true, maxLevel: 10,
        cardBackground: "card_magic_order", icon: "icon_marksman_glow_effect", iconNormal: "icon_marksman",
        stats: { damage: { base: 35, perLevel: 8 }, fireRate: { base: 0.3, perLevel: 0.04 }, range: { base: 400, perLevel: 30 } },
        apply: (player, level) => {
            player.marksmanDamage = SKILLS.marksman.stats.damage.base + (level - 1) * SKILLS.marksman.stats.damage.perLevel;
            player.marksmanFireRate = SKILLS.marksman.stats.fireRate.base + (level - 1) * SKILLS.marksman.stats.fireRate.perLevel;
            player.marksmanRange = SKILLS.marksman.stats.range.base + (level - 1) * SKILLS.marksman.stats.range.perLevel;
        }
    },

    armor: {
        name: "Armor Plating", description: "Reduce incoming damage", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_armor_glow_effect2", iconNormal: "icon_armor",
        stats: { armorValue: { base: 2, perLevel: 1.5 } },
        apply: (player, level) => {
            const armorValue = SKILLS.armor.stats.armorValue.base + (level - 1) * SKILLS.armor.stats.armorValue.perLevel;
            player.armor = (player.armor || 0) + armorValue;
        }
    },
    attackSpeed: {
        name: "Attack Speed", description: "Increase all attack rates", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_attack_speed_glow_effect2", iconNormal: "icon_attack_speed",
        stats: { speedMultiplier: { base: 0.15, perLevel: 0.1 } },
        apply: (player, level) => {
            const multiplier = 1 + (SKILLS.attackSpeed.stats.speedMultiplier.base + (level - 1) * SKILLS.attackSpeed.stats.speedMultiplier.perLevel);
            ['slashFireRate', 'fireBulletFireRate', 'fireBombFireRate', 'iceFireRate', 'lightningFireRate', 'blindingLightFireRate'].forEach(fireRateProp => {
                if (player[fireRateProp]) player[fireRateProp] *= multiplier;
            });
        }
    },
    expGain: {
        name: "Experience Gain", description: "Gain more experience points", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_exp_gain_glow_effect2", iconNormal: "icon_exp_gain",
        stats: { expMultiplier: { base: 0.2, perLevel: 0.15 } },
        apply: (player, level) => {
            const multiplier = 1 + (SKILLS.expGain.stats.expMultiplier.base + (level - 1) * SKILLS.expGain.stats.expMultiplier.perLevel);
            player.expMultiplier = (player.expMultiplier || 1) * multiplier;
        }
    },
    goldGain: {
        name: "Gold Gain", description: "Find more gold from enemies", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_gold_gain_glow_effect2", iconNormal: "icon_gold_gain",
        stats: { goldMultiplier: { base: 0.25, perLevel: 0.2 } },
        apply: (player, level) => {
            const multiplier = 1 + (SKILLS.goldGain.stats.goldMultiplier.base + (level - 1) * SKILLS.goldGain.stats.goldMultiplier.perLevel);
            player.goldMultiplier = (player.goldMultiplier || 1) * multiplier;
        }
    },
    maxHealth: {
        name: "Max Health", description: "Increase maximum health", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_max_healt_glow_effect2", iconNormal: "icon_max_healt",
        stats: { health: { base: 50, perLevel: 25 } },
        apply: (player, level) => {
            const healthIncrease = SKILLS.maxHealth.stats.health.base + (level - 1) * SKILLS.maxHealth.stats.health.perLevel;
            player.maxHealth += healthIncrease;
            player.health += healthIncrease;
        }
    },
    attackDamage: {
        name: "Attack Damage", description: "Increase all attack damage", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_attack_damage_glow_effect2", iconNormal: "icon_attack_damage",
        stats: { damageMultiplier: { base: 0.15, perLevel: 0.1 } },
        apply: (player, level) => {
            const multiplier = 1 + (SKILLS.attackDamage.stats.damageMultiplier.base + (level - 1) * SKILLS.attackDamage.stats.damageMultiplier.perLevel);
            Object.keys(SKILLS).forEach(skillKey => {
                if (SKILLS[skillKey].stats?.damage) {
                    SKILLS[skillKey].apply(player, player.skillLevels?.[skillKey] || 0);
                }
            });
        }
    },
    moveSpeed: {
        name: "Movement Speed", description: "Increase movement speed", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_movement_speed_glow_effect2", iconNormal: "icon_movement_speed",
        stats: { speedMultiplier: { base: 0.2, perLevel: 0.1 } },
        apply: (player, level) => {
            const multiplier = 1 + (SKILLS.moveSpeed.stats.speedMultiplier.base + (level - 1) * SKILLS.moveSpeed.stats.speedMultiplier.perLevel);
            player.moveSpeed = (player.baseMoveSpeed || 100) * multiplier;
        }
    },
    pickupRange: {
        name: "Pickup Range", description: "Increase item collection radius", type: "stat", unlocked: true, maxLevel: 10,
        cardBackground: "card_basic_stats", icon: "icon_pickup_range_glow_effect2", iconNormal: "icon_pickup_range",
        stats: { rangeMultiplier: { base: 0.25, perLevel: 0.15 } },
        apply: (player, level) => {
            const multiplier = 1 + (SKILLS.pickupRange.stats.rangeMultiplier.base + (level - 1) * SKILLS.pickupRange.stats.rangeMultiplier.perLevel);
            player.pickupRange = (player.basePickupRange || 50) * multiplier;
        }
    }
};

export default class SkillUpgradeManager {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.pendingLevelUps = 0;
        this.storedState = { timers: [], entities: [], tweens: [], animations: [] };
        this.pauseManager = PauseManager.get();
        this.originalTimeScale = 1;
        this.skillSelectionTimer = null;
        this.skillSelectionTimeLimit = 10000; // 10 seconds
        this.countdownText = null;
        
        this.skillLevels = Object.keys(SKILLS).reduce((acc, key) => {
            acc[key] = key === 'slash' ? 1 : 0;
            return acc;
        }, {});
        
        this.playerLevel = 1;
        scene.skillUpgradeManager = this;
    }
    
    initialize() {
        this.loadCardAssets();
    }
    
    loadCardAssets() {
        const assets = [
            { key: 'card_basic_attack', path: './card/card_basic_attack.png' },
            { key: 'card_basic_stats', path: './card/card_basic_stats.png' },
            { key: 'card_magic_fire', path: './card/card_magic _fire.png' },
            { key: 'card_magic_order', path: './card/card_magic_order.png' }
        ];

        assets.forEach(({ key, path }) => {
            if (!this.scene.textures.exists(key)) {
                this.scene.load.image(key, path);
            }
        });
        for (let i = 1; i <= 10; i++) {
            const key = `Roman_${i}`;
            if (!this.scene.textures.exists(key)) {
                this.scene.load.image(key, `./skill-tiers/Roman_${i}.png`);
            }
        }
        
        this.loadSkillIcons();
        
        this.scene.load.once('complete', () => this.setupInitialSkills());
        this.scene.load.start();
    }
    
    loadSkillIcons() {
        const iconSets = [
            {
                prefix: '',
                suffix: '_glow_effect',
                icons: ['icon_slash', 'icon_fire_arrow', 'icon_fire_ball', 'icon_ice_shard', 'icon_lightning_chain', 
                       'icon_holy_light', 'icon_marksman', 'icon_armor_glow_effect1', 'icon_attack_damage_glow_effect1',
                       'icon_attack_speed_glow_effect1', 'icon_exp_gain_glow_effect1', 'icon_gold_gain_glow_effect1',
                       'icon_max_healt_glow_effect1', 'icon_movement_speed_glow_effect1', 'icon_pickup_range_glow_effect1']
            },
            {
                prefix: '',
                suffix: '',
                icons: ['icon_slash', 'icon_fire_arrow', 'icon_fire_ball', 'icon_ice_shard', 'icon_lightning_chain',
                       'icon_holy_light', 'icon_marksman', 'icon_armor', 'icon_attack_damage', 'icon_attack_speed',
                       'icon_exp_gain', 'icon_gold_gain', 'icon_max_healt', 'icon_movement_speed', 'icon_pickup_range']
            }
        ];

        iconSets.forEach(({ icons }) => {
            icons.forEach(iconKey => {
                if (!this.scene.textures.exists(iconKey)) {
                    const filename = iconKey === 'icon_holy_light' ? 'icon_holy_light-.png' : `${iconKey}.png`;
                    this.scene.load.image(iconKey, `./upgrade-icon/${filename}`);
                }
            });
        });
    }
    
    setupInitialSkills() {
        if (this.scene.player) {
            SKILLS.slash.apply(this.scene.player, 1);
            this.scene.player.baseMoveSpeed = this.scene.player.moveSpeed || 150;
            this.scene.player.basePickupRange = this.scene.player.pickupRange || 50;
            
            this.scene.playerAttackSystem?.updateStats();
            EventBus.emit('skill-levels-updated', { skillLevels: this.skillLevels });
        } else {
            console.warn("SkillUpgradeManager: Player not found, deferring initial skill setup");
        }
    }
    
    showSkillUpgradeSelection() {
        if (this.isActive) {
            this.pendingLevelUps++;
            return;
        }
        
        try {
            const levelUpSound = this.scene.sound.add('levelUp', { volume: 0.6 });
            levelUpSound.play();
        } catch (error) {
            console.error('Error playing level up sound:', error);
        }
        
        this.isActive = true;
        this.pauseGame();
        this.createSkillUI();
    }
    
    pauseGame() {
        this.pauseManager.skillSelectionActive = true;
        
        const currentScene = this.scene;
        if (!currentScene) return;

        currentScene._wasPausedByPauseManager = true;
        
        if (currentScene.physics?.world) {
            currentScene.physics.world.pause();
            this.originalTimeScale = currentScene.physics.world.timeScale || 1;
            currentScene.physics.world.timeScale = 0;
        }
        
        this.pauseTweens(currentScene);
        this.pauseAnimations(currentScene);
        
        const managers = [currentScene.gameplayManager, currentScene.mobManager, currentScene.powerUpManager, currentScene.gameManager];
        managers.forEach(manager => {
            if (manager) {
                manager._isPausedByPauseManager = true;
            }
        });
        
        this.pauseEntities(currentScene);
    }
    
    pauseTweens(scene) {
        if (!scene.tweens) return;
        
        try {
            let tweens = [];
            
            if (typeof scene.tweens.getTweens === 'function') {
                tweens = scene.tweens.getTweens();
            } else if (typeof scene.tweens.getAllTweens === 'function') {
                tweens = scene.tweens.getAllTweens();
            } else if (scene.tweens._tweens) {
                tweens = scene.tweens._tweens;
            } else {
                return;
            }
            
            tweens.forEach(tween => {
                if (tween && typeof tween.isPaused === 'function' && !tween.isPaused()) {
                    const target = tween.targets && tween.targets[0];
                    if (target && (target.depth > 999 || target.name === 'skillCard')) {
                        return;
                    }
                    
                    tween.pause();
                    tween._pausedBySkillManager = true;
                    this.storedState.tweens.push(tween);
                }
            });
        } catch (error) {
            console.warn('SkillUpgradeManager: Error pausing tweens:', error);
        }
    }
    
    pauseAnimations(scene) {
        if (!scene.children) return;
        
        try {
            if (scene.children && scene.children.list) {
                scene.children.list.forEach(child => {
                    if (child.depth > 999 || child.name === 'skillCard') return;
                    
                    if (child.anims && child.anims.isPlaying && !child.anims.isPaused) {
                        child.anims.pause();
                        child._animPausedBySkillManager = true;
                        this.storedState.animations.push(child);
                    }
                });
            }
        } catch (error) {
            console.warn('SkillUpgradeManager: Error pausing animations:', error);
        }
    }
    
    pauseEntities(scene) {
        try {
            if (scene.player?.body) {
                this.storedState.entities.push({
                    entity: scene.player,
                    vx: scene.player.body.velocity.x,
                    vy: scene.player.body.velocity.y,
                    enabled: scene.player.body.enable
                });
                scene.player.body.velocity.setTo(0, 0);
                scene.player.body.enable = false;
            }
            
            if (scene.enemies?.getChildren) {
                scene.enemies.getChildren().forEach(enemy => {
                    if (enemy?.body) {
                        this.storedState.entities.push({
                            entity: enemy,
                            vx: enemy.body.velocity.x,
                            vy: enemy.body.velocity.y,
                            enabled: enemy.body.enable
                        });
                        enemy.body.velocity.setTo(0, 0);
                        enemy.body.enable = false;
                    }
                });
            }
        } catch (error) {
            console.warn('SkillUpgradeManager: Error pausing entities:', error);
        }
    }
    
    createSkillUI() {
        const cam = this.scene.cameras.main;
        this.overlay = this.scene.add.rectangle(cam.width/2, cam.height/2, cam.width, cam.height, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(1000);
        this.overlay.name = 'skillUI';
        
        this.title = this.scene.add.text(cam.width/2, 80, "LEVEL UP! Choose Your Upgrade", {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffff00', stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        this.title.name = 'skillUI';
        
        this.levelText = this.scene.add.text(cam.width/2, 110, `Player Level: ${this.playerLevel + 1}`, {
            fontFamily: 'Arial', fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        this.levelText.name = 'skillUI';
        
        this.countdownText = this.scene.add.text(cam.width/2, 140, `Auto-select in: 10s`, {
            fontFamily: 'Arial', fontSize: '18px', color: '#ff6666', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        this.countdownText.name = 'skillUI';
        
        this.container = this.scene.add.container(0, 0).setDepth(1001).setScrollFactor(0);
        this.container.name = 'skillUI';
        
        const options = this.getAvailableSkillOptions();
        if (options.length === 0) {
            this.resumeGame();
            return;
        }
        
        this.currentSkillOptions = options;
        
        const cardPositions = this.getCardPositions(options.length, cam);
        
        options.forEach((skillKey, i) => {
            const skill = SKILLS[skillKey];
            const currentLevel = this.skillLevels[skillKey];
            const newLevel = currentLevel + 1;
            
            console.log(`SkillUpgradeManager: Creating card for ${skillKey}, level ${currentLevel} -> ${newLevel}`);
            
            const card = new SkillCard(this.scene, cardPositions[i].x, cardPositions[i].y, skillKey, skill, currentLevel, newLevel);
            card.setScale(0.8).setScrollFactor(0).setDepth(1002);
            card.name = 'skillCard';
            card.setOnSelectCallback(() => this.selectSkill(skillKey));
            card.setInteractive({ useHandCursor: true });
            this.container.add(card);
        });
        
        this.scene.add.existing(this.container);
        this.startSkillSelectionTimer();
    }
    
    getCardPositions(numCards, cam) {
        const cardWidth = 200;
        const cardSpacing = 220;
        const totalWidth = (numCards - 1) * cardSpacing;
        const startX = cam.width/2 - totalWidth/2;
        const centerY = cam.height/2 + 20;
        
        return Array.from({ length: numCards }, (_, i) => ({
            x: startX + i * cardSpacing,
            y: centerY
        }));
    }
    
    startSkillSelectionTimer() {
        let timeRemaining = this.skillSelectionTimeLimit / 1000;
        
        this.skillSelectionTimer = this.scene.time.addEvent({
            delay: 1000,
            repeat: timeRemaining - 1,
            callback: () => {
                timeRemaining--;
                if (this.countdownText) {
                    this.countdownText.setText(`Auto-select in: ${timeRemaining}s`);
                    
                    if (timeRemaining <= 3) {
                        this.countdownText.setColor('#ff3333');
                        this.scene.tweens.add({
                            targets: this.countdownText,
                            alpha: 0.3,
                            duration: 250,
                            yoyo: true,
                            repeat: 1
                        });
                    } else if (timeRemaining <= 5) {
                        this.countdownText.setColor('#ff9933');
                    }
                }
                
                if (timeRemaining <= 0) {
                    this.autoSelectSkill();
                }
            }
        });
    }
    
    autoSelectSkill() {
        if (!this.currentSkillOptions || this.currentSkillOptions.length === 0) {
            this.resumeGame();
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.currentSkillOptions.length);
        const selectedSkill = this.currentSkillOptions[randomIndex];
        const cards = this.container.list.filter(child => child.name === 'skillCard');
        if (cards[randomIndex]) {
            this.scene.tweens.add({
                targets: cards[randomIndex],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    this.selectSkill(selectedSkill, true);
                }
            });
        } else {
            this.selectSkill(selectedSkill, true);
        }
    }
    
    clearSkillSelectionTimer() {
        if (this.skillSelectionTimer) {
            this.skillSelectionTimer.destroy();
            this.skillSelectionTimer = null;
        }
    }
    
    getAvailableSkillOptions() {
        const options = Object.keys(SKILLS).filter(skillKey => {
            const skill = SKILLS[skillKey];
            const currentLevel = this.skillLevels[skillKey];
            
            return currentLevel < skill.maxLevel && skill.unlocked;
        });
        
        return options.sort(() => 0.5 - Math.random()).slice(0, Math.min(3, options.length));
    }
    
    selectSkill(skillKey, isAutoSelection = false) {
        this.clearSkillSelectionTimer();
        
        if (isAutoSelection) {
            console.log(`Auto-selected skill: ${skillKey}`);
        } else {
            try {
                const selectionSound = this.scene.sound.add('menuSelection', { volume: 0.5 });
                selectionSound.play();
            } catch (error) {
                console.error('Error playing selection sound:', error);
            }
        }
        
        this.skillLevels[skillKey]++;
        this.playerLevel++;
        
        const skill = SKILLS[skillKey];
        const newLevel = this.skillLevels[skillKey];
        
        if (this.scene.player) {
            skill.apply(this.scene.player, newLevel);
            this.scene.playerAttackSystem?.updateStats();
            
            if (newLevel === 1 && skill.type !== 'stat') {
                this.enableSkillInAttackSystem(skillKey);
            }
        }
        
        EventBus.emit('skill-levels-updated', { skillLevels: this.skillLevels });
        
        this.scene.tweens.add({
            targets: [this.overlay, this.title, this.levelText, this.countdownText, this.container],
            alpha: 0, duration: 300,
            onComplete: () => {
                [this.overlay, this.title, this.levelText, this.countdownText, this.container].forEach(el => el?.destroy());
                this.resumeGame();
                this.handlePending();
            }
        });
    }
    
    enableSkillInAttackSystem(skillKey) {
        const skillToAttackMap = {
            'fireBullet': 'fireBullet', 'fireBomb': 'fireBomb', 'ice': 'ice',
            'lightning': 'lightning', 'blindingLight': 'blindingLight', 'marksman': 'marksman'
        };
        
        const attackKey = skillToAttackMap[skillKey];
        if (!attackKey) return;
        
        if (this.scene.playerAttack?.enableAttackType) {
            this.scene.playerAttack.enableAttackType(attackKey);
        } else if (this.scene.playerAttackSystem?.attackTypes) {
            this.scene.playerAttackSystem.attackTypes[attackKey] = true;
        } else {
            console.warn(`SkillUpgradeManager: Could not find attack system to enable ${skillKey}`);
        }
    }
    
    resumeGame() {
        this.pauseManager.skillSelectionActive = false;
        this.clearSkillSelectionTimer();
        
        const currentScene = this.scene;
        if (!currentScene) return;
        currentScene._wasPausedByPauseManager = false;
        
        if (currentScene.physics?.world) {
            currentScene.physics.world.resume();
            currentScene.physics.world.timeScale = this.originalTimeScale;
        }
        
        this.storedState.tweens.forEach(tween => {
            if (tween._pausedBySkillManager && typeof tween.resume === 'function') {
                tween.resume();
                tween._pausedBySkillManager = false;
            }
        });
        
        this.storedState.animations.forEach(sprite => {
            if (sprite._animPausedBySkillManager && sprite.anims) {
                sprite.anims.resume();
                sprite._animPausedBySkillManager = false;
            }
        });
        
        this.storedState.entities.forEach(({ entity, vx, vy, enabled }) => {
            if (entity?.body) {
                entity.body.velocity.setTo(vx, vy);
                entity.body.enable = enabled;
            }
        });
        
        const managers = [currentScene.gameplayManager, currentScene.mobManager, currentScene.powerUpManager, currentScene.gameManager];
        managers.forEach(manager => {
            if (manager) {
                manager._isPausedByPauseManager = false;
            }
        });
        
        this.storedState = { timers: [], entities: [], tweens: [], animations: [] };
        this.isActive = false;
        this.currentSkillOptions = null;
    }
    
    handlePending() {
        if (this.pendingLevelUps > 0) {
            this.pendingLevelUps--;
            this.scene.time.delayedCall(500, () => this.showSkillUpgradeSelection());
        }
    }
    
    getSkillLevel(skillKey) { return this.skillLevels[skillKey] || 0; }
    getSkillInfo(skillKey) { return SKILLS[skillKey]; }
    getPlayerLevel() { return this.playerLevel; }
    
    getSaveData() {
        return {
            skillLevels: this.skillLevels,
            playerLevel: this.playerLevel
        };
    }
    
    loadSaveData(data) {
        if (data) {
            this.skillLevels = data.skillLevels || this.skillLevels;
            this.playerLevel = data.playerLevel || this.playerLevel;
            
            Object.keys(this.skillLevels).forEach(skillKey => {
                const level = this.skillLevels[skillKey];
                if (level > 0) {
                    SKILLS[skillKey].apply(this.scene.player, level);
                    if (level === 1 && SKILLS[skillKey].type !== 'stat') {
                        this.enableSkillInAttackSystem(skillKey);
                    }
                }
            });
            
            this.scene.playerAttackSystem?.updateStats();
            EventBus.emit('skill-levels-updated', { skillLevels: this.skillLevels });
        }
    }
    
    shutdown() {
        [this.overlay, this.title, this.levelText, this.countdownText, this.container].forEach(el => el?.destroy());
        
        if (this.pauseManager) {
            this.pauseManager.skillSelectionActive = false;
        }
        
        this.clearSkillSelectionTimer();
        if (this.isActive) {
            this.resumeGame();
        }
    }
}

export { SKILLS };