import SkillUpgradeManager from "./SkillUpgradeManager";

const LEGACY_POWER_UPS = {
    speed: { base: 20, color: 0x00ff00, apply: (p, v) => p.moveSpeed *= (1 + v/100) },
    damage: { base: 15, color: 0xff0000, apply: (p, v) => { p.damage *= (1 + v/100); p.scene.playerAttackSystem?.updateStats(); }},
    health: { base: 10, color: 0x0000ff, apply: (p, v) => { p.maxHealth += 50; p.health += 50; }},
    fireRate: { base: 10, color: 0xffff00, apply: (p, v) => { p.fireRate *= (1 + v/100); p.scene.playerAttackSystem?.updateStats(); }},
    range: { base: 15, color: 0x00ffff, apply: (p, v) => { p.attackRange *= (1 + v/100); p.scene.playerAttackSystem?.updateStats(); }},
    magnet: { base: 20, color: 0xff00ff, apply: (p, v) => p.pickupRange *= (1 + v/100) }
};

export default class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.skillUpgradeManager = new SkillUpgradeManager(scene);
        this.powerUps = Object.keys(LEGACY_POWER_UPS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        this.isActive = false;
        this.pendingLevelUps = 0;
        this.storedState = { timers: [], entities: [] };
        scene.powerUpManager = this;
    }
    
    initialize() {
        this.skillUpgradeManager.initialize();
        this.createTextures();
    }
    
    createTextures() {
        if (!this.scene.textures.exists('blank cards7')) {
            const g = this.scene.add.graphics();
            g.fillStyle(0x333333, 1).fillRoundedRect(0, 0, 200, 300, 16);
            g.lineStyle(4, 0xffffff, 1).strokeRoundedRect(0, 0, 200, 300, 16);
            g.generateTexture('blank cards7', 200, 300);
            g.destroy();
        }
        
        Object.entries(LEGACY_POWER_UPS).forEach(([type, config]) => {
            const iconName = `${type}_icon`;
            if (this.scene.textures.exists(iconName)) return;
            
            const g = this.scene.add.graphics();
            g.fillStyle(config.color, 1).fillCircle(32, 32, 32);
            g.fillStyle(0xffffff, 1).fillCircle(32, 32, 15);
            g.generateTexture(iconName, 64, 64);
            g.destroy();
        });
    }
    
    showPowerUpSelection() {
        this.skillUpgradeManager.showSkillUpgradeSelection();
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
    
    createUI() {
        const cam = this.scene.cameras.main;
        
        this.overlay = this.scene.add.rectangle(cam.width/2, cam.height/2, cam.width, cam.height, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(1000);
        
        this.title = this.scene.add.text(cam.width/2, 100, "LEVEL UP! Choose a Power-Up", {
            fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        this.container = this.scene.add.container(0, 0).setDepth(1001).setScrollFactor(0);
        
        const options = Object.keys(LEGACY_POWER_UPS).sort(() => 0.5 - Math.random()).slice(0, 3);
        const positions = [-220, 0, 220].map(x => ({ x: cam.width/2 + x, y: cam.height/2 }));
        
        options.forEach((type, i) => {
            const card = this.scene.add.rectangle(positions[i].x, positions[i].y, 150, 200, 0x333333);
            card.setStrokeStyle(2, 0xffffff);
            card.setInteractive({ useHandCursor: true });
            card.on('pointerdown', () => this.selectPowerUp(type));
            
            const text = this.scene.add.text(positions[i].x, positions[i].y, type, {
                fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
            }).setOrigin(0.5);
            
            this.container.add([card, text]);
        });
    }
    
    selectPowerUp(type) {
        this.powerUps[type]++;
        
        const config = LEGACY_POWER_UPS[type];
        const value = config.base * (1 + (this.powerUps[type] - 1) * 0.5);
        config.apply(this.scene.player, value);
        
        this.scene.tweens.add({
            targets: [this.overlay, this.title, this.container],
            alpha: 0, duration: 300,
            onComplete: () => {
                [this.overlay, this.title, this.container].forEach(el => el?.destroy());
                this.resumeGame();
                this.handlePending();
            }
        });
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
            this.scene.time.delayedCall(500, () => this.showPowerUpSelection());
        }
    }
    
    getSkillLevel(skillKey) { return this.skillUpgradeManager?.getSkillLevel(skillKey) || 0; }
    getSkillInfo(skillKey) { return this.skillUpgradeManager?.getSkillInfo(skillKey) || null; }
    getPlayerLevel() { return this.skillUpgradeManager?.getPlayerLevel() || 1; }
    getSaveData() { return this.skillUpgradeManager?.getSaveData() || {}; }
    loadSaveData(data) { this.skillUpgradeManager?.loadSaveData(data); }
    
    shutdown() {
        this.skillUpgradeManager?.shutdown();
        [this.overlay, this.title, this.container].forEach(el => el?.destroy());
        if (this.originalUpdate) this.scene.update = this.originalUpdate;
    }
}
