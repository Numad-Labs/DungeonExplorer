import GameConfig from "../config/GameConfig.js";

export class EffectUtils {
  /**
   * Create a fade in/out effect for a game object
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.GameObjects.GameObject} target - Target object
   * @param {object} options - Effect options
   * @returns {Phaser.Tweens.Tween} The tween object
   */
  static createFadeEffect(scene, target, options = {}) {
    const defaults = {
      duration: 500,
      from: 0,
      to: 1,
      yoyo: false,
      repeat: 0,
      ease: 'Power2',
      onComplete: null
    };
    const config = { ...defaults, ...options };

    return scene.tweens.add({
      targets: target,
      alpha: { from: config.from, to: config.to },
      duration: config.duration,
      yoyo: config.yoyo,
      repeat: config.repeat,
      ease: config.ease,
      onComplete: config.onComplete
    });
  }

  /**
   * Create a pulse effect for emphasis
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.GameObjects.GameObject} target - Target object
   * @param {object} options - Effect options
   * @returns {Phaser.Tweens.Tween} The tween object
   */
  static createPulseEffect(scene, target, options = {}) {
    const defaults = {
      scale: 1.2,
      duration: 200,
      repeat: 1,
      yoyo: true,
      ease: 'Power2'
    };
    const config = { ...defaults, ...options };

    return scene.tweens.add({
      targets: target,
      scale: config.scale,
      duration: config.duration,
      yoyo: config.yoyo,
      repeat: config.repeat,
      ease: config.ease
    });
  }

  /**
   * Create a shake effect
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.GameObjects.GameObject} target - Target object
   * @param {object} options - Effect options
   * @returns {Phaser.Tweens.Timeline} The timeline object
   */
  static createShakeEffect(scene, target, options = {}) {
    const defaults = {
      intensity: 5,
      duration: 300,
      frequency: 50
    };
    const config = { ...defaults, ...options };

    const originalX = target.x;
    const originalY = target.y;
    const timeline = scene.tweens.createTimeline();

    const shakeCount = Math.floor(config.duration / config.frequency);
    
    for (let i = 0; i < shakeCount; i++) {
      timeline.add({
        targets: target,
        x: originalX + (Math.random() - 0.5) * config.intensity * 2,
        y: originalY + (Math.random() - 0.5) * config.intensity * 2,
        duration: config.frequency,
        ease: 'Power2'
      });
    }

    timeline.add({
      targets: target,
      x: originalX,
      y: originalY,
      duration: config.frequency,
      ease: 'Power2'
    });

    timeline.play();
    return timeline;
  }

  /**
   * Create a floating text effect (damage numbers, etc.)
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} text - Text to display
   * @param {object} options - Effect options
   * @returns {Phaser.GameObjects.Text} The text object
   */
  static createFloatingText(scene, x, y, text, options = {}) {
    const defaults = {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      duration: 1000,
      distance: 50,
      fadeOut: true
    };
    const config = { ...defaults, ...options };

    const textObj = scene.add.text(x, y, text, {
      fontSize: config.fontSize,
      color: config.color,
      stroke: config.stroke,
      strokeThickness: config.strokeThickness,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    textObj.setDepth(1000);

    scene.tweens.add({
      targets: textObj,
      y: y - config.distance,
      alpha: config.fadeOut ? 0 : 1,
      duration: config.duration,
      ease: 'Power2',
      onComplete: () => textObj.destroy()
    });

    return textObj;
  }

  /**
   * Create a screen flash effect
   * @param {Phaser.Scene} scene - The scene
   * @param {object} options - Effect options
   * @returns {Phaser.GameObjects.Rectangle} The flash rectangle
   */
  static createScreenFlash(scene, options = {}) {
    const defaults = {
      color: 0xffffff,
      alpha: 0.5,
      duration: 200
    };
    const config = { ...defaults, ...options };

    const flash = scene.add.rectangle(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      config.color,
      config.alpha
    );
    
    flash.setScrollFactor(0);
    flash.setDepth(2000);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: config.duration,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    return flash;
  }

  /**
   * Create a teleport effect
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {object} options - Effect options
   * @returns {object} Effect objects
   */
  static createTeleportEffect(scene, x, y, options = {}) {
    const defaults = {
      radius: 30,
      color: 0x00ff00,
      duration: 500,
      particles: true
    };
    const config = { ...defaults, ...options };

    const circle = scene.add.circle(x, y, config.radius, config.color, 0.7);
    circle.setDepth(100);

    const tween = scene.tweens.add({
      targets: circle,
      scale: { from: 0.5, to: 2 },
      alpha: { from: 0.7, to: 0 },
      duration: config.duration,
      ease: 'Power2',
      onComplete: () => circle.destroy()
    });

    let particles = null;
    return { circle, tween, particles };
  }

  /**
   * Create a damage flash effect on a target
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.GameObjects.GameObject} target - Target object
   * @param {object} options - Effect options
   */
  static createDamageFlash(scene, target, options = {}) {
    const defaults = {
      color: GameConfig.UI.HEALTH_BAR.DAMAGE_TINT,
      duration: GameConfig.UI.HEALTH_BAR.EFFECT_DURATION
    };
    const config = { ...defaults, ...options };

    if (target?.setTint) {
      const originalTint = target.tintTopLeft || 0xffffff;
      target.setTint(config.color);
      
      scene.time.delayedCall(config.duration, () => {
        if (target?.active) {
          if (originalTint === 0xffffff) {
            target.clearTint();
          } else {
            target.setTint(originalTint);
          }
        }
      });
    }
  }

  /**
   * Create a heal flash effect on a target
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.GameObjects.GameObject} target - Target object
   * @param {object} options - Effect options
   */
  static createHealFlash(scene, target, options = {}) {
    const defaults = {
      color: GameConfig.UI.HEALTH_BAR.HEAL_TINT,
      duration: GameConfig.UI.HEALTH_BAR.EFFECT_DURATION
    };
    const config = { ...defaults, ...options };

    if (target?.setTint) {
      const originalTint = target.tintTopLeft || 0xffffff;
      target.setTint(config.color);
      
      scene.time.delayedCall(config.duration, () => {
        if (target?.active) {
          if (originalTint === 0xffffff) {
            target.clearTint();
          } else {
            target.setTint(originalTint);
          }
        }
      });
    }
  }

  /**
   * Create a circular explosion effect
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {object} options - Effect options
   * @returns {Phaser.GameObjects.Graphics} The graphics object
   */
  static createExplosionEffect(scene, x, y, options = {}) {
    const defaults = {
      radius: 50,
      color: 0xff4400,
      duration: 400,
      rings: 3
    };
    const config = { ...defaults, ...options };

    const graphics = scene.add.graphics();
    graphics.setDepth(150);

    for (let i = 0; i < config.rings; i++) {
      const delay = i * 100;
      const ringRadius = config.radius * (0.5 + i * 0.3);
      
      scene.time.delayedCall(delay, () => {
        graphics.clear();
        graphics.lineStyle(4, config.color, 0.8);
        graphics.strokeCircle(x, y, ringRadius);
        
        scene.tweens.add({
          targets: graphics,
          alpha: 0,
          duration: config.duration - delay,
          ease: 'Power2'
        });
      });
    }

    scene.time.delayedCall(config.duration, () => graphics.destroy());
    return graphics;
  }




}

export default EffectUtils;