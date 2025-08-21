export class MathUtils {
  /**
   * Calculate distance between two points
   * @param {number} x1 - First point x
   * @param {number} y1 - First point y
   * @param {number} x2 - Second point x
   * @param {number} y2 - Second point y
   * @returns {number} Distance between points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance (faster than distance when you only need comparison)
   * @param {number} x1 - First point x
   * @param {number} y1 - First point y
   * @param {number} x2 - Second point x
   * @param {number} y2 - Second point y
   * @returns {number} Squared distance between points
   */
  static distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }

  /**
   * Calculate angle between two points in radians
   * @param {number} x1 - First point x
   * @param {number} y1 - First point y
   * @param {number} x2 - Second point x
   * @param {number} y2 - Second point y
   * @returns {number} Angle in radians
   */
  static angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  static degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Radians
   * @returns {number} Degrees
   */
  static radToDeg(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(a, b, t) {
    return a + (b - a) * MathUtils.clamp(t, 0, 1);
  }

  /**
   * Normalize a value from one range to another
   * @param {number} value - Value to normalize
   * @param {number} inMin - Input range minimum
   * @param {number} inMax - Input range maximum
   * @param {number} outMin - Output range minimum
   * @param {number} outMax - Output range maximum
   * @returns {number} Normalized value
   */
  static normalize(value, inMin, inMax, outMin, outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
  }

  /**
   * Check if a point is within a rectangle
   * @param {number} x - Point x
   * @param {number} y - Point y
   * @param {number} rectX - Rectangle x
   * @param {number} rectY - Rectangle y
   * @param {number} rectWidth - Rectangle width
   * @param {number} rectHeight - Rectangle height
   * @returns {boolean} True if point is inside rectangle
   */
  static pointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return x >= rectX && x <= rectX + rectWidth && 
           y >= rectY && y <= rectY + rectHeight;
  }

  /**
   * Check if a point is within a circle
   * @param {number} x - Point x
   * @param {number} y - Point y
   * @param {number} circleX - Circle center x
   * @param {number} circleY - Circle center y
   * @param {number} radius - Circle radius
   * @returns {boolean} True if point is inside circle
   */
  static pointInCircle(x, y, circleX, circleY, radius) {
    return MathUtils.distanceSquared(x, y, circleX, circleY) <= radius * radius;
  }

  /**
   * Check if two circles overlap
   * @param {number} x1 - First circle x
   * @param {number} y1 - First circle y
   * @param {number} r1 - First circle radius
   * @param {number} x2 - Second circle x
   * @param {number} y2 - Second circle y
   * @param {number} r2 - Second circle radius
   * @returns {boolean} True if circles overlap
   */
  static circlesOverlap(x1, y1, r1, x2, y2, r2) {
    const totalRadius = r1 + r2;
    return MathUtils.distanceSquared(x1, y1, x2, y2) <= totalRadius * totalRadius;
  }

  /**
   * Check if two rectangles overlap
   * @param {number} x1 - First rect x
   * @param {number} y1 - First rect y
   * @param {number} w1 - First rect width
   * @param {number} h1 - First rect height
   * @param {number} x2 - Second rect x
   * @param {number} y2 - Second rect y
   * @param {number} w2 - Second rect width
   * @param {number} h2 - Second rect height
   * @returns {boolean} True if rectangles overlap
   */
  static rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * Generate a random number between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random element from an array
   * @param {Array} array - Array to pick from
   * @returns {*} Random element
   */
  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Pick multiple random elements from an array without replacement
   * @param {Array} array - Array to pick from
   * @param {number} count - Number of elements to pick
   * @returns {Array} Array of random elements
   */
  static randomChoices(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Calculate weighted random choice
   * @param {Array} items - Array of items
   * @param {Array} weights - Array of weights (same length as items)
   * @returns {*} Weighted random choice
   */
  static weightedChoice(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  /**
   * Round a number to specified decimal places
   * @param {number} value - Value to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} Rounded number
   */
  static round(value, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Check if a number is approximately equal to another (within epsilon)
   * @param {number} a - First number
   * @param {number} b - Second number
   * @param {number} epsilon - Tolerance (default: 0.001)
   * @returns {boolean} True if approximately equal
   */
  static approximately(a, b, epsilon = 0.001) {
    return Math.abs(a - b) < epsilon;
  }

  /**
   * Calculate percentage of a value
   * @param {number} value - Current value
   * @param {number} max - Maximum value
   * @returns {number} Percentage (0-100)
   */
  static percentage(value, max) {
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  /**
   * Calculate value from percentage
   * @param {number} percentage - Percentage (0-100)
   * @param {number} max - Maximum value
   * @returns {number} Calculated value
   */
  static fromPercentage(percentage, max) {
    return (percentage / 100) * max;
  }

  /**
   * Wrap a value around a range
   * @param {number} value - Value to wrap
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Wrapped value
   */
  static wrap(value, min, max) {
    const range = max - min;
    return ((value - min) % range + range) % range + min;
  }

  /**
   * Calculate moving average
   * @param {Array} values - Array of values
   * @param {number} windowSize - Size of moving window
   * @returns {Array} Array of moving averages
   */
  static movingAverage(values, windowSize) {
    const result = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(average);
    }
    return result;
  }

  /**
   * Calculate exponential moving average
   * @param {Array} values - Array of values
   * @param {number} alpha - Smoothing factor (0-1)
   * @returns {Array} Array of exponential moving averages
   */
  static exponentialMovingAverage(values, alpha) {
    const result = [values[0]];
    for (let i = 1; i < values.length; i++) {
      const ema = alpha * values[i] + (1 - alpha) * result[i - 1];
      result.push(ema);
    }
    return result;
  }

  /**
   * Calculate ease-in animation curve
   * @param {number} t - Time parameter (0-1)
   * @returns {number} Eased value
   */
  static easeIn(t) {
    return t * t;
  }

  /**
   * Calculate ease-out animation curve
   * @param {number} t - Time parameter (0-1)
   * @returns {number} Eased value
   */
  static easeOut(t) {
    return 1 - Math.pow(1 - t, 2);
  }

  /**
   * Calculate ease-in-out animation curve
   * @param {number} t - Time parameter (0-1)
   * @returns {number} Eased value
   */
  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Calculate smoothstep function
   * @param {number} edge0 - Lower edge
   * @param {number} edge1 - Upper edge
   * @param {number} x - Input value
   * @returns {number} Smoothed value
   */
  static smoothstep(edge0, edge1, x) {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Calculate vector magnitude
   * @param {number} x - X component
   * @param {number} y - Y component
   * @returns {number} Vector magnitude
   */
  static vectorMagnitude(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  /**
   * Normalize a vector
   * @param {number} x - X component
   * @param {number} y - Y component
   * @returns {object} Normalized vector {x, y}
   */
  static vectorNormalize(x, y) {
    const magnitude = MathUtils.vectorMagnitude(x, y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return { x: x / magnitude, y: y / magnitude };
  }

  /**
   * Calculate dot product of two vectors
   * @param {number} x1 - First vector x
   * @param {number} y1 - First vector y
   * @param {number} x2 - Second vector x
   * @param {number} y2 - Second vector y
   * @returns {number} Dot product
   */
  static vectorDot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
  }

  /**
   * Calculate cross product of two 2D vectors (returns scalar)
   * @param {number} x1 - First vector x
   * @param {number} y1 - First vector y
   * @param {number} x2 - Second vector x
   * @param {number} y2 - Second vector y
   * @returns {number} Cross product
   */
  static vectorCross2D(x1, y1, x2, y2) {
    return x1 * y2 - y1 * x2;
  }
}

export default MathUtils;