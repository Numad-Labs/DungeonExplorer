import GameManager from "./GameManager";
import MobManager from "./MobManager";
import ExpOrb from "../prefabs/ExpOrb";
import GoldPrefab from "../prefabs/GoldPrefab";

export default class GameplayManager {
  constructor(scene) {
    this.scene = scene;
    this.gameManager = GameManager.get();
    this.player = null;
    this.mobManager = new MobManager(scene);
    this.expOrbs = null;
    this.goldOrbs = null;
    this.enemies = null;
    this.timers = {};
  }

  initialize(player) {
    this.player = player;
    this.mobManager.initialize(this.gameManager, player);
    this.expOrbs = this.scene.add.group();
    this.goldOrbs = this.scene.add.group();
    this.enemies = this.mobManager.mobGroup;
    this.scene.enemies = this.enemies;

    this.createTextures();
    this.setupCollisions();
    this.setupTimers();
    this.setupControls();
    this.setupSceneMethods();
  }

  createTextures() {
    const mobTextures = [
      "zombierun",
      "Zombie2RunAni",
      "Police run",
      "Dagger Bandit-Run",
      "assassinTank",
      "assassinArcher",
    ];

    mobTextures.forEach((textureName) => {
      if (!this.scene.textures.exists(textureName)) {
        this.createMobTexture(textureName);
      }
    });

    this.createOrbTextures();
    this.createVFXTextures();
  }

  createOrbTextures() {
    if (!this.scene.textures.exists("Exp")) {
      const graphics = this.scene.add.graphics();
      graphics.fillGradientStyle(0x00ffff, 0x00ffff, 0x0088ff, 0x0088ff, 1);
      graphics.fillCircle(8, 8, 7);
      graphics.fillStyle(0x88ffff, 0.6);
      graphics.fillCircle(8, 8, 5);
      graphics.fillStyle(0xffffff, 0.8);
      graphics.fillCircle(8, 8, 2);
      graphics.lineStyle(1, 0xffffff, 1);
      graphics.strokeCircle(8, 8, 7);
      graphics.generateTexture("Exp", 16, 16);
      graphics.destroy();
    }

    if (!this.scene.textures.exists("Gold")) {
      const graphics = this.scene.add.graphics();
      graphics.fillGradientStyle(0xffd700, 0xffd700, 0xffa500, 0xffa500, 1);
      graphics.fillCircle(10, 10, 9);
      graphics.fillStyle(0xffff88, 0.7);
      graphics.fillCircle(10, 10, 6);
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillCircle(10, 10, 3);
      graphics.lineStyle(2, 0xffe55c, 1);
      graphics.strokeCircle(10, 10, 9);
      graphics.lineStyle(1, 0xfff68f, 0.8);
      graphics.strokeCircle(10, 10, 10);
      graphics.generateTexture("Gold", 20, 20);
      graphics.destroy();
    }
  }

  createVFXTextures() {
    const vfxTextures = [
      { name: "AOE_Fire_Ball_Projectile_VFX_V01", color: 0xff4400, size: 16 },
      {
        name: "AOE_Fire_Blast_Attack_VFX_V01",
        color: 0xff6600,
        size: 24,
        alpha: 0.8,
      },
      { name: "AOE_Ice_Shard_Projectile_VFX_V01", color: 0x00aaff, size: 12 },
    ];

    vfxTextures.forEach(({ name, color, size, alpha = 1 }) => {
      if (!this.scene.textures.exists(name)) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(size, size, size);
        graphics.generateTexture(name, size * 2, size * 2);
        graphics.destroy();
      }
    });
  }

  createMobTexture(textureName) {
    const colorMap = {
      Police: 0x333366,
      Dagger: 0x663333,
      assassin: 0x663333,
      Tank: 0x444444,
      Archer: 0x664433,
      Zombie2: 0x553355,
    };

    const color = Object.keys(colorMap).find((key) => textureName.includes(key))
      ? colorMap[Object.keys(colorMap).find((key) => textureName.includes(key))]
      : 0x336633;

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(8, 8, 16, 16);
    graphics.fillRect(4, 12, 4, 8);
    graphics.fillRect(24, 12, 4, 8);
    graphics.generateTexture(textureName, 32, 32);
    graphics.destroy();
  }

  setupCollisions() {
    if (!this.player) return;

    this.scene.physics.add.overlap(
      this.player,
      this.enemies,
      (player, enemy) => {
        if (enemy.attackPlayer) enemy.attackPlayer(player);
      }
    );

    this.scene.physics.add.overlap(
      this.player,
      this.goldOrbs,
      (player, goldOrb) => {
        this.collectGoldOrb(goldOrb);
      }
    );
  }

  setupTimers() {
    this.timers.orbSpawn = this.scene.time.addEvent({
      delay: 1000,
      callback: () => this.spawnRandomExperienceOrb(),
      loop: true,
    });

    this.timers.goldSpawn = this.scene.time.addEvent({
      delay: 2000,
      callback: () => this.spawnRandomGoldOrb(),
      loop: true,
    });

    this.timers.difficulty = this.scene.time.addEvent({
      delay: 1000,
      callback: () => this.gameManager.updateDifficulty(1000),
      loop: true,
    });

    Object.assign(this.scene, {
      enemySpawnTimer: this.mobManager.spawnTimer,
      orbSpawnTimer: this.timers.orbSpawn,
      goldSpawnTimer: this.timers.goldSpawn,
      difficultyTimer: this.timers.difficulty,
    });
  }

  setupSceneMethods() {
    this.scene.spawnExperienceOrb = (x, y, value) =>
      this.spawnExperienceOrb(x, y, value);
    this.scene.spawnGoldOrb = (x, y, value) => this.spawnGoldOrb(x, y, value);
  }

  spawnExperienceOrb(x, y, value = 1) {
    try {
      if (ExpOrb) {
        const expOrb = new ExpOrb(this.scene, x, y);
        this.scene.add.existing(expOrb);
        this.expOrbs.add(expOrb);
        expOrb.setExpValue(value);
        expOrb.setDepth(12);
        return expOrb;
      }
    } catch (error) {
      console.warn("ExpOrb class not available, using fallback");
    }

    return this.createFallbackOrb(x, y, value);
  }

  spawnGoldOrb(x, y, value = 1) {
    try {
      if (GoldPrefab) {
        const goldOrb = new GoldPrefab(this.scene, x, y);
        this.scene.add.existing(goldOrb);
        this.goldOrbs.add(goldOrb);
        goldOrb.setGoldValue(value);
        goldOrb.setDepth(12);
        return goldOrb;
      }
    } catch (error) {
      console.warn("GoldPrefab class not available, using fallback");
    }

    return this.createFallbackGoldOrb(x, y, value);
  }

  createFallbackOrb(x, y, value) {
    const orb = this.scene.add.circle(x, y, 6, 0x00ffff);
    orb.expValue = value || 5;
    this.scene.physics.add.existing(orb);
    orb.body.setCircle(6);
    orb.setDepth(12);
    this.expOrbs.add(orb);

    this.scene.physics.add.overlap(this.player, orb, (player, orb) => {
      this.collectExperienceOrb(orb);
    });

    this.setupOrbMovement(orb);
    this.scene.time.delayedCall(30000, () => orb?.active && orb.destroy());
    return orb;
  }

  createFallbackGoldOrb(x, y, value) {
    const goldOrb = this.scene.add.circle(x, y, 8, 0xffd700);
    goldOrb.goldValue = value || 1;
    this.scene.physics.add.existing(goldOrb);
    goldOrb.body.setCircle(8);
    goldOrb.setDepth(12);
    this.goldOrbs.add(goldOrb);

    this.scene.physics.add.overlap(this.player, goldOrb, (player, goldOrb) => {
      this.collectGoldOrb(goldOrb);
    });

    this.setupGoldOrbMovement(goldOrb);
    this.scene.time.delayedCall(
      45000,
      () => goldOrb?.active && goldOrb.destroy()
    );
    return goldOrb;
  }

  setupOrbMovement(orb, isGold = false) {
    const moveToPlayer = () => {
      if (!this.player || this.player.isDead || !orb.body) return;

      const distance = Phaser.Math.Distance.Between(
        orb.x,
        orb.y,
        this.player.x,
        this.player.y
      );
      const pickupRange = (this.player.pickupRange || 50) + (isGold ? 20 : 0);

      if (distance < pickupRange) {
        const angle = Phaser.Math.Angle.Between(
          orb.x,
          orb.y,
          this.player.x,
          this.player.y
        );
        const speed = isGold ? 180 : 200;
        orb.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
    };

    const updateEvent = this.scene.time.addEvent({
      delay: 50,
      callback: moveToPlayer,
      repeat: -1,
    });

    orb.on("destroy", () => updateEvent.destroy());
  }

  setupGoldOrbMovement(goldOrb) {
    this.setupOrbMovement(goldOrb, true);
  }

  spawnRandomExperienceOrb() {
    if (!this.player) return;
    const { x, y } = this.getRandomSpawnPosition();
    const value = this.getRandomOrbValue([1, 2, 5, 10], [0.5, 0.8, 0.95, 1]);
    return this.spawnExperienceOrb(x, y, value);
  }

  spawnRandomGoldOrb() {
    if (!this.player) return;
    const { x, y } = this.getRandomSpawnPosition(250, 600);
    const value = this.getRandomOrbValue(
      [1, 2, 5, 10, 20],
      [0.4, 0.7, 0.9, 0.98, 1]
    );
    return this.spawnGoldOrb(x, y, value);
  }

  getRandomSpawnPosition(minDist = 200, maxDist = 800) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Phaser.Math.Between(minDist, maxDist);
    return {
      x: this.player.x + Math.cos(angle) * distance,
      y: this.player.y + Math.sin(angle) * distance,
    };
  }

  getRandomOrbValue(values, thresholds) {
    const roll = Math.random();
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (roll > thresholds[i])
        return values[i + 1] || values[values.length - 1];
    }
    return values[0];
  }

  collectExperienceOrb(orb) {
    try {
      const expValue = orb.expValue || 5;
      if (this.gameManager) this.gameManager.addExperience(expValue);

      this.createFloatingText(orb.x, orb.y - 20, `+${expValue} XP`, "#88ff88");
      orb.destroy();
    } catch (error) {
      console.error("Error collecting experience orb:", error);
    }
  }

  collectGoldOrb(goldOrb) {
    try {
      const goldValue = goldOrb.goldValue || 1;
      if (this.gameManager) this.gameManager.addGold(goldValue);

      this.createFloatingText(
        goldOrb.x,
        goldOrb.y - 20,
        `+${goldValue} Gold`,
        "#FFD700"
      );
      goldOrb.destroy();
    } catch (error) {
      console.error("Error collecting gold orb:", error);
    }
  }

  createFloatingText(x, y, text, color) {
    const floatingText = this.scene.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "14px",
      color: color,
      stroke: "#000000",
      strokeThickness: 1,
      fontWeight: color === "#FFD700" ? "bold" : "normal",
    });
    floatingText.setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatingText,
      y: y - 30,
      alpha: 0,
      duration: color === "#FFD700" ? 1200 : 1000,
      onComplete: () => floatingText.destroy(),
    });
  }

  spawnEnemy(x, y, enemyType = "zombie") {
    return this.mobManager.spawnMob(enemyType, x, y);
  }

  spawnRandomEnemy() {
    return this.mobManager.spawnRandomMob();
  }

  spawnWave() {
    const waveNumber = (this.scene.currentWave || 0) + 1;
    this.scene.currentWave = waveNumber;
    this.mobManager.startWave(waveNumber);
  }

  setupControls() {
    const keyboard = this.scene.input.keyboard;

    const controls = {
      "keydown-Z": () => this.spawnEnemyAtCursor("zombie"),
      "keydown-X": () => this.spawnEnemyAtCursor("zombie2"),
      "keydown-C": () => this.spawnEnemyAtCursor("assassinArcher"),
      "keydown-V": () => this.spawnEnemyAtCursor("policeDroid"),
      "keydown-B": () => this.spawnEnemyAtCursor("assassin"),
      "keydown-N": () => this.spawnEnemyAtCursor("assassinTank"),
      "keydown-M": () => this.spawnEnemyAtCursor("assassinArcher"),
      "keydown-E": () => this.spawnOrbAtCursor("exp", 1),
      "keydown-G": () => this.spawnOrbAtCursor("gold", 5),
      "keydown-K": () => this.mobManager.killAllMobs(),
      "keydown-O": () => this.spawnMultipleOrbs("exp", 10),
      "keydown-P": () => this.spawnMultipleOrbs("gold", 10),
      "keydown-[": () => this.spawnWave(),
      "keydown-L": () =>
        console.log("Mob Statistics:", this.mobManager.getStatistics()),
    };

    keyboard.on("keydown-Z", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnEnemy(world.x, world.y, "zombie");
    });

    keyboard.on("keydown-X", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnEnemy(world.x, world.y, "bigDude");
    });

    keyboard.on("keydown-C", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnEnemy(world.x, world.y, "assassinArcher");
    });

    keyboard.on("keydown-V", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnEnemy(world.x, world.y, "policeDroid");
    });

    keyboard.on("keydown-B", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnEnemy(world.x, world.y, "assassin");
    });

    keyboard.on("keydown-N", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnEnemy(world.x, world.y, "assassinTank");
    });

    keyboard.on("keydown-M", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnEnemy(world.x, world.y, "assassinArcher");
    });

    keyboard.on("keydown-E", () => {
      const pointer = this.scene.input.activePointer;
      const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.spawnExperienceOrb(world.x, world.y, 1);
    });
  }

  spawnEnemyAtCursor(enemyType) {
    const world = this.scene.cameras.main.getWorldPoint(
      this.scene.input.activePointer.x,
      this.scene.input.activePointer.y
    );
    this.spawnEnemy(world.x, world.y, enemyType);
  }

  spawnOrbAtCursor(type, value) {
    const world = this.scene.cameras.main.getWorldPoint(
      this.scene.input.activePointer.x,
      this.scene.input.activePointer.y
    );
    if (type === "exp") {
      this.spawnExperienceOrb(world.x, world.y, value);
    } else {
      this.spawnGoldOrb(world.x, world.y, value);
    }
  }

  spawnMultipleOrbs(type, count) {
    for (let i = 0; i < count; i++) {
      if (type === "exp") {
        this.spawnRandomExperienceOrb();
      } else {
        this.spawnRandomGoldOrb();
      }
    }
  }

  checkEnemyBounds() {
    if (!this.player) return;
    const maxDistance = 600;
    this.mobManager.getAllActiveMobs().forEach((mob) => {
      if (!mob.active) return;
      const distance = Phaser.Math.Distance.Between(
        mob.x,
        mob.y,
        this.player.x,
        this.player.y
      );
      if (distance > maxDistance) {
        this.teleportMobToPlayer(mob);
      }
    });
  }

  checkOrbBounds() {
    if (!this.player) return;
    const maxDistance = 2000;

    [this.expOrbs, this.goldOrbs].forEach((orbGroup) => {
      if (!orbGroup) return;
      orbGroup.getChildren().forEach((orb) => {
        if (!orb.active) return;
        const distance = Phaser.Math.Distance.Between(
          orb.x,
          orb.y,
          this.player.x,
          this.player.y
        );
        if (distance > maxDistance) orb.destroy();
      });
    });
  }

  teleportMobToPlayer(mob) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Phaser.Math.Between(300, 500);

    mob.x = this.player.x + Math.cos(angle) * distance;
    mob.y = this.player.y + Math.sin(angle) * distance;

    if (mob.body) mob.body.velocity.setTo(0, 0);

    const circle = this.scene.add.circle(mob.x, mob.y, 30, 0x33ff33, 0.7);
    circle.setDepth(20);
    this.scene.tweens.add({
      targets: circle,
      scale: 0,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy(),
    });
  }

  getEnemyCount() {
    return this.mobManager.getActiveMobCount();
  }
  getEnemiesByType(type) {
    return this.mobManager.getMobsByType(type);
  }
  getAllEnemies() {
    return this.mobManager.getAllActiveMobs();
  }
  getStatistics() {
    return this.mobManager.getStatistics();
  }

  update(time, delta) {
    this.mobManager.update(time, delta);
    this.checkEnemyBounds();
    this.checkOrbBounds();

    [this.expOrbs, this.goldOrbs].forEach((orbGroup) => {
      if (!orbGroup) return;
      orbGroup.getChildren().forEach((orb) => {
        if (orb.depth < 10) orb.setDepth(12);
      });
    });
  }

  shutdown() {
    Object.values(this.timers).forEach((timer) => timer?.remove());
    this.mobManager.shutdown();

    [this.expOrbs, this.goldOrbs].forEach((group) => {
      if (group) group.clear(true, true);
    });

    if (this.scene.input?.keyboard) {
      const events = [
        "keydown-E",
        "keydown-G",
        "keydown-Z",
        "keydown-V",
        "keydown-X",
        "keydown-B",
        "keydown-N",
        "keydown-M",
        "keydown-K",
        "keydown-O",
        "keydown-P",
        "keydown-W",
        "keydown-L",
        "keydown-C",
        "keydown-[",
      ];
      events.forEach((event) =>
        this.scene.input.keyboard.removeAllListeners(event)
      );
    }
  }
}
