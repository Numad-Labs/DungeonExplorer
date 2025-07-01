import Zombie from "../prefabs/Enemies/Zombie1";
import Zombie2 from "../prefabs/Enemies/Zombie2";
import PoliceDroid from "../prefabs/Enemies/PoliceDroid";
import Assassin from "../prefabs/Enemies/Assassin";
import AssassinTank from "../prefabs/Enemies/AssassinTank";
import AssassinArcher from "../prefabs/Enemies/AssassinArcher";

const MOB_CONFIGS = {
    zombie: {
        class: Zombie,
        texture: "zombierun",
        baseHealth: 30,
        baseDamage: 10,
        baseSpeed: 50,
        expValue: 10,
        goldValue: 5,
        spawnWeight: 50,
        minWave: 1
    },
    
    zombieBig: {
        class: Zombie2,
        texture: "Zombie2RunAni",
        baseHealth: 50,
        baseDamage: 20,
        baseSpeed: 40,
        expValue: 20,
        goldValue: 15,
        spawnWeight: 25,
        minWave: 2
    },
    
    policeDroid: {
        class: PoliceDroid,
        texture: "Police run",
        baseHealth: 35,
        baseDamage: 15,
        baseSpeed: 55,
        expValue: 15,
        goldValue: 10,
        spawnWeight: 20,
        minWave: 3
    },
    
    assassin: {
        class: Assassin,
        texture: "Dagger Bandit-Run",
        baseHealth: 25,
        baseDamage: 25,
        baseSpeed: 70,
        expValue: 25,
        goldValue: 20,
        spawnWeight: 15,
        minWave: 4
    },
    
    assassinTank: {
        class: AssassinTank,
        texture: "assassinTank",
        baseHealth: 80,
        baseDamage: 30,
        baseSpeed: 30,
        expValue: 40,
        goldValue: 35,
        spawnWeight: 8,
        minWave: 6
    },
    
    assassinArcher: {
        class: AssassinArcher,
        texture: "assassinArcher",
        baseHealth: 20,
        baseDamage: 18,
        baseSpeed: 45,
        expValue: 30,
        goldValue: 25,
        spawnWeight: 12,
        minWave: 5
    }
};

export default class MobManager {
    constructor(scene) {
        this.scene = scene;
        this.gameManager = null;
        this.player = null;
        
        // Core tracking
        this.mobGroup = null;
        this.activeMobs = new Map();
        
        // Spawn settings
        this.spawnTimer = null;
        this.waveTimer = null;
        this.maxMobs = 30;
        this.spawnDelay = 3000;
        
        // Wave system
        this.currentWave = 0;
        this.waveActive = false;
        this.waveMobs = [];
        
        // Statistics
        this.stats = {
            totalSpawned: 0,
            totalKilled: 0,
            killsByType: new Map()
        };
        
        Object.keys(MOB_CONFIGS).forEach(type => {
            this.stats.killsByType.set(type, 0);
        });
    }
    
    initialize(gameManager, player) {
        this.gameManager = gameManager;
        this.player = player;
        
        this.setupMobGroup();
        this.startSpawning();
        this.setupEventListeners();
        
        console.log("MobManager initialized");
    }
    
    setupMobGroup() {
        this.mobGroup = this.scene.physics.add.group();
        
        this.scene.physics.add.collider(
            this.mobGroup, 
            this.mobGroup,
            this.handleMobCollision,
            null,
            this
        );
        
        this.scene.zombieGroup = this.mobGroup;
        this.scene.enemies = this.mobGroup;
    }
    
    startSpawning() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnDelay,
            callback: () => this.spawnRandomMob(),
            loop: true
        });
        
        this.waveTimer = this.scene.time.addEvent({
            delay: 20000,
            callback: () => this.triggerNextWave(),
            loop: false
        });
    }
    
    triggerNextWave() {
        const nextWave = this.currentWave + 1;
        this.startWave(nextWave);
        
        if (this.waveTimer) {
            this.waveTimer.destroy();
        }
        
        this.waveTimer = this.scene.time.addEvent({
            delay: 20000,
            callback: () => this.triggerNextWave(),
            loop: false
        });
    }
    
    setupEventListeners() {
        if (this.gameManager?.events) {
            this.gameManager.events.on('difficultyUpdated', this.updateDifficulty, this);
        }
    }
    
    spawnMob(type, x, y) {
        const config = MOB_CONFIGS[type];
        if (!config) {
            console.warn(`Unknown mob type: ${type}`);
            return null;
        }
        
        try {
            const mob = new config.class(this.scene, x, y);
            
            this.applyStats(mob, config);
            this.setupMobProperties(mob, type);
            
            this.scene.add.existing(mob);
            this.mobGroup.add(mob);
            
            this.trackMob(mob, type);
            this.stats.totalSpawned++;
            
            return mob;
        } catch (error) {
            console.error(`Error spawning ${type}:`, error);
            return null;
        }
    }
    
    applyStats(mob, config) {
        const difficulty = this.gameManager?.gameProgress?.currentDifficulty || 1;
        const waveBonus = this.currentWave * 0.1;
        
        const healthScale = 1 + ((difficulty - 1) * 0.2) + waveBonus;
        const damageScale = 1 + ((difficulty - 1) * 0.1) + (waveBonus * 0.5);
        const speedScale = 1 + ((difficulty - 1) * 0.05);
        
        mob.maxHealth = Math.floor(config.baseHealth * healthScale);
        mob.health = mob.maxHealth;
        mob.damage = Math.floor(config.baseDamage * damageScale);
        mob.speed = Math.floor(config.baseSpeed * speedScale);
        mob.expValue = Math.floor(config.expValue * (1 + waveBonus));
        mob.goldValue = Math.floor(config.goldValue * (1 + waveBonus));
    }
    
    setupMobProperties(mob, type) {
        mob.mobType = type;
        mob.spawnTime = Date.now();
        mob.isWaveMob = this.waveActive;
        
        const originalDie = mob.die?.bind(mob);
        mob.die = () => {
            this.handleMobDeath(mob);
            if (originalDie) originalDie();
        };
        
        mob.spawnRewards = () => {
        };
    }
    
    trackMob(mob, type) {
        const id = `mob_${Date.now()}_${Math.random()}`;
        mob.trackingId = id;
        
        this.activeMobs.set(id, {
            mob: mob,
            type: type,
            spawnTime: Date.now(),
            isAlive: true
        });
    }
    
    spawnRandomMob() {
        if (!this.player || this.getActiveMobCount() >= this.maxMobs) return;
        
        const mobType = this.selectMobType();
        const position = this.getSpawnPosition();
        
        return this.spawnMob(mobType, position.x, position.y);
    }
    
    selectMobType() {
        const currentLevel = Math.max(
            this.gameManager?.gameProgress?.currentDifficulty || 1,
            this.currentWave
        );
        
        const availableTypes = Object.keys(MOB_CONFIGS).filter(type => {
            return MOB_CONFIGS[type].minWave <= currentLevel;
        });
        
        const weightedTypes = [];
        availableTypes.forEach(type => {
            const weight = MOB_CONFIGS[type].spawnWeight;
            for (let i = 0; i < weight; i++) {
                weightedTypes.push(type);
            }
        });
        
        return Phaser.Utils.Array.GetRandom(weightedTypes);
    }
    
    getSpawnPosition() {
        if (!this.player) return { x: 0, y: 0 };
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(300, 500);
        
        return {
            x: this.player.x + Math.cos(angle) * distance,
            y: this.player.y + Math.sin(angle) * distance
        };
    }
    
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.waveActive = true;
        this.waveMobs = [];
        
        const mobCount = this.calculateWaveSize(waveNumber);
        
        const specialWaveType = this.getSpecialWaveType(waveNumber);
        
        if (specialWaveType) {
            this.startSpecialWave(waveNumber, specialWaveType);
        } else {
            this.startNormalWave(waveNumber, mobCount);
        }
    }
    
    startNormalWave(waveNumber, mobCount) {
        this.showWaveAnnouncement(waveNumber, mobCount);
        
        for (let i = 0; i < mobCount; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const type = this.selectMobType();
                const position = this.getSpawnPosition();
                const mob = this.spawnMob(type, position.x, position.y);
                
                if (mob) {
                    this.waveMobs.push(mob);
                }
            });
        }
    }
    
    showWaveAnnouncement(waveNumber, mobCount) {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        const announcement = this.scene.add.text(centerX, centerY, `WAVE ${waveNumber}\n${mobCount} ENEMIES`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            fontStyle: 'bold'
        });
        announcement.setOrigin(0.5);
        announcement.setScrollFactor(0);
        announcement.setDepth(1000);
        
        this.scene.tweens.add({
            targets: announcement,
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(2500, () => {
                    this.scene.tweens.add({
                        targets: announcement,
                        alpha: 0,
                        duration: 800,
                        onComplete: () => announcement.destroy()
                    });
                });
            }
        });
    }
    
    startSpecialWave(waveNumber, specialType) {
        let mobCount, mobTypes, announcement;
        
        switch (specialType) {
            case 'swarm':
                mobCount = Math.min(15 + (waveNumber * 3), 30);
                mobTypes = ['zombie'];
                announcement = `SWARM INCOMING!\nWAVE ${waveNumber} - ${mobCount} ZOMBIES`;
                break;
                
            case 'elite':
                mobCount = Math.floor(this.calculateWaveSize(waveNumber) * 0.4);
                mobTypes = ['assassinTank', 'assassinArcher'];
                announcement = `ELITE SQUAD!\nWAVE ${waveNumber} - ${mobCount} ELITES`;
                break;
                
            case 'mixed':
                mobCount = Math.floor(this.calculateWaveSize(waveNumber) * 1.3);
                mobTypes = ['zombie', 'zombieBig', 'policeDroid', 'assassin'];
                announcement = `MIXED ASSAULT!\nWAVE ${waveNumber} - ${mobCount} ENEMIES`;
                break;
                
            case 'boss':
                mobCount = Math.max(1, Math.floor(waveNumber / 10));
                mobTypes = ['assassinTank'];
                announcement = `BOSS WAVE!\nWAVE ${waveNumber} - ${mobCount} BOSS${mobCount > 1 ? 'ES' : ''}`;
                break;
                
            default:
                this.startNormalWave(waveNumber, this.calculateWaveSize(waveNumber));
                return;
        }
        
        this.showSpecialWaveAnnouncement(waveNumber, announcement, specialType);
        
        for (let i = 0; i < mobCount; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const type = Phaser.Utils.Array.GetRandom(mobTypes);
                const position = this.getSpawnPosition();
                const mob = this.spawnMob(type, position.x, position.y);
                
                if (mob) {
                    if (specialType === 'elite' || specialType === 'boss') {
                        mob.maxHealth *= 2;
                        mob.health = mob.maxHealth;
                        mob.damage *= 1.5;
                        mob.expValue *= 2;
                        mob.goldValue *= 2;
                    }
                    
                    if (specialType === 'boss') {
                        mob.maxHealth *= 3;
                        mob.health = mob.maxHealth;
                        mob.damage *= 2;
                        mob.expValue *= 5;
                        mob.goldValue *= 5;
                        mob.setTint(0xff0000);
                    }
                    
                    mob.isSpecialWave = true;
                    mob.specialWaveType = specialType;
                    this.waveMobs.push(mob);
                    
                    this.createSpawnPortalEffect(position.x, position.y);
                }
            });
        }
    }
    
    getSpecialWaveType(waveNumber) {
        if (waveNumber % 10 === 0) return 'boss';
        if (waveNumber % 7 === 0) return 'elite';
        if (waveNumber % 5 === 0) return 'swarm';
        if (waveNumber % 8 === 0) return 'mixed'; 
        
        return null;
    }
    
    createSpawnPortalEffect(x, y) {
        const portal = this.scene.add.circle(x, y, 20, 0x8800ff, 0.8);
        this.scene.tweens.add({
            targets: portal,
            scale: { from: 0, to: 2 },
            alpha: { from: 0.8, to: 0 },
            duration: 500,
            onComplete: () => portal.destroy()
        });
    }
    
    calculateWaveSize(waveNumber) {
        const baseSize = 8;
        const waveScaling = Math.floor(waveNumber * 1.2);
        const difficultyBonus = Math.floor((this.gameManager?.gameProgress?.currentDifficulty || 1) * 1.5);
        
        return Math.min(25, baseSize + waveScaling + difficultyBonus);
    }
    
    showSpecialWaveAnnouncement(waveNumber, message, specialType) {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        let color = '#ff6600';
        if (specialType === 'swarm') color = '#ff0000';
        if (specialType === 'elite') color = '#ffaa00';
        if (specialType === 'mixed') color = '#00aaff';
        if (specialType === 'boss') color = '#ff0088';
        
        const announcement = this.scene.add.text(centerX, centerY - 60, message, {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: color,
            stroke: '#ffffff',
            strokeThickness: 4,
            align: 'center',
            fontStyle: 'bold'
        });
        announcement.setOrigin(0.5);
        announcement.setScrollFactor(0);
        announcement.setDepth(1000);
        
        const flash = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width * 2, this.scene.cameras.main.height * 2, 0xff0000, 0.3);
        flash.setScrollFactor(0);
        flash.setDepth(999);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });
        
        this.scene.tweens.add({
            targets: announcement,
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(3000, () => {
                    this.scene.tweens.add({
                        targets: announcement,
                        alpha: 0,
                        duration: 800,
                        onComplete: () => announcement.destroy()
                    });
                });
            }
        });
    }
    
    checkWaveCompletion() {
        if (!this.waveActive) return;
        
        const aliveWaveMobs = this.waveMobs.filter(mob => 
            mob && mob.active && !mob.isDead
        );
        
        if (aliveWaveMobs.length === 0) {
            this.completeWave();
        }
    }
    
    completeWave() {
        this.waveActive = false;
        const completedWave = this.currentWave;
        const specialType = this.waveMobs.length > 0 ? this.waveMobs[0].specialWaveType : null;
        this.waveMobs = [];
        
        let expBonus = completedWave * 100;
        let goldBonus = completedWave * 50;
        
        if (specialType) {
            switch (specialType) {
                case 'swarm':
                    expBonus *= 1.5;
                    goldBonus *= 1.5;
                    break;
                case 'elite':
                    expBonus *= 2;
                    goldBonus *= 2;
                    break;
                case 'mixed':
                    expBonus *= 1.8;
                    goldBonus *= 1.8;
                    break;
                case 'boss':
                    expBonus *= 3;
                    goldBonus *= 3;
                    break;
            }
        }
        
        if (this.gameManager) {
            this.gameManager.addExperience(expBonus);
            this.gameManager.addGold(goldBonus);
        }
        
        this.showWaveCompletionMessage(completedWave, specialType, expBonus, goldBonus);
        
        console.log(`Wave ${completedWave} completed! Bonus: +${expBonus} XP, +${goldBonus} Gold`);
    }
    
    showWaveCompletionMessage(waveNumber, specialType, expBonus, goldBonus) {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        let message = `WAVE ${waveNumber} COMPLETE!`;
        if (specialType) {
            message += `\n${specialType.toUpperCase()} DEFEATED!`;
        }
        
        const completionText = this.scene.add.text(centerX, centerY - 30, message, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            fontStyle: 'bold'
        });
        completionText.setOrigin(0.5);
        completionText.setScrollFactor(0);
        completionText.setDepth(1000);
        
        const bonusText = this.scene.add.text(centerX, centerY + 20, `BONUS: +${expBonus} XP, +${goldBonus} Gold`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        });
        bonusText.setOrigin(0.5);
        bonusText.setScrollFactor(0);
        bonusText.setDepth(1000);
        
        this.scene.tweens.add({
            targets: [completionText, bonusText],
            scale: { from: 0, to: 1 },
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(3000, () => {
                    this.scene.tweens.add({
                        targets: [completionText, bonusText],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            completionText.destroy();
                            bonusText.destroy();
                        }
                    });
                });
            }
        });
        
        const successFlash = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width * 2, this.scene.cameras.main.height * 2, 0x00ff00, 0.2);
        successFlash.setScrollFactor(0);
        successFlash.setDepth(999);
        
        this.scene.tweens.add({
            targets: successFlash,
            alpha: 0,
            duration: 400,
            onComplete: () => successFlash.destroy()
        });
    }
    
    handleMobDeath(mob) {
        if (!mob.trackingId) return;
        
        const trackingData = this.activeMobs.get(mob.trackingId);
        if (!trackingData) return;
        
        this.stats.totalKilled++;
        const currentKills = this.stats.killsByType.get(mob.mobType) || 0;
        this.stats.killsByType.set(mob.mobType, currentKills + 1);
        
        if (this.gameManager) {
            this.gameManager.addEnemyKill();
            this.gameManager.addGold(mob.goldValue || 5);
        }
        
        this.trySpawnExperienceOrb(mob);
        
        if (mob.isWaveMob) {
            this.checkWaveCompletion();
        }
        
        this.activeMobs.delete(mob.trackingId);
    }
    
    trySpawnExperienceOrb(mob) {
        let dropChance = 0.8;
        
        const config = MOB_CONFIGS[mob.mobType];
        if (config) {
            switch (config.spawnWeight) {
                case 50:
                    dropChance = 0.25;
                    break;
                case 25:
                    dropChance = 0.35;
                    break;
                case 20:
                    dropChance = 0.4;
                    break;
                case 15:
                    dropChance = 0.5;
                    break;
                case 12:
                    dropChance = 0.55;
                    break;
                case 8:
                    dropChance = 0.7;
                    break;
            }
        }
        
        if (mob.isSpecialWave) {
            dropChance *= 1.5;
        }
        
        if (mob.specialWaveType === 'boss') {
            dropChance = 1.0;
        }
        
        if (Math.random() < dropChance) {
            let orbValue = 1;
            
            if (mob.expValue) {
                if (mob.expValue >= 40) orbValue = 5;
                else if (mob.expValue >= 25) orbValue = 3;
                else if (mob.expValue >= 15) orbValue = 2;
                else orbValue = 1;
            }
            
            if (Math.random() < 0.05) {
                orbValue *= 3;
            }
            
            if (this.scene.spawnExperienceOrb) {
                this.scene.spawnExperienceOrb(mob.x, mob.y, orbValue);
            }
        }
    }
    
    handleMobCollision(mob1, mob2) {
        const distance = Phaser.Math.Distance.Between(
            mob1.x, mob1.y, mob2.x, mob2.y
        );
        
        if (distance < 25) {
            const angle = Phaser.Math.Angle.Between(
                mob1.x, mob1.y, mob2.x, mob2.y
            );
            
            const force = 20;
            const pushX = Math.cos(angle) * force;
            const pushY = Math.sin(angle) * force;
            
            if (mob2.body) {
                mob2.body.velocity.x += pushX;
                mob2.body.velocity.y += pushY;
            }
            if (mob1.body) {
                mob1.body.velocity.x -= pushX;
                mob1.body.velocity.y -= pushY;
            }
        }
    }
    
    updateDifficulty(difficulty) {
        this.maxMobs = Math.min(60, 30 + difficulty * 3);
        this.spawnDelay = Math.max(1000, 3000 - difficulty * 200);
        
        if (this.spawnTimer) {
            this.spawnTimer.delay = this.spawnDelay;
        }
    }
    
    getActiveMobCount() {
        return Array.from(this.activeMobs.values())
            .filter(data => data.isAlive).length;
    }
    
    getAllActiveMobs() {
        return Array.from(this.activeMobs.values())
            .filter(data => data.isAlive)
            .map(data => data.mob);
    }
    
    getMobsByType(type) {
        return Array.from(this.activeMobs.values())
            .filter(data => data.type === type && data.isAlive)
            .map(data => data.mob);
    }
    
    killAllMobs() {
        this.getAllActiveMobs().forEach(mob => {
            if (mob.takeDamage) {
                mob.takeDamage(9999);
            }
        });
    }
    
    getWaveProgress() {
        if (!this.waveActive) {
            return { 
                completed: true, 
                remaining: 0, 
                total: 0,
                waveNumber: this.currentWave,
                nextWaveTime: this.waveTimer ? Math.ceil(this.waveTimer.getRemaining() / 1000) : 0
            };
        }
        
        const aliveCount = this.waveMobs.filter(m => m.active && !m.isDead).length;
        return {
            completed: false,
            remaining: aliveCount,
            total: this.waveMobs.length,
            waveNumber: this.currentWave,
            nextWaveTime: 0
        };
    }
    
    getCurrentWave() {
        return this.currentWave;
    }
    
    isWaveActive() {
        return this.waveActive;
    }
    
    getTimeToNextWave() {
        return this.waveTimer ? Math.ceil(this.waveTimer.getRemaining() / 1000) : 0;
    }
    
    getStatistics() {
        return {
            totalSpawned: this.stats.totalSpawned,
            totalKilled: this.stats.totalKilled,
            activeCount: this.getActiveMobCount(),
            killsByType: Object.fromEntries(this.stats.killsByType),
            currentWave: this.currentWave,
            waveActive: this.waveActive,
            waveProgress: this.getWaveProgress()
        };
    }
    
    update(time, delta) {
        const toRemove = [];
        this.activeMobs.forEach((data, id) => {
            if (!data.mob.active || data.mob.isDead) {
                toRemove.push(id);
            }
        });
        toRemove.forEach(id => this.activeMobs.delete(id));
    }
    
    shutdown() {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
        }
        
        if (this.waveTimer) {
            this.waveTimer.destroy();
        }
        
        this.getAllActiveMobs().forEach(mob => {
            if (mob.destroy) mob.destroy();
        });
        
        this.activeMobs.clear();
        this.waveMobs = [];
        
        if (this.mobGroup) {
            this.mobGroup.clear(true, true);
        }
        
        console.log("MobManager shutdown");
    }
}