// TimerUtils.js - Timer and time formatting utilities

export class TimerUtils {
  /**
   * Format time in milliseconds to MM:SS format
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} Formatted time string
   */
  static formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  /**
   * Format time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  static formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Format time in milliseconds to HH:MM:SS format
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} Formatted time string with hours
   */
  static formatTimeWithHours(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Create a game timer that tracks elapsed time
   * @param {Phaser.Scene} scene - The scene
   * @param {function} callback - Callback function called every second
   * @returns {object} Timer object with control methods
   */
  static createGameTimer(scene, callback = null) {
    let startTime = Date.now();
    let elapsed = 0;
    let isRunning = false;
    let timer = null;

    const timerObj = {
      start: () => {
        if (!isRunning) {
          startTime = Date.now() - elapsed * 1000;
          isRunning = true;
          timer = scene.time.addEvent({
            delay: 1000,
            callback: () => {
              if (isRunning) {
                elapsed = Math.floor((Date.now() - startTime) / 1000);
                if (callback) callback(elapsed, TimerUtils.formatSeconds(elapsed));
              }
            },
            loop: true
          });
        }
      },
      
      pause: () => {
        if (isRunning) {
          isRunning = false;
          elapsed = Math.floor((Date.now() - startTime) / 1000);
          if (timer) {
            timer.destroy();
            timer = null;
          }
        }
      },
      
      stop: () => {
        isRunning = false;
        elapsed = 0;
        if (timer) {
          timer.destroy();
          timer = null;
        }
      },
      
      reset: () => {
        timerObj.stop();
        startTime = Date.now();
      },
      
      getElapsed: () => elapsed,
      getFormattedTime: () => TimerUtils.formatSeconds(elapsed),
      isRunning: () => isRunning,
      
      destroy: () => {
        if (timer) {
          timer.destroy();
          timer = null;
        }
        isRunning = false;
      }
    };

    return timerObj;
  }

  /**
   * Create a countdown timer
   * @param {Phaser.Scene} scene - The scene
   * @param {number} duration - Duration in seconds
   * @param {function} onUpdate - Called every second with remaining time
   * @param {function} onComplete - Called when timer reaches zero
   * @returns {object} Countdown timer object
   */
  static createCountdownTimer(scene, duration, onUpdate = null, onComplete = null) {
    let remaining = duration;
    let isRunning = false;
    let timer = null;

    const countdownObj = {
      start: () => {
        if (!isRunning && remaining > 0) {
          isRunning = true;
          timer = scene.time.addEvent({
            delay: 1000,
            callback: () => {
              if (isRunning && remaining > 0) {
                remaining--;
                if (onUpdate) onUpdate(remaining, TimerUtils.formatSeconds(remaining));
                
                if (remaining <= 0) {
                  isRunning = false;
                  if (onComplete) onComplete();
                  if (timer) {
                    timer.destroy();
                    timer = null;
                  }
                }
              }
            },
            loop: true
          });
        }
      },
      
      pause: () => {
        isRunning = false;
        if (timer) {
          timer.destroy();
          timer = null;
        }
      },
      
      stop: () => {
        isRunning = false;
        remaining = 0;
        if (timer) {
          timer.destroy();
          timer = null;
        }
      },
      
      reset: (newDuration = duration) => {
        countdownObj.stop();
        remaining = newDuration;
      },
      
      addTime: (seconds) => {
        remaining += seconds;
        if (remaining < 0) remaining = 0;
      },
      
      getRemaining: () => remaining,
      getFormattedTime: () => TimerUtils.formatSeconds(remaining),
      isRunning: () => isRunning,
      
      destroy: () => {
        if (timer) {
          timer.destroy();
          timer = null;
        }
        isRunning = false;
      }
    };

    return countdownObj;
  }

  /**
   * Create a cooldown timer for abilities/actions
   * @param {number} cooldownTime - Cooldown time in milliseconds
   * @returns {object} Cooldown object
   */
  static createCooldown(cooldownTime) {
    let lastUsed = 0;

    return {
      use: () => {
        lastUsed = Date.now();
      },
      
      isReady: () => {
        return Date.now() - lastUsed >= cooldownTime;
      },
      
      getProgress: () => {
        const elapsed = Date.now() - lastUsed;
        return Math.min(elapsed / cooldownTime, 1);
      },
      
      getRemaining: () => {
        const remaining = cooldownTime - (Date.now() - lastUsed);
        return Math.max(remaining, 0);
      },
      
      reset: () => {
        lastUsed = 0;
      }
    };
  }

  /**
   * Debounce a function call
   * @param {function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {function} Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle a function call
   * @param {function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {function} Throttled function
   */
  static throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * Create a frame-based timer (useful for animations)
   * @param {Phaser.Scene} scene - The scene
   * @param {number} frames - Number of frames to count
   * @param {function} callback - Callback when timer completes
   * @returns {object} Frame timer object
   */
  static createFrameTimer(scene, frames, callback = null) {
    let currentFrame = 0;
    let isRunning = false;

    const frameTimer = {
      start: () => {
        if (!isRunning) {
          isRunning = true;
          currentFrame = 0;
        }
      },
      
      update: () => {
        if (isRunning) {
          currentFrame++;
          if (currentFrame >= frames) {
            isRunning = false;
            if (callback) callback();
            return true; // Timer completed
          }
        }
        return false;
      },
      
      stop: () => {
        isRunning = false;
        currentFrame = 0;
      },
      
      getProgress: () => currentFrame / frames,
      getCurrentFrame: () => currentFrame,
      isRunning: () => isRunning
    };

    return frameTimer;
  }

  /**
   * Convert time to human readable format
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} Human readable time
   */
  static toHumanReadable(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Check if enough time has passed since last action
   * @param {number} lastTime - Last action timestamp
   * @param {number} interval - Required interval in milliseconds
   * @returns {boolean} True if enough time has passed
   */
  static hasIntervalPassed(lastTime, interval) {
    return Date.now() - lastTime >= interval;
  }

  /**
   * Get current timestamp
   * @returns {number} Current timestamp in milliseconds
   */
  static now() {
    return Date.now();
  }

  /**
   * Create a simple delay promise
   * @param {number} milliseconds - Delay in milliseconds
   * @returns {Promise} Promise that resolves after delay
   */
  static delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}

export default TimerUtils;
