import GridCalculator from '../core/grid-calculator.js';
import moment from 'moment';
import { INFO_MESSAGES, WARNING_MESSAGES } from '../constants/messages.js';
import { VISUALIZATION_CHARS } from '../constants/config.js';

class Visualizer {
  constructor(year) {
    this.year = year;
    this.gridCalc = new GridCalculator(year);
    this.commitData = new Map();
  }

  addPatterns(patterns) {
    patterns.forEach(pattern => {
      const key = `${pattern.week}-${pattern.day}`;
      this.commitData.set(key, pattern.commits || 1);
    });
  }

  clearPatterns() {
    this.commitData.clear();
  }

  getIntensityChar(commits) {
    if (!commits || commits === 0) return VISUALIZATION_CHARS.ASCII.EMPTY;
    if (commits === 1) return VISUALIZATION_CHARS.ASCII.LIGHT;
    if (commits === 2) return VISUALIZATION_CHARS.ASCII.MEDIUM;
    if (commits === 3) return VISUALIZATION_CHARS.ASCII.HEAVY;
    return VISUALIZATION_CHARS.ASCII.FULL;
  }

  getIntensityEmoji(commits) {
    if (!commits || commits === 0) return VISUALIZATION_CHARS.EMOJI.EMPTY;
    if (commits === 1) return VISUALIZATION_CHARS.EMOJI.LIGHT;
    if (commits === 2) return VISUALIZATION_CHARS.EMOJI.MEDIUM;
    if (commits === 3) return VISUALIZATION_CHARS.EMOJI.HEAVY;
    return VISUALIZATION_CHARS.EMOJI.FULL;
  }

  getIntensityColor(commits) {
    const colors = {
      0: '\x1b[90m',
      1: '\x1b[92m',
      2: '\x1b[32m',
      3: '\x1b[93m',
      4: '\x1b[91m'
    };

    const reset = '\x1b[0m';
    const intensity = Math.min(commits || 0, 4);

    return colors[intensity] + VISUALIZATION_CHARS.COLOR.BLOCK + reset;
  }

  visualize(mode = 'ascii') {
    const dims = this.gridCalc.getGridDimensions();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = moment();

    console.log(`\n=== ${INFO_MESSAGES.GRAPH_VISUALIZATION_TITLE} (${this.year}) ===\n`);

    const monthBoundaries = this.gridCalc.getMonthBoundaries();
    let monthLine = '        ';
    let currentMonthIndex = 0;

    for (let week = 0; week < dims.cols; week++) {
      if (currentMonthIndex < monthBoundaries.length &&
          week === monthBoundaries[currentMonthIndex].week) {
        const monthName = monthBoundaries[currentMonthIndex].month.substring(0, 3);
        monthLine += monthName.padEnd(3);
        currentMonthIndex++;
      } else {
        monthLine += '   ';
      }
    }
    console.log(monthLine);

    for (let day = 0; day < 7; day++) {
      let line = days[day] + ' │ ';

      for (let week = 0; week < dims.cols; week++) {
        const key = `${week}-${day}`;
        const commits = this.commitData.get(key) || 0;
        const targetDate = this.gridCalc.weekDayToDate(week, day);
        const isFuture = targetDate && targetDate.isAfter(today, 'day');

        if (!this.gridCalc.isValidPosition(week, day)) {
          line += '   ';
        } else if (isFuture && commits > 0) {
          // Show future commits with special marker
          switch (mode) {
            case 'emoji':
              line += VISUALIZATION_CHARS.EMOJI.FUTURE + ' ';
              break;
            case 'color':
              line += ' \x1b[31m' + VISUALIZATION_CHARS.COLOR.FUTURE + '\x1b[0m ';
              break;
            case 'ascii':
            default:
              line += VISUALIZATION_CHARS.ASCII.FUTURE + ' ';
              break;
          }
        } else {
          switch (mode) {
            case 'emoji':
              line += this.getIntensityEmoji(commits) + ' ';
              break;
            case 'color':
              line += ' ' + this.getIntensityColor(commits) + ' ';
              break;
            case 'ascii':
            default:
              line += this.getIntensityChar(commits) + ' ';
              break;
          }
        }
      }

      console.log(line);
    }

    console.log('\n' + this.getLegend(mode));
    this.printStats();
  }

  getLegend(mode) {
    let legend = 'Legend: ';

    switch (mode) {
      case 'emoji':
        const e = VISUALIZATION_CHARS.EMOJI;
        legend += `${e.EMPTY} = 0  ${e.LIGHT} = 1-2  ${e.MEDIUM} = 3-4  ${e.HEAVY} = 5-6  ${e.FULL} = 7+  ${e.FUTURE} = Future date`;
        break;
      case 'color':
        const c = VISUALIZATION_CHARS.COLOR;
        legend += `\x1b[90m${c.BLOCK}\x1b[0m = 0  \x1b[92m${c.BLOCK}\x1b[0m = 1-2  \x1b[32m${c.BLOCK}\x1b[0m = 3-4  \x1b[93m${c.BLOCK}\x1b[0m = 5-6  \x1b[91m${c.BLOCK}\x1b[0m = 7+  \x1b[31m${c.FUTURE}\x1b[0m = Future date`;
        break;
      case 'ascii':
      default:
        const a = VISUALIZATION_CHARS.ASCII;
        legend += `${a.EMPTY} = 0  ${a.LIGHT} = 1-2  ${a.MEDIUM} = 3-4  ${a.HEAVY} = 5-6  ${a.FULL} = 7+  ${a.FUTURE} = Future date`;
        break;
    }

    return legend;
  }

  printStats() {
    const today = moment();
    let futureCommits = 0;
    let validCommits = 0;
    let futureDays = 0;

    this.commitData.forEach((commits, key) => {
      const [week, day] = key.split('-').map(Number);
      const targetDate = this.gridCalc.weekDayToDate(week, day);

      if (targetDate && targetDate.isAfter(today, 'day')) {
        futureCommits += commits;
        futureDays++;
      } else {
        validCommits += commits;
      }
    });

    const totalCommits = Array.from(this.commitData.values()).reduce((sum, val) => sum + val, 0);
    const totalDays = this.commitData.size;

    console.log(`\n${INFO_MESSAGES.STATISTICS_TITLE}`);
    console.log(`- ${INFO_MESSAGES.TOTAL_DAYS_WITH_COMMITS}: ${totalDays}`);
    console.log(`- ${INFO_MESSAGES.TOTAL_COMMITS_PLANNED}: ${totalCommits}`);
    console.log(`- ${INFO_MESSAGES.AVERAGE_COMMITS_PER_DAY}: ${totalDays > 0 ? (totalCommits / totalDays).toFixed(2) : 0}`);

    if (futureCommits > 0) {
      console.log(`\n⚠️  ${WARNING_MESSAGES.FUTURE_COMMITS_WARNING.replace('{count}', futureCommits).replace('{days}', futureDays)}`);
      console.log(`- ${INFO_MESSAGES.VALID_COMMITS}: ${validCommits}`);
      console.log(`- ${INFO_MESSAGES.FUTURE_COMMITS_SKIP}: ${futureCommits}`);
    }
  }


}

export default Visualizer;