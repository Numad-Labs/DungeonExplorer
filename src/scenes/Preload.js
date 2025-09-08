/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
// Old integration removed - now handled by React App
import { EventBus } from "../game/EventBus";
/* END-USER-IMPORTS */

export default class Preload extends Phaser.Scene {
  constructor() {
    super("Preload");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  /** @returns {void} */
  editorPreload() {
    // Add loading error handlers
    this.load.on("loaderror", (file) => {
      console.error(`Failed to load: ${file.key} from ${file.url}`);
    });

    this.load.on("filecomplete", (key, type, data) => {
      if (type === "audio") {
        ``;
        console.log(`Audio loaded: ${key}`);
      }
    });
  }

  /** @returns {void} */
  editorCreate() {
    // guapen
    const guapen = this.add.image(505.0120544433594, 360, "guapen");
    guapen.scaleX = 0.32715486817515643;
    guapen.scaleY = 0.32715486817515643;

    // progressBar
    const progressBar = this.add.rectangle(553, 361, 256, 20);
    progressBar.setOrigin(0, 0);
    progressBar.isFilled = true;
    progressBar.fillColor = 14737632;

    // progressBarBg
    const progressBarBg = this.add.rectangle(553.0120849609375, 361, 256, 20);
    progressBarBg.setOrigin(0, 0);
    progressBar.fillColor = 14737632;
    progressBarBg.isStroked = true;

    // loadingText
    const loadingText = this.add.text(552.0120849609375, 329, "", {});
    loadingText.text = "Loading...";
    loadingText.setStyle({
      color: "#e0e0e0",
      fontFamily: "arial",
      fontSize: "20px",
    });

    this.progressBar = progressBar;

    this.events.emit("scene-awake");
  }

  /** @type {Phaser.GameObjects.Rectangle} */
  progressBar;

  /* START-USER-CODE */

  preload() {
    this.editorCreate();
    this.editorPreload();

    const width = this.progressBar.width;

    this.load.on("progress", (progress) => {
      this.progressBar.width = progress * width;
    });

    this.load.on("complete", () => {
      console.log("All assets loaded successfully");
    });
  }

  create() {
    // Enable audio unlock for web browsers
    this.sound.unlock();

    // Wait a moment for all audio to be fully processed
    this.time.delayedCall(100, () => {
      this.initializeAudio();
    });
  }

  initializeAudio() {
    // Audio keys that should be loaded
    const audioKeys = [
      "gameLoop",
      "characterDying",
      "menuSelection",
      "levelUp",
      "menuDenied",
    ];

    console.log("Audio initialization:");

    // Check what's actually in the cache
    audioKeys.forEach((key) => {
      const exists = this.cache.audio.exists(key);
      console.log(`${key}: ${exists ? "FOUND" : "MISSING"} in cache`);
    });

    // Create sound instances only for files that exist
    this.sounds = {};
    audioKeys.forEach((key) => {
      if (this.cache.audio.exists(key)) {
        try {
          this.sounds[key] = this.sound.add(key, { volume: 0.7 });
          console.log(`Sound instance created: ${key}`);
        } catch (error) {
          console.error(`Failed to create sound instance for ${key}:`, error);
        }
      }
    });

    // Make sounds globally accessible
    window.gameSounds = this.sounds;

    // Enhanced play function with better error handling
    window.playSound = (key, config = {}) => {
      try {
        // Check if sound exists and is ready
        if (!this.sounds[key]) {
          console.warn(`Sound '${key}' not loaded or not available`);
          return null;
        }

        // Check if audio context is ready
        if (this.sound.context && this.sound.context.state === "suspended") {
          console.warn("Audio context suspended - user interaction required");
          this.sound.unlock();
          return null;
        }

        console.log(`Playing sound: ${key}`);
        return this.sounds[key].play(config);
      } catch (error) {
        console.error(`Error playing sound '${key}':`, error);
        return null;
      }
    };

    // Test function
    window.testAudio = (key) => {
      console.log(`Testing audio: ${key}`);
      return window.playSound(key, { volume: 0.5 });
    };

    // Status check function
    window.checkAudioStatus = () => {
      console.log("=== AUDIO SYSTEM STATUS ===");
      console.log(
        `Audio Context: ${this.sound.context ? "Available" : "Not Available"}`
      );
      console.log(`Context State: ${this.sound.context?.state || "Unknown"}`);
      console.log(`Audio Unlocked: ${this.sound.locked ? "No" : "Yes"}`);
      console.log("Sound Files:");
      audioKeys.forEach((key) => {
        const exists = this.cache.audio.exists(key);
        const hasInstance = !!this.sounds[key];
        console.log(
          `  ${key}: Cache=${exists ? "YES" : "NO"} | Instance=${
            hasInstance ? "YES" : "NO"
          }`
        );
      });
    };

    console.log("Audio system initialized!");
    console.log(
      'Commands: window.testAudio("gameLoop") | window.checkAudioStatus()'
    );

    // Auto-check status
    window.checkAudioStatus();

    EventBus.emit("current-scene-ready", this);
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */
