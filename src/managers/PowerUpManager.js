import PowerUpSelection from "../prefabs/PowerUpSelection";

const POWER_UPS = {
    speed: { base: 20, color: 0x00ff00, apply: (p, v) => p.moveSpeed *= (1 + v/100) },
    damage: { base: 15, color: 0xff0000, apply: (p, v) => { p.damage *= (1 + v/100); p.scene.playerAttackSystem?.updateStats(); }},
    health: { base: 10, color: 0x0000ff, apply: (p, v) => { p.maxHealth += 50; p.health += 50; }},
    fireRate: { base: 10, color: 0xffff00, apply: (p, v) => { p.fireRate *= (1 + v/100); p.scene.playerAttackSystem?.updateStats(); }},
    range: { base: 15, color: 0x00ffff, apply: (p, v) => { p.attackRange *= (1 + v/100); p.scene.playerAttackSystem?.updateStats(); }},
    magnet: { base: 20, color: 0xff00ff, apply: (p, v) => p.pickupRange *= (1 + v/100) }
};

const ICONS = {
    speed: (g) => { g.fillTriangle(20,15,32,30,25,32); g.fillTriangle(25,32,44,50,32,30); },
    damage: (g) => { g.fillRect(20,20,24,4); g.fillTriangle(44,20,44,24,52,22); },
    health: (g) => { g.fillRect(22,30,20,4); g.fillRect(30,22,4,20); },
    fireRate: (g) => g.fillTriangle(25,45,32,15,39,45),
    range: (g) => { g.lineStyle(3,0xffffff,1); g.strokeCircle(32,32,15); g.fillCircle(32,32,5); },
    magnet: (g) => { g.fillRect(22,20,7,24); g.fillRect(35,20,7,24); g.fillRect(22,20,20,7); }
};

export default class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.powerUps = Object.keys(POWER_UPS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        this.isActive = false;
        this.pendingLevelUps = 0;
        this.storedState = { timers: [], entities: [] };
        scene.powerUpManager = this;
    }
    
    initialize() {
        this.createTextures();
        console.log("PowerUpManager initialized:", this.powerUps);
    }
    
    createTextures() {
        // Card texture
        if (!this.scene.textures.exists('blank cards7')) {
            const g = this.scene.add.graphics();
            g.fillStyle(0x333333, 1).fillRoundedRect(0, 0, 200, 300, 16);
            g.lineStyle(4, 0xffffff, 1).strokeRoundedRect(0, 0, 200, 300, 16);
            g.generateTexture('blank cards7', 200, 300);
            g.destroy();
        }
        
        // Power-up icons
        Object.entries(POWER_UPS).forEach(([type, config]) => {
            const iconName = `${type}_icon`;
            if (this.scene.textures.exists(iconName)) return;
            
            const g = this.scene.add.graphics();
            g.fillStyle(config.color, 1).fillCircle(32, 32, 32);
            g.fillStyle(0xffffff, 1);
            ICONS[type](g);
            g.generateTexture(iconName, 64, 64);
            g.destroy();
        });
    }
    
    showPowerUpSelection() {
        if (this.isActive) {
            this.pendingLevelUps++;
            return;
        }
        
        this.isActive = true;
        this.pauseGame();
        this.createUI();
    }
    
    pauseGame() {
        // Store and pause timers
        ['enemySpawnTimer', 'orbSpawnTimer', 'difficultyTimer'].forEach(timer => {
            if (this.scene[timer]) {
                this.storedState.timers.push({ name: timer, paused: this.scene[timer].paused });
                this.scene[timer].paused = true;
            }
        });
        
        // Store and pause entities
        [this.scene.player, ...(this.scene.enemies?.getChildren() || [])].forEach(entity => {
            if (entity?.body) {
                this.storedState.entities.push({
                    entity,
                    vx: entity.body.velocity.x,
                    vy: entity.body.velocity.y,
                    enabled: entity.body.enable
                });
                entity.body.velocity.setTo(0, 0);
                entity.body.enable = false;
            }
        });
        
        // Pause game loop
        this.originalUpdate = this.scene.update;
        this.scene.update = () => {};
    }
    
    createUI() {
        const cam = this.scene.cameras.main;
        
        // Overlay
        this.overlay = this.scene.add.rectangle(cam.width/2, cam.height/2, cam.width, cam.height, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(1000);
        
        // Title
        this.title = this.scene.add.text(cam.width/2, 100, "LEVEL UP! Choose a Power-Up", {
            fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Cards
        this.container = this.scene.add.container(0, 0).setDepth(1001).setScrollFactor(0);
        
        const options = Object.keys(POWER_UPS).sort(() => 0.5 - Math.random()).slice(0, 3);
        const positions = [-220, 0, 220].map(x => ({ x: cam.width/2 + x, y: cam.height/2 }));
        
        options.forEach((type, i) => {
            const card = new PowerUpSelection(this.scene, positions[i].x, positions[i].y, type, this.powerUps[type] + 1);
            card.setScale(0.7).setScrollFactor(0).setDepth(1002);
            card.setOnSelectCallback(() => this.selectPowerUp(type));
            card.setInteractive({ useHandCursor: true });
            this.container.add(card);
        });
    }
    
    selectPowerUp(type) {
        this.powerUps[type]++;
        
        // Apply power-up
        const config = POWER_UPS[type];
        const value = config.base * (1 + (this.powerUps[type] - 1) * 0.5);
        config.apply(this.scene.player, value);
        
        // Show feedback
        this.showFeedback(type, value);
        
        // Cleanup and resume
        this.scene.tweens.add({
            targets: [this.overlay, this.title, this.container],
            alpha: 0,
            duration: 300,
            onComplete: () => {
                [this.overlay, this.title, this.container].forEach(el => el?.destroy());
                this.resumeGame();
                this.handlePending();
            }
        });
    }
    
    resumeGame() {
        // Restore timers
        this.storedState.timers.forEach(({ name, paused }) => {
            if (this.scene[name]) this.scene[name].paused = paused;
        });
        
        // Restore entities
        this.storedState.entities.forEach(({ entity, vx, vy, enabled }) => {
            if (entity?.body) {
                entity.body.velocity.setTo(vx, vy);
                entity.body.enable = enabled;
            }
        });
        
        // Restore update
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
    
    showFeedback(type, value) {
        const player = this.scene.player;
        if (!player) return;
        
        const message = type === 'health' ? 'Max Health +50' : 
            `${type.charAt(0).toUpperCase() + type.slice(1)} +${value.toFixed(0)}%`;
        
        const text = this.scene.add.text(player.x, player.y - 50, message, {
            fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', 
            stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: text,
            y: text.y - 100,
            alpha: 0,
            duration: 2000,
            onComplete: () => text.destroy()
        });
    }
    
    shutdown() {
        [this.overlay, this.title, this.container].forEach(el => el?.destroy());
        if (this.originalUpdate) this.scene.update = this.originalUpdate;
        console.log("PowerUpManager shut down");
    }
}