import SkillCard from "../prefabs/SkillCard";
import { EventBus } from '../game/EventBus';

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
        name: "Fire Arrow", description: "Fast piercing fire projectile", type: "fire", unlocked: false, unlockLevel: 3, maxLevel: 10,
        cardBackground: "card_magic_fire", icon: "icon_fire_arrow_glow_effect", iconNormal: "icon_fire_arrow",
        stats: { damage: { base: 8, perLevel: 1.5 }, fireRate: { base: 1.2, perLevel: 0.15 }, range: { base: 300, perLevel: 20 } },
        apply: (player, level) => {
            player.fireBulletDamage = SKILLS.fireBullet.stats.damage.base + (level - 1) * SKILLS.fireBullet.stats.damage.perLevel;
            player.fireBulletFireRate = SKILLS.fireBullet.stats.fireRate.base + (level - 1) * SKILLS.fireBullet.stats.fireRate.perLevel;
            player.fireBulletRange = SKILLS.fireBullet.stats.range.base + (level - 1) * SKILLS.fireBullet.stats.range.perLevel;
        }
    },
    fireBomb: {
        name: "Fire Ball", description: "Explosive area damage", type: "fire", unlocked: false, unlockLevel: 6, maxLevel: 10,
        cardBackground: "card_magic_fire", icon: "icon_fire_ball_glow_effect", iconNormal: "icon_fire_ball",
        stats: { damage: { base: 18, perLevel: 3 }, fireRate: { base: 0.4, perLevel: 0.05 }, range: { base: 220, perLevel: 15 } },
        apply: (player, level) => {
            player.fireBombDamage = SKILLS.fireBomb.stats.damage.base + (level - 1) * SKILLS.fireBomb.stats.damage.perLevel;
            player.fireBombFireRate = SKILLS.fireBomb.stats.fireRate.base + (level - 1) * SKILLS.fireBomb.stats.fireRate.perLevel;
            player.fireBombRange = SKILLS.fireBomb.stats.range.base + (level - 1) * SKILLS.fireBomb.stats.range.perLevel;
        }
    },
    ice: {
        name: "Ice Shard", description: "Slowing ice projectile", type: "ice", unlocked: false, unlockLevel: 4, maxLevel: 10,
        cardBackground: "card_magic_order", icon: "icon_ice_shard_glow_effect", iconNormal: "icon_ice_shard",
        stats: { damage: { base: 12, perLevel: 2 }, fireRate: { base: 0.6, perLevel: 0.08 }, range: { base: 180, perLevel: 12 } },
        apply: (player, level) => {
            player.iceDamage = SKILLS.ice.stats.damage.base + (level - 1) * SKILLS.ice.stats.damage.perLevel;
            player.iceFireRate = SKILLS.ice.stats.fireRate.base + (level - 1) * SKILLS.ice.stats.fireRate.perLevel;
            player.iceRange = SKILLS.ice.stats.range.base + (level - 1) * SKILLS.ice.stats.range.perLevel;
        }
    },
    lightning: {
        name: "Lightning Chain", description: "Chaining electric attack", type: "lightning", unlocked: false, unlockLevel: 5, maxLevel: 10,
        cardBackground: "card_magic_order", icon: "icon_lightning_chain_glow_effect", iconNormal: "icon_lightning_chain",
        stats: { damage: { base: 20, perLevel: 3 }, fireRate: { base: 0.5, perLevel: 0.06 }, chainCount: { base: 10, perLevel: 1 } },
        apply: (player, level) => {
            player.lightningDamage = SKILLS.lightning.stats.damage.base + (level - 1) * SKILLS.lightning.stats.damage.perLevel;
            player.lightningFireRate = SKILLS.lightning.stats.fireRate.base + (level - 1) * SKILLS.lightning.stats.fireRate.perLevel;
            player.lightningChainCount = SKILLS.lightning.stats.chainCount.base + (level - 1) * SKILLS.lightning.stats.chainCount.perLevel;
        }
    },
    blindingLight: {
        name: "Holy Light", description: "Blinding area effect", type: "holy", unlocked: false, unlockLevel: 7, maxLevel: 10,
        cardBackground: "card_magic_order", icon: "icon_holy_light_glow_effect", iconNormal: "icon_holy_light",
        stats: { range: { base: 300, perLevel: 25 }, fireRate: { base: 0.15, perLevel: 0.02 }, duration: { base: 4000, perLevel: 300 } },
        apply: (player, level) => {
            player.blindingLightRange = SKILLS.blindingLight.stats.range.base + (level - 1) * SKILLS.blindingLight.stats.range.perLevel;
            player.blindingLightFireRate = SKILLS.blindingLight.stats.fireRate.base + (level - 1) * SKILLS.blindingLight.stats.fireRate.perLevel;
            player.blindingLightDisableDuration = SKILLS.blindingLight.stats.duration.base + (level - 1) * SKILLS.blindingLight.stats.duration.perLevel;
        }
    },
    marksman: {
        name: "Marksman Shot", description: "High-damage precise shot", type: "marksman", unlocked: false, unlockLevel: 8, maxLevel: 10,
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
        this.storedState = { timers: [], entities: [] };
        
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
        this.isActive = true;
        this.pauseGame();
        this.createSkillUI();
    }
    
    pauseGame() {
        ['enemySpawnTimer', 'orbSpawnTimer', 'difficultyTimer'].forEach(timer => {
            if (this.scene[timer]) {
                this.storedState.timers.push({ name: timer, paused: this.scene[timer].paused });
                this.scene[timer].paused = true;
            }
        });
        
        [this.scene.player, ...(this.scene.enemies?.getChildren() || [])].forEach(entity => {
            if (entity?.body) {
                this.storedState.entities.push({
                    entity, vx: entity.body.velocity.x, vy: entity.body.velocity.y, enabled: entity.body.enable
                });
                entity.body.velocity.setTo(0, 0);
                entity.body.enable = false;
            }
        });
        
        this.originalUpdate = this.scene.update;
        this.scene.update = () => {};
    }
    
    createSkillUI() {
        const cam = this.scene.cameras.main;
        this.overlay = this.scene.add.rectangle(cam.width/2, cam.height/2, cam.width, cam.height, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(1000);
        
        this.title = this.scene.add.text(cam.width/2, 80, "LEVEL UP! Choose Your Upgrade", {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffff00', stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        this.levelText = this.scene.add.text(cam.width/2, 110, `Player Level: ${this.playerLevel + 1}`, {
            fontFamily: 'Arial', fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        this.container = this.scene.add.container(0, 0).setDepth(1001).setScrollFactor(0);
        
        const options = this.getAvailableSkillOptions();
        if (options.length === 0) {
            this.resumeGame();
            return;
        }
        
        const cardPositions = this.getCardPositions(options.length, cam);
        
        options.forEach((skillKey, i) => {
            const skill = SKILLS[skillKey];
            const currentLevel = this.skillLevels[skillKey];
            const newLevel = currentLevel + 1;
            
            console.log(`SkillUpgradeManager: Creating card for ${skillKey}, level ${currentLevel} -> ${newLevel}`);
            
            const card = new SkillCard(this.scene, cardPositions[i].x, cardPositions[i].y, skillKey, skill, currentLevel, newLevel);
            card.setScale(0.8).setScrollFactor(0).setDepth(1002);
            card.setOnSelectCallback(() => this.selectSkill(skillKey));
            card.setInteractive({ useHandCursor: true });
            this.container.add(card);
        });
        
        this.scene.add.existing(this.container);
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
    
    getAvailableSkillOptions() {
        const options = Object.keys(SKILLS).filter(skillKey => {
            const skill = SKILLS[skillKey];
            const currentLevel = this.skillLevels[skillKey];
            
            return currentLevel < skill.maxLevel && 
                   (skill.unlocked || (skill.unlockLevel && this.playerLevel >= skill.unlockLevel));
        });
        
        return options.sort(() => 0.5 - Math.random()).slice(0, Math.min(3, options.length));
    }
    
    selectSkill(skillKey) {
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
            targets: [this.overlay, this.title, this.levelText, this.container],
            alpha: 0, duration: 300,
            onComplete: () => {
                [this.overlay, this.title, this.levelText, this.container].forEach(el => el?.destroy());
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
        this.storedState.timers.forEach(({ name, paused }) => {
            if (this.scene[name]) this.scene[name].paused = paused;
        });
        
        this.storedState.entities.forEach(({ entity, vx, vy, enabled }) => {
            if (entity?.body) {
                entity.body.velocity.setTo(vx, vy);
                entity.body.enable = enabled;
            }
        });
        
        if (this.originalUpdate) this.scene.update = this.originalUpdate;
        
        this.storedState = { timers: [], entities: [] };
        this.isActive = false;
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
        [this.overlay, this.title, this.levelText, this.container].forEach(el => el?.destroy());
        if (this.originalUpdate) this.scene.update = this.originalUpdate;
    }
}

export { SKILLS };
