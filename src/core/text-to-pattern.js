import { LETTERS, LETTER_HEIGHT, LETTER_WIDTH } from '../../patterns/letters.js';
import GridCalculator from './grid-calculator.js';
import { rotatePattern } from '../utils/pattern-utils.js';
import { GRID_CONFIG } from '../constants/config.js';
import { ERROR_MESSAGES, WARNING_MESSAGES } from '../constants/messages.js';

class TextToPattern {
  constructor(year) {
    this.year = year;
    this.gridCalc = new GridCalculator(year);
    this.letterSpacing = 1;
  }

  textToGrid(text, startWeek = 10, intensity = 3) {
    const uppercaseText = text.toUpperCase();
    const patterns = [];
    let currentWeek = startWeek;

    for (let i = 0; i < uppercaseText.length; i++) {
      const char = uppercaseText[i];

      if (!LETTERS[char]) {
        console.warn(WARNING_MESSAGES.CHARACTER_NOT_FOUND.replace('{char}', char));
        continue;
      }

      const letter = LETTERS[char];

      for (let col = 0; col < LETTER_WIDTH; col++) {
        for (let row = 0; row < LETTER_HEIGHT; row++) {
          if (letter[row][col] === 1) {
            if (this.gridCalc.isValidPosition(currentWeek + col, row)) {
              patterns.push({
                week: currentWeek + col,
                day: row,
                commits: intensity
              });
            }
          }
        }
      }

      currentWeek += LETTER_WIDTH + this.letterSpacing;
    }

    return patterns;
  }

  textToPatternWithValidation(text, startWeek = 10, intensity = 3) {
    const uppercaseText = text.toUpperCase();
    const totalWeeksNeeded = this.calculateWeeksNeeded(uppercaseText);
    const availableSpace = this.gridCalc.getAvailableSpace(startWeek);

    if (totalWeeksNeeded > availableSpace.weeks) {
      throw new Error(
        ERROR_MESSAGES.TEXT_TOO_LONG
          .replace('{text}', text)
          .replace('{required}', totalWeeksNeeded)
          .replace('{available}', availableSpace.weeks)
          .replace('{start}', startWeek)
      );
    }

    return this.textToGrid(text, startWeek, intensity);
  }

  calculateWeeksNeeded(text) {
    const uppercaseText = text.toUpperCase();
    let totalWeeks = 0;

    for (let i = 0; i < uppercaseText.length; i++) {
      if (LETTERS[uppercaseText[i]]) {
        totalWeeks += LETTER_WIDTH;
        if (i < uppercaseText.length - 1) {
          totalWeeks += this.letterSpacing;
        }
      }
    }

    return totalWeeks;
  }

  createWordPattern(word, config = {}) {
    const {
      startWeek = 10,
      intensity = 3,
      gradient = false,
      alternating = false
    } = config;

    const basePatterns = this.textToGrid(word, startWeek, intensity);

    if (gradient) {
      return this.applyGradient(basePatterns);
    }

    if (alternating) {
      return this.applyAlternating(basePatterns);
    }

    return basePatterns;
  }

  applyGradient(patterns) {
    const intensityLevels = [1, 2, 3, 4];
    return patterns.map(pattern => ({
      ...pattern,
      commits: intensityLevels[pattern.day % intensityLevels.length]
    }));
  }

  applyAlternating(patterns) {
    return patterns.map((pattern, index) => ({
      ...pattern,
      commits: index % 2 === 0 ? 4 : 2
    }));
  }

  createMultiLineText(lines, config = {}) {
    const { startWeek = 10, lineSpacing = 2, intensity = 3 } = config;
    const allPatterns = [];
    let currentWeek = startWeek;

    for (const line of lines) {
      const linePatterns = this.textToGrid(line, currentWeek, intensity);
      allPatterns.push(...linePatterns);

      const weeksNeeded = this.calculateWeeksNeeded(line);
      currentWeek += weeksNeeded + lineSpacing;
    }

    return allPatterns;
  }

  createCustomPattern(gridArray, startWeek = 10, intensity = 3) {
    const patterns = [];

    for (let week = 0; week < gridArray.length; week++) {
      for (let day = 0; day < gridArray[week].length; day++) {
        const value = gridArray[week][day];
        if (value > 0) {
          if (this.gridCalc.isValidPosition(startWeek + week, day)) {
            patterns.push({
              week: startWeek + week,
              day: day,
              commits: typeof value === 'number' ? value : intensity
            });
          }
        }
      }
    }

    return patterns;
  }

  createHeartPattern(startWeek = 20, intensity = 4) {
    const heart = [
      [0, 1, 1, 0, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0]
    ];

    const rotatedHeart = rotatePattern(heart);
    return this.createCustomPattern(rotatedHeart, startWeek, intensity);
  }

  createStarPattern(startWeek = 30, intensity = 3) {
    const star = [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 1]
    ];

    const rotatedStar = rotatePattern(star);
    return this.createCustomPattern(rotatedStar, startWeek, intensity);
  }


  createDiagonalLine(startWeek = 5, length = 10, intensity = 2) {
    const patterns = [];

    for (let i = 0; i < length && i < 7; i++) {
      if (this.gridCalc.isValidPosition(startWeek + i, i)) {
        patterns.push({
          week: startWeek + i,
          day: i,
          commits: intensity
        });
      }
    }

    return patterns;
  }

  createCheckeredPattern(startWeek = 0, endWeek = GRID_CONFIG.WEEKS_PER_YEAR, intensity = 2) {
    const patterns = [];

    for (let week = startWeek; week <= endWeek; week++) {
      for (let day = 0; day < 7; day++) {
        if ((week + day) % 2 === 0) {
          if (this.gridCalc.isValidPosition(week, day)) {
            patterns.push({
              week: week,
              day: day,
              commits: intensity
            });
          }
        }
      }
    }

    return patterns;
  }

  createWavePattern(startWeek = 0, amplitude = 3, wavelength = 10, intensity = 3) {
    const patterns = [];
    const dims = this.gridCalc.getGridDimensions();

    for (let week = startWeek; week < dims.cols; week++) {
      const y = Math.round(amplitude * Math.sin((2 * Math.PI * week) / wavelength) + 3.5);

      if (y >= 0 && y < 7) {
        if (this.gridCalc.isValidPosition(week, y)) {
          patterns.push({
            week: week,
            day: y,
            commits: intensity
          });
        }

        if (y > 0 && this.gridCalc.isValidPosition(week, y - 1)) {
          patterns.push({
            week: week,
            day: y - 1,
            commits: Math.max(1, intensity - 1)
          });
        }
      }
    }

    return patterns;
  }
}

export default TextToPattern;