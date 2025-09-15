import { EventBus } from '../game/EventBus';

export default class PauseManager {
  static instance = null;

  constructor() {
    if (PauseManager.instance) return PauseManager.instance;
    PauseManager.instance = this;
    
    this.isPaused = false;
    this.pausedScenes = [];
    this.pausedTimers = [];
    this.pausedPhysics = [];
    this.pausedTweens = [];
    this.pausedAnimations = [];
    this.originalTimeScale = 1;
    this.skillSelectionActive = false;
    
    this.setupEventListeners();
  }

  static get() {
    return PauseManager.instance || new PauseManager();
  }

  setupEventListeners() {
    EventBus.on('pause-game', () => this.pauseGame());
    EventBus.on('resume-game', () => this.resumeGame());
    EventBus.on('game-paused', () => this.onGamePaused());
    EventBus.on('game-resumed', () => this.onGameResumed());
  }

  pauseGame() {
    if (this.isPaused) return;
    
    console.log('PauseManager: Pausing game');
    this.isPaused = true;
    
    // Get the current scene
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;

    this.pauseScene(currentScene);
    this.pausePhysics(currentScene);
    this.pauseTimers(currentScene);
    this.pauseTweens(currentScene);
    this.pauseAnimations(currentScene);
    this.pauseAudio(currentScene);
    this.pauseManagers(currentScene);
    
    this.originalTimeScale = currentScene.physics?.world?.timeScale || 1;
    if (currentScene.physics?.world) {
      currentScene.physics.world.timeScale = 0;
    }

    EventBus.emit('game-paused');
  }

  resumeGame() {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    
    const currentScene = this.getCurrentScene();
    if (!currentScene) return;

    this.resumeScene(currentScene);
    this.resumePhysics(currentScene);
    this.resumeTimers(currentScene);
    this.resumeTweens(currentScene);
    this.resumeAnimations(currentScene);
    this.resumeAudio(currentScene);
    this.resumeManagers(currentScene);
    
    if (currentScene.physics?.world) {
      currentScene.physics.world.timeScale = this.originalTimeScale;
    }

    EventBus.emit('game-resumed');
  }

  pauseScene(scene) {
    if (!scene) return;
    
    if (this.skillSelectionActive) {
      scene._wasPausedByPauseManager = true;
      this.pausedScenes.push(scene);
      return;
    }
    
    scene._wasPausedByPauseManager = true;
    this.pausedScenes.push(scene);
    scene.scene.pause();
  }

  resumeScene(scene) {
    if (!scene || !scene._wasPausedByPauseManager) return;
    
    scene._wasPausedByPauseManager = false;
    const index = this.pausedScenes.indexOf(scene);
    if (index > -1) {
      this.pausedScenes.splice(index, 1);
    }
    
    if (!this.skillSelectionActive) {
      scene.scene.resume();
    } else {
      console.log('PauseManager: Skipping scene resume - skill selection is active');
    }
  }

  pausePhysics(scene) {
    if (!scene.physics?.world) return;
    
    scene.physics.world.pause();
    this.pausedPhysics.push(scene.physics.world);
  }

  resumePhysics(scene) {
    if (!scene.physics?.world) return;
    
    scene.physics.world.resume();
    const index = this.pausedPhysics.indexOf(scene.physics.world);
    if (index > -1) {
      this.pausedPhysics.splice(index, 1);
    }
  }

  pauseTimers(scene) {
    if (!scene.time) return;
    
    const activeTimers = scene.time._active;
    activeTimers.forEach(timer => {
      if (timer.paused) return;
      timer.paused = true;
      timer._pausedByPauseManager = true;
      this.pausedTimers.push(timer);
    });
    this.pauseManagerTimers(scene);
  }

  resumeTimers(scene) {
    if (!scene.time) return;
    
    this.pausedTimers.forEach(timer => {
      if (timer._pausedByPauseManager) {
        timer.paused = false;
        timer._pausedByPauseManager = false;
      }
    });
    this.pausedTimers = [];
    
    this.resumeManagerTimers(scene);
  }

  pauseManagerTimers(scene) {
    const managers = [
      scene.gameplayManager,
      scene.mobManager,
      scene.powerUpManager
    ];
    
    managers.forEach(manager => {
      if (manager) {
        manager._isPausedByPauseManager = true;
      }
    });
    scene._wasPausedByPauseManager = true;
  }

  resumeManagerTimers(scene) {
    const managers = [
      scene.gameplayManager,
      scene.mobManager,
      scene.powerUpManager
    ];
    
    managers.forEach(manager => {
      if (manager) {
        manager._isPausedByPauseManager = false;
      }
    });
    
    scene._wasPausedByPauseManager = false;
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
          if (this.skillSelectionActive) {
            const target = tween.targets && tween.targets[0];
            if (target && (target.depth > 999 || target.name === 'skillCard' || target.name === 'skillUI')) {
              return;
            }
          }
          
          tween.pause();
          tween._pausedByPauseManager = true;
          this.pausedTweens.push(tween);
        }
      });
    } catch (error) {
      console.warn('PauseManager: Error pausing tweens:', error);
    }
  }

  resumeTweens(scene) {
    try {
      this.pausedTweens.forEach(tween => {
        if (tween._pausedByPauseManager && typeof tween.resume === 'function') {
          tween.resume();
          tween._pausedByPauseManager = false;
        }
      });
      this.pausedTweens = [];
    } catch (error) {
      console.warn('PauseManager: Error resuming tweens:', error);
      this.pausedTweens = [];
    }
  }

  pauseAnimations(scene) {
    if (!scene.anims && !scene.children) return;
    
    try {
      if (scene.children && scene.children.list) {
        scene.children.list.forEach(child => {
          if (this.skillSelectionActive && (child.depth > 999 || child.name === 'skillCard' || child.name === 'skillUI')) {
            return;
          }
          
          if (child.anims && child.anims.isPlaying && !child.anims.isPaused) {
            child.anims.pause();
            child._animPausedByPauseManager = true;
            this.pausedAnimations.push(child);
          }
        });
      }
    } catch (error) {
      console.warn('PauseManager: Error pausing animations:', error);
    }
  }

  resumeAnimations(scene) {
    try {
      this.pausedAnimations.forEach(sprite => {
        if (sprite._animPausedByPauseManager && sprite.anims) {
          sprite.anims.resume();
          sprite._animPausedByPauseManager = false;
        }
      });
      this.pausedAnimations = [];
    } catch (error) {
      console.warn('PauseManager: Error resuming animations:', error);
      this.pausedAnimations = [];
    }
  }

  pauseAudio(scene) {
    console.log('PauseManager: Skipping audio pause - audio continues during pause');
  }

  resumeAudio(scene) {
    console.log('PauseManager: Skipping audio resume - audio was never paused');
  }

  pauseManagers(scene) {
    const managers = [
      scene.gameplayManager,
      scene.mobManager,
      scene.powerUpManager,
      scene.gameManager
    ];
    
    managers.forEach(manager => {
      if (manager) {
        manager._isPausedByPauseManager = true;
      }
    });
  }

  resumeManagers(scene) {
    const managers = [
      scene.gameplayManager,
      scene.mobManager,
      scene.powerUpManager,
      scene.gameManager
    ];
    
    managers.forEach(manager => {
      if (manager) {
        manager._isPausedByPauseManager = false;
      }
    });
  }

  getCurrentScene() {
    if (window.currentGameScene) {
      return window.currentGameScene;
    }
    
    if (window.gameManager && window.gameManager.currentScene) {
      return window.gameManager.currentScene;
    }
    
    if (window.game && window.game.scene) {
      const activeScenes = window.game.scene.getScenes(true);
      return activeScenes.find(scene => 
        scene.key !== 'Boot' && 
        scene.key !== 'Preload' &&
        scene.scene.isActive()
      );
    }
    
    return null;
  }

  onGamePaused() {
    console.log('PauseManager: Game is now paused');
  }

  onGameResumed() {
    console.log('PauseManager: Game is now resumed');
  }

  isGamePaused() {
    return this.isPaused;
  }

  isSkillSelectionActive() {
    return this.skillSelectionActive;
  }

  getPauseState() {
    return {
      isPaused: this.isPaused,
      skillSelectionActive: this.skillSelectionActive
    };
  }

  forcePause() {
    this.pauseGame();
  }

  forceResume() {
    this.resumeGame();
  }

  destroy() {
    this.resumeGame();
    EventBus.removeListener('pause-game', () => this.pauseGame());
    EventBus.removeListener('resume-game', () => this.resumeGame());
    EventBus.removeListener('game-paused', () => this.onGamePaused());
    EventBus.removeListener('game-resumed', () => this.onGameResumed());
    PauseManager.instance = null;
  }
}
