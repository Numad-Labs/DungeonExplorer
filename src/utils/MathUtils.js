export class MathUtils {
  /**
   * Calculate distance between two points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance (faster than distance when you only need comparison)
   */
  static distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }

  /**
   * Calculate angle between two points in radians
   */
  static angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(a, b, t) {
    return a + (b - a) * MathUtils.clamp(t, 0, 1);
  }

  /**
   * Check if a point is within a circle
   */
  static pointInCircle(x, y, circleX, circleY, radius) {
    return MathUtils.distanceSquared(x, y, circleX, circleY) <= radius * radius;
  }

  /**
   * Check if two circles overlap
   */
  static circlesOverlap(x1, y1, r1, x2, y2, r2) {
    const totalRadius = r1 + r2;
    return MathUtils.distanceSquared(x1, y1, x2, y2) <= totalRadius * totalRadius;
  }

  /**
   * Generate a random number between min and max (inclusive)
   */
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate a random integer between min and max (inclusive)
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random element from an array
   */
  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Round a number to specified decimal places
   */
  static round(value, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Calculate percentage of a value
   */
  static percentage(value, max) {
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  /**
   * Wrap a value around a range
   */
  static wrap(value, min, max) {
    const range = max - min;
    return ((value - min) % range + range) % range + min;
  }

  /**
   * Normalize a vector
   */
  static vectorNormalize(x, y) {
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return { x: x / magnitude, y: y / magnitude };
  }
}

export default MathUtils;
