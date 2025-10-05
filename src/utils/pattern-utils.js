/**
 * Utility functions for pattern manipulation
 */

/**
 * Rotates a 2D pattern array 90 degrees clockwise
 * @param {Array<Array<number>>} pattern - 2D array representing the pattern
 * @returns {Array<Array<number>>} - Rotated pattern
 */
export function rotatePattern(pattern) {
  if (!Array.isArray(pattern) || pattern.length === 0) {
    return [];
  }

  const rows = pattern.length;
  const cols = pattern[0].length;
  const rotated = [];

  for (let col = 0; col < cols; col++) {
    const newRow = [];
    for (let row = 0; row < rows; row++) {
      newRow.push(pattern[row][col]);
    }
    rotated.push(newRow);
  }

  return rotated;
}

/**
 * Optimizes patterns by removing duplicates and sorting
 * @param {Array<Object>} patterns - Array of pattern objects
 * @returns {Array<Object>} - Optimized patterns
 */
export function optimizePatterns(patterns) {
  const optimized = new Map();

  patterns.forEach(pattern => {
    const key = `${pattern.week}-${pattern.day}`;
    if (!optimized.has(key) || optimized.get(key).commits < pattern.commits) {
      optimized.set(key, pattern);
    }
  });

  return Array.from(optimized.values()).sort((a, b) => {
    if (a.week !== b.week) return a.week - b.week;
    return a.day - b.day;
  });
}
