import moment from "moment";
import { ERROR_MESSAGES } from '../constants/messages.js';

class GridCalculator {
  constructor(year) {
    this.year = year;
    this.firstDay = moment(`${year}-01-01`);
    this.lastDay = moment(`${year}-12-31`);
    this.startOffset = this.firstDay.day();
    this.totalDays = this.lastDay.diff(this.firstDay, 'days') + 1;
    this.totalWeeks = Math.ceil((this.totalDays + this.startOffset) / 7);
  }

  getGridDimensions() {
    return {
      rows: 7,
      cols: this.totalWeeks,
      startOffset: this.startOffset,
      totalCells: 7 * this.totalWeeks,
      filledCells: this.totalDays
    };
  }

  dateToGridPosition(date) {
    const targetDate = moment(date);

    if (targetDate.year() !== this.year) {
      throw new Error(ERROR_MESSAGES.DATE_WRONG_YEAR.replace('{year}', this.year));
    }

    const dayOfYear = targetDate.dayOfYear() - 1;
    const totalOffset = dayOfYear + this.startOffset;

    const week = Math.floor(totalOffset / 7);
    const day = totalOffset % 7;

    return { week, day, isValid: this.isValidPosition(week, day) };
  }

  gridPositionToDate(week, day) {
    const totalDays = week * 7 + day - this.startOffset;

    if (totalDays < 0 || totalDays >= this.totalDays) {
      return null;
    }

    return this.firstDay.clone().add(totalDays, 'days');
  }

  weekDayToDate(weekNumber, dayOfWeek) {
    const startOfYear = moment().year(this.year).dayOfYear(1);
    const firstWeek = startOfYear.clone().startOf('week');

    if (firstWeek.year() < this.year) {
      firstWeek.add(1, 'week');
    }

    return firstWeek
      .add(weekNumber - 1, 'weeks')
      .add(dayOfWeek, 'days');
  }

  isValidPosition(week, day) {
    if (week < 0 || week >= this.totalWeeks) return false;
    if (day < 0 || day >= 7) return false;

    if (week === 0 && day < this.startOffset) {
      return false;
    }

    const date = this.gridPositionToDate(week, day);
    if (!date) return false;

    return date.year() === this.year && date.isSameOrBefore(this.lastDay);
  }

  getYearGrid() {
    const grid = [];

    for (let week = 0; week < this.totalWeeks; week++) {
      const weekArray = [];
      for (let day = 0; day < 7; day++) {
        if (this.isValidPosition(week, day)) {
          const date = this.gridPositionToDate(week, day);
          weekArray.push({
            date: date ? date.format('YYYY-MM-DD') : null,
            valid: true,
            week,
            day
          });
        } else {
          weekArray.push({
            date: null,
            valid: false,
            week,
            day
          });
        }
      }
      grid.push(weekArray);
    }

    return grid;
  }

  getAvailableSpace(startWeek = 0) {
    const dims = this.getGridDimensions();
    return {
      weeks: dims.cols - startWeek,
      cells: (dims.cols - startWeek) * 7
    };
  }

  getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  getMonthBoundaries() {
    const boundaries = [];

    for (let month = 0; month < 12; month++) {
      const firstOfMonth = moment(`${this.year}-${String(month + 1).padStart(2, '0')}-01`);
      const position = this.dateToGridPosition(firstOfMonth);

      boundaries.push({
        month: firstOfMonth.format('MMMM'),
        week: position.week,
        day: position.day
      });
    }

    return boundaries;
  }
}

export default GridCalculator;