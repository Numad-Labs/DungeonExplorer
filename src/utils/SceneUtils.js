import GameConfig from "../config/GameConfig.js";

export class SceneUtils {
  /**
   * Set up world bounds for a scene using config values
   * @param {Phaser.Scene} scene - The scene to configure
   */
  static setupWorldBounds(scene) {
    const { WIDTH, HEIGHT } = GameConfig.WORLD;
    scene.cameras.main.setBounds(0, 0, WIDTH, HEIGHT);
    scene.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
  }

  /**
   * Setup camera to follow a target with smooth movement
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.GameObjects.GameObject} target - Target to follow
   * @param {number} lerpX - Horizontal lerp amount (0-1)
   * @param {number} lerpY - Vertical lerp amount (0-1)
   */
  static setupCameraFollow(scene, target, lerpX = 0.1, lerpY = 0.1) {
    if (target?.active && !target.isDead && scene.cameras?.main) {
      scene.cameras.main.startFollow(target, true, lerpX, lerpY);
    }
  }

  /**
   * Safely transition to another scene
   * @param {Phaser.Scene} currentScene - Current scene
   * @param {string} targetScene - Target scene key
   * @param {string} fallbackScene - Fallback scene if target doesn't exist
   */
  static safeSceneTransition(currentScene, targetScene, fallbackScene = "MainMapScene") {
    if (!currentScene.scene?.isActive()) return false;

    try {
      if (currentScene.scene.manager?.keys?.[targetScene]) {
        currentScene.scene.start(targetScene);
        return true;
      } else {
        console.warn(`Scene ${targetScene} not found, using fallback: ${fallbackScene}`);
        currentScene.scene.start(fallbackScene);
        return false;
      }
    } catch (error) {
      console.error("Scene transition failed:", error);
      return false;
    }
  }

  /**
   * Create a container with common settings
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} depth - Depth level
   * @returns {Phaser.GameObjects.Container}
   */
  static createUIContainer(scene, x = 0, y = 0, depth = 1000) {
    const container = scene.add.container(x, y);
    container.setScrollFactor(0).setDepth(depth);
    return container;
  }

  /**
   * Clean up timers safely
   * @param {object} context - Object containing timers
   * @param {string[]} timerNames - Array of timer property names
   */
  static cleanupTimers(context, timerNames) {
    timerNames.forEach(timerName => {
      if (context[timerName] && !context[timerName].hasDispatched) {
        context[timerName].destroy();
        context[timerName] = null;
      }
    });
  }

  /**
   * Clean up physics groups safely
   * @param {object} context - Object containing groups
   * @param {string[]} groupNames - Array of group property names
   */
  static cleanupPhysicsGroups(context, groupNames) {
    groupNames.forEach(groupName => {
      if (context[groupName]) {
        if (typeof context[groupName].clear === 'function') {
          context[groupName].clear(true, true);
        }
        context[groupName] = null;
      }
    });
  }

  /**
   * Setup collision between player and tilemap layers
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.GameObjects.GameObject} player - Player object
   * @param {Phaser.Tilemaps.TilemapLayer[]} layers - Array of tilemap layers
   */
  static setupTilemapCollisions(scene, player, layers) {
    if (!player) return;

    layers.forEach(layer => {
      if (layer) {
        scene.physics.add.collider(player, layer);
        layer.setCollisionBetween(0, 10000);
      }
    });
  }

  /**
   * Create a text object with common styling
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} text - Text content
   * @param {object} customStyle - Custom style overrides
   * @returns {Phaser.GameObjects.Text}
   */
  static createStyledText(scene, x, y, text, customStyle = {}) {
    const defaultStyle = GameConfig.UI.STATS_DISPLAY.TEXT_STYLE;
    const style = { ...defaultStyle, ...customStyle };
    return scene.add.text(x, y, text, style);
  }

  /**
   * Create a background rectangle with common styling
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {object} customStyle - Custom style overrides
   * @returns {Phaser.GameObjects.Rectangle}
   */
  static createStyledBackground(scene, x, y, width, height, customStyle = {}) {
    const defaultStyle = {
      color: 0x000000,
      alpha: 0.7,
      strokeColor: 0xffffff,
      strokeWidth: 2
    };
    const style = { ...defaultStyle, ...customStyle };
    
    const bg = scene.add.rectangle(x, y, width, height, style.color, style.alpha);
    if (style.strokeColor !== undefined) {
      bg.setStrokeStyle(style.strokeWidth, style.strokeColor);
    }
    return bg;
  }

  /**
   * Setup debug controls for a scene
   * @param {Phaser.Scene} scene - The scene
   * @param {object} callbacks - Object with callback functions for debug actions
   */
  static setupDebugControls(scene, callbacks = {}) {
    if (!GameConfig.DEBUG.ENABLED) return;

    const controls = GameConfig.DEBUG.CONTROLS;
    
    Object.entries(controls).forEach(([action, key]) => {
      const callbackName = action.toLowerCase().replace('_', '');
      if (callbacks[callbackName]) {
        scene.input.keyboard.on(`keydown-${key}`, callbacks[callbackName]);
      }
    });
  }

  /**
   * Create a loading indicator
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {object} Loading indicator with update method
   */
  static createLoadingIndicator(scene, x, y) {
    const container = scene.add.container(x, y);
    const background = scene.add.circle(0, 0, 20, 0x000000, 0.8);
    const spinner = scene.add.circle(0, 0, 15, 0xffffff, 0.3);
    
    container.add([background, spinner]);
    container.setDepth(2000);
    
    const tween = scene.tweens.add({
      targets: spinner,
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });

    return {
      container,
      show: () => container.setVisible(true),
      hide: () => container.setVisible(false),
      destroy: () => {
        tween.destroy();
        container.destroy();
      }
    };
  }

  /**
   * Create a notification popup
   * @param {Phaser.Scene} scene - The scene
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   * @param {object} style - Style options
   */
  static showNotification(scene, message, duration = 2000, style = {}) {
    const defaultStyle = {
      x: scene.cameras.main.centerX,
      y: scene.cameras.main.centerY - 100,
      backgroundColor: 0x000000,
      textColor: '#ffffff',
      padding: 10
    };
    const finalStyle = { ...defaultStyle, ...style };

    const container = scene.add.container(finalStyle.x, finalStyle.y);
    container.setScrollFactor(0).setDepth(1500);

    const background = scene.add.rectangle(0, 0, 200, 50, finalStyle.backgroundColor, 0.8);
    const text = scene.add.text(0, 0, message, {
      fontSize: '14px',
      color: finalStyle.textColor,
      align: 'center'
    }).setOrigin(0.5);

    container.add([background, text]);

    // Animate in
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      alpha: 1,
      y: finalStyle.y - 20,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Animate out and destroy
    scene.time.delayedCall(duration, () => {
      scene.tweens.add({
        targets: container,
        alpha: 0,
        y: finalStyle.y - 40,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => container.destroy()
      });
    });

    return container;
  }
}

export default SceneUtils;