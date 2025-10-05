import TextToPattern from './text-to-pattern.js';
import fs from 'fs';
import { rotatePattern, optimizePatterns as optimizePatternsUtil } from '../utils/pattern-utils.js';
import { ERROR_MESSAGES, WARNING_MESSAGES, INFO_MESSAGES } from '../constants/messages.js';
import { CLI_CONFIG, GRID_CONFIG } from '../constants/config.js';

class PatternBuilder {
  constructor(year) {
    this.year = year;
    this.textToPattern = new TextToPattern(year);
    this.patterns = [];
  }

  createTextPattern(text, options = {}) {
    const {
      startWeek = 10,
      intensity = 3,
      gradient = false,
      alternating = false,
      shadow = false
    } = options;

    let patterns = this.textToPattern.textToGrid(text, startWeek, intensity);

    if (gradient) {
      patterns = this.applyGradientEffect(patterns);
    }

    if (alternating) {
      patterns = this.applyAlternatingEffect(patterns);
    }

    if (shadow) {
      patterns = this.applyShadowEffect(patterns, startWeek);
    }

    return patterns;
  }

  createShapePattern(shape, startWeek = 20, intensity = 3) {
    switch(shape) {
      case 'heart':
        return this.textToPattern.createHeartPattern(startWeek, intensity);
      case 'star':
        return this.textToPattern.createStarPattern(startWeek, intensity);
      case 'triangle':
        return this.createTrianglePattern(startWeek, intensity);
      case 'square':
        return this.createSquarePattern(startWeek, intensity);
      case 'diamond':
        return this.createDiamondPattern(startWeek, intensity);
      default:
        return [];
    }
  }

  createEffectPattern(effect, options = {}) {
    switch(effect) {
      case 'wave':
        return this.textToPattern.createWavePattern(
          options.startWeek || 0,
          options.amplitude || 3,
          options.wavelength || 10,
          options.intensity || 3
        );
      case 'checkerboard':
        return this.textToPattern.createCheckeredPattern(
          options.startWeek || 0,
          options.endWeek || GRID_CONFIG.WEEKS_PER_YEAR,
          options.intensity || 2
        );
      case 'diagonal':
        return this.textToPattern.createDiagonalLine(
          options.startWeek || 5,
          options.length || 10,
          options.intensity || 2
        );
      case 'spiral':
        return this.createSpiralPattern(
          options.startWeek || 10,
          options.intensity || 3
        );
      case 'random':
        return this.createRandomPattern(
          options.count || 100,
          options.intensity || 2
        );
      default:
        return [];
    }
  }

  createTrianglePattern(startWeek = 20, intensity = 3) {
    const triangle = [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ];

    const rotated = rotatePattern(triangle);
    return this.textToPattern.createCustomPattern(rotated, startWeek, intensity);
  }

  createSquarePattern(startWeek = 20, intensity = 3) {
    const square = [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ];

    const rotated = rotatePattern(square);
    return this.textToPattern.createCustomPattern(rotated, startWeek, intensity);
  }

  createDiamondPattern(startWeek = 20, intensity = 3) {
    const diamond = [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0]
    ];

    const rotated = rotatePattern(diamond);
    return this.textToPattern.createCustomPattern(rotated, startWeek, intensity);
  }

  createSpiralPattern(startWeek = 10, intensity = 3) {
    const patterns = [];
    const centerWeek = startWeek + 5;
    const centerDay = 3;

    for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
      const radius = angle / 2;
      const week = Math.round(centerWeek + radius * Math.cos(angle));
      const day = Math.round(centerDay + radius * Math.sin(angle) / 2);

      if (week >= startWeek && week < startWeek + 15 && day >= 0 && day < 7) {
        patterns.push({
          week,
          day,
          commits: intensity
        });
      }
    }

    return patterns;
  }

  createRandomPattern(count = 100, intensity = 2) {
    const patterns = [];
    const used = new Set();

    while (patterns.length < count) {
      const week = Math.floor(Math.random() * GRID_CONFIG.WEEKS_PER_YEAR) + 1;
      const day = Math.floor(Math.random() * 7);
      const key = `${week}-${day}`;

      if (!used.has(key)) {
        used.add(key);
        patterns.push({
          week,
          day,
          commits: Math.floor(Math.random() * intensity) + 1
        });
      }
    }

    return patterns;
  }

  applyGradientEffect(patterns) {
    const minWeek = Math.min(...patterns.map(p => p.week));
    const maxWeek = Math.max(...patterns.map(p => p.week));
    const weekRange = maxWeek - minWeek + 1;

    return patterns.map(pattern => {
      const progress = (pattern.week - minWeek) / weekRange;
      const intensity = Math.ceil(1 + progress * 3);
      return {
        ...pattern,
        commits: intensity
      };
    });
  }

  applyAlternatingEffect(patterns) {
    return patterns.map((pattern, index) => ({
      ...pattern,
      commits: index % 2 === 0 ? 4 : 2
    }));
  }

  applyShadowEffect(patterns, startWeek) {
    const shadowPatterns = [...patterns];

    patterns.forEach(pattern => {
      const shadowWeek = pattern.week + 1;
      const shadowDay = Math.min(pattern.day + 1, 6);

      if (!patterns.some(p => p.week === shadowWeek && p.day === shadowDay)) {
        shadowPatterns.push({
          week: shadowWeek,
          day: shadowDay,
          commits: 1
        });
      }
    });

    return shadowPatterns;
  }


  combinePatterns(patternsList) {
    const combined = new Map();

    patternsList.forEach(patterns => {
      patterns.forEach(pattern => {
        const key = `${pattern.week}-${pattern.day}`;
        if (combined.has(key)) {
          const existing = combined.get(key);
          combined.set(key, {
            ...existing,
            commits: Math.max(existing.commits, pattern.commits)
          });
        } else {
          combined.set(key, pattern);
        }
      });
    });

    return Array.from(combined.values());
  }

  validatePattern(patterns) {
    const errors = [];
    const warnings = [];

    patterns.forEach((pattern, index) => {
      if (pattern.week < 1 || pattern.week > 53) {
        errors.push(`Pattern ${index}: ${ERROR_MESSAGES.INVALID_WEEK} (${pattern.week})`);
      }

      if (pattern.day < 0 || pattern.day > 6) {
        errors.push(`Pattern ${index}: ${ERROR_MESSAGES.INVALID_DAY} (${pattern.day})`);
      }

      if (pattern.commits < 1) {
        warnings.push(`Pattern ${index}: Commit count too low (${pattern.commits})`);
      }

      if (pattern.commits > 20) {
        warnings.push(`Pattern ${index}: ${WARNING_MESSAGES.HIGH_COMMIT_COUNT} (${pattern.commits})`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  loadFromFile(filepath) {
    try {
      const data = fs.readFileSync(filepath, CLI_CONFIG.FILE_ENCODING);
      const patterns = JSON.parse(data);

      const validation = this.validatePattern(patterns);
      if (!validation.isValid) {
        console.error(ERROR_MESSAGES.PATTERN_VALIDATION_ERROR + ':', validation.errors);
        return [];
      }

      if (validation.warnings.length > 0) {
        console.warn(WARNING_MESSAGES.PATTERN_WARNINGS + ':', validation.warnings);
      }

      return patterns;
    } catch (error) {
      console.error(ERROR_MESSAGES.FILE_READ_ERROR + ':', error.message);
      return [];
    }
  }

  saveToFile(patterns, filepath) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(patterns, null, 2));
      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.FILE_WRITE_ERROR + ':', error.message);
      return false;
    }
  }

  generateArtFromImage(imageData, startWeek = 10) {
    console.log(INFO_MESSAGES.IMAGE_CONVERSION_COMING_SOON);
    return [];
  }

  optimizePattern(patterns) {
    return optimizePatternsUtil(patterns);
  }

  getPatternStats(patterns) {
    if (patterns.length === 0) {
      return {
        totalCommits: 0,
        totalDays: 0,
        weekRange: { start: 0, end: 0 },
        intensity: { min: 0, max: 0, average: 0 }
      };
    }

    const weeks = patterns.map(p => p.week);
    const commits = patterns.map(p => p.commits);

    return {
      totalCommits: commits.reduce((sum, c) => sum + c, 0),
      totalDays: patterns.length,
      weekRange: {
        start: Math.min(...weeks),
        end: Math.max(...weeks)
      },
      intensity: {
        min: Math.min(...commits),
        max: Math.max(...commits),
        average: commits.reduce((sum, c) => sum + c, 0) / commits.length
      }
    };
  }
}

export default PatternBuilder;