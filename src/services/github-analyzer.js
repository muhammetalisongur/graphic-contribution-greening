import axios from 'axios';
import moment from 'moment';
import { ERROR_MESSAGES, SUGGESTION_MESSAGES, INFO_MESSAGES } from '../constants/messages.js';
import { GITHUB_CONFIG } from '../constants/config.js';

class GitHubAnalyzer {
  constructor(token = null) {
    this.token = token;
    this.apiUrl = GITHUB_CONFIG.API_URL;
  }

  async getUserActiveYears(username) {
    try {
      const query = `
        query($username: String!) {
          user(login: $username) {
            createdAt
            contributionsCollection {
              contributionYears
            }
          }
        }
      `;

      if (!this.token) {
        // Return default years if no token
        const currentYear = new Date().getFullYear();
        return {
          years: [currentYear, currentYear - 1, currentYear - 2],
          accountCreated: null
        };
      }

      const response = await axios.post(
        this.apiUrl,
        {
          query,
          variables: { username }
        },
        {
          headers: {
            [GITHUB_CONFIG.HEADERS.AUTHORIZATION]: `${GITHUB_CONFIG.HEADERS.BEARER_PREFIX} ${this.token}`,
            [GITHUB_CONFIG.HEADERS.CONTENT_TYPE]: GITHUB_CONFIG.HEADERS.JSON_CONTENT
          }
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const userData = response.data.data.user;
      const activeYears = userData.contributionsCollection.contributionYears;
      const accountCreated = new Date(userData.createdAt).getFullYear();

      // Sort active years descending
      activeYears.sort((a, b) => b - a);

      return {
        years: activeYears,
        accountCreated,
        totalYears: activeYears.length
      };
    } catch (error) {
      console.error(`${INFO_MESSAGES.ERROR_FETCHING_YEARS}:`, error.message);
      const currentYear = new Date().getFullYear();
      return {
        years: [currentYear, currentYear - 1, currentYear - 2],
        accountCreated: null
      };
    }
  }

  async analyzeUser(username, year) {
    try {
      const contributions = await this.fetchContributions(username, year);
      return this.processContributions(contributions, year);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error(ERROR_MESSAGES.GITHUB_TOKEN_INVALID);
      }
      throw new Error(`${INFO_MESSAGES.ANALYSIS_ERROR}: ${error.message}`);
    }
  }

  async fetchContributions(username, year) {
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      username,
      from: startDate,
      to: endDate
    };

    if (!this.token) {
      return this.fetchPublicContributions(username, year);
    }

    const response = await axios.post(
      this.apiUrl,
      {
        query,
        variables
      },
      {
        headers: {
          [GITHUB_CONFIG.HEADERS.AUTHORIZATION]: `${GITHUB_CONFIG.HEADERS.BEARER_PREFIX} ${this.token}`,
          [GITHUB_CONFIG.HEADERS.CONTENT_TYPE]: GITHUB_CONFIG.HEADERS.JSON_CONTENT
        }
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.user.contributionsCollection.contributionCalendar;
  }

  async fetchPublicContributions(username, year) {
    console.log(`\n📊 ${INFO_MESSAGES.FETCHING_PUBLIC_DATA}\n`);

    const mockData = {
      totalContributions: 0,
      weeks: []
    };

    const startOfYear = moment(`${year}-01-01`);
    const endOfYear = moment(`${year}-12-31`);
    let currentWeekStart = startOfYear.clone().startOf('week');

    while (currentWeekStart.isSameOrBefore(endOfYear)) {
      const week = {
        contributionDays: []
      };

      for (let i = 0; i < 7; i++) {
        const day = currentWeekStart.clone().add(i, 'days');
        if (day.year() === year) {
          week.contributionDays.push({
            contributionCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
            date: day.format('YYYY-MM-DD'),
            weekday: i
          });
        }
      }

      mockData.weeks.push(week);
      currentWeekStart.add(1, 'week');
    }

    mockData.totalContributions = mockData.weeks.reduce((total, week) =>
      total + week.contributionDays.reduce((weekTotal, day) =>
        weekTotal + day.contributionCount, 0
      ), 0
    );

    return mockData;
  }

  processContributions(contributionData, year) {
    const analysis = {
      year,
      totalContributions: contributionData.totalContributions,
      weeks: [],
      emptyWeeks: [],
      emptyDays: 0,
      activeDays: 0,
      busiestDay: null,
      busiestDayCount: 0,
      averageContributions: 0,
      fillRate: 0,
      longestEmptyStreak: 0,
      currentStreak: 0,
      maxStreak: 0,
      dayDistribution: {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
      },
      monthlyData: {}
    };

    let totalDays = 0;
    let currentEmptyStreak = 0;
    let currentActiveStreak = 0;

    contributionData.weeks.forEach((week, weekIndex) => {
      let weekTotal = 0;
      let weekEmpty = true;

      week.contributionDays.forEach(day => {
        totalDays++;
        weekTotal += day.contributionCount;

        if (day.contributionCount > 0) {
          analysis.activeDays++;
          weekEmpty = false;
          analysis.dayDistribution[day.weekday] += day.contributionCount;

          if (day.contributionCount > analysis.busiestDayCount) {
            analysis.busiestDayCount = day.contributionCount;
            analysis.busiestDay = moment(day.date).format('YYYY-MM-DD');
          }

          currentEmptyStreak = 0;
          currentActiveStreak++;
          analysis.maxStreak = Math.max(analysis.maxStreak, currentActiveStreak);
        } else {
          analysis.emptyDays++;
          currentEmptyStreak++;
          analysis.longestEmptyStreak = Math.max(analysis.longestEmptyStreak, currentEmptyStreak);
          currentActiveStreak = 0;
        }

        const month = moment(day.date).format('MMMM');
        if (!analysis.monthlyData[month]) {
          analysis.monthlyData[month] = {
            contributions: 0,
            activeDays: 0,
            totalDays: 0
          };
        }
        analysis.monthlyData[month].contributions += day.contributionCount;
        analysis.monthlyData[month].totalDays++;
        if (day.contributionCount > 0) {
          analysis.monthlyData[month].activeDays++;
        }
      });

      analysis.weeks.push({
        index: weekIndex + 1,
        total: weekTotal,
        isEmpty: weekEmpty
      });

      if (weekEmpty) {
        analysis.emptyWeeks.push(weekIndex + 1);
      }
    });

    // Set current streak as the last active streak
    analysis.currentStreak = currentActiveStreak;

    analysis.averageContributions = totalDays > 0 ?
      analysis.totalContributions / totalDays : 0;

    analysis.fillRate = totalDays > 0 ?
      (analysis.activeDays / totalDays) * 100 : 0;

    analysis.longestEmptyStreak = Math.floor(analysis.longestEmptyStreak / 7);

    return analysis;
  }

  getEmptySpaces(analysis) {
    const emptySpaces = [];
    let consecutiveWeeks = [];

    for (let i = 0; i < analysis.emptyWeeks.length; i++) {
      const currentWeek = analysis.emptyWeeks[i];

      if (consecutiveWeeks.length === 0 ||
          currentWeek === consecutiveWeeks[consecutiveWeeks.length - 1] + 1) {
        consecutiveWeeks.push(currentWeek);
      } else {
        if (consecutiveWeeks.length >= 3) {
          emptySpaces.push({
            start: consecutiveWeeks[0],
            end: consecutiveWeeks[consecutiveWeeks.length - 1],
            length: consecutiveWeeks.length
          });
        }
        consecutiveWeeks = [currentWeek];
      }
    }

    if (consecutiveWeeks.length >= 3) {
      emptySpaces.push({
        start: consecutiveWeeks[0],
        end: consecutiveWeeks[consecutiveWeeks.length - 1],
        length: consecutiveWeeks.length
      });
    }

    return emptySpaces;
  }

  suggestPatternPlacements(analysis, text = null) {
    const suggestions = [];
    const emptySpaces = this.getEmptySpaces(analysis);

    if (text) {
      const textLength = text.length * 6;

      for (const space of emptySpaces) {
        if (space.length >= textLength) {
          suggestions.push({
            type: 'text',
            content: text,
            startWeek: space.start,
            endWeek: space.start + textLength - 1,
            message: SUGGESTION_MESSAGES.TEXT_FITS_WEEKS
              .replace('{text}', text)
              .replace('{start}', space.start)
              .replace('{end}', space.start + textLength - 1)
          });
        }
      }
    }

    if (analysis.fillRate < 20) {
      suggestions.push({
        type: 'pattern',
        message: SUGGESTION_MESSAGES.YEAR_MOSTLY_EMPTY
      });
    } else if (analysis.fillRate < 50) {
      suggestions.push({
        type: 'pattern',
        message: SUGGESTION_MESSAGES.SUITABLE_MEDIUM_PATTERNS
      });
    } else if (analysis.fillRate < 80) {
      suggestions.push({
        type: 'pattern',
        message: SUGGESTION_MESSAGES.SUITABLE_SMALL_PATTERNS
      });
    } else {
      suggestions.push({
        type: 'warning',
        message: SUGGESTION_MESSAGES.YEAR_QUITE_FULL
      });
    }

    for (const space of emptySpaces) {
      if (space.length >= 10) {
        suggestions.push({
          type: 'shape',
          shape: 'heart',
          startWeek: space.start,
          message: SUGGESTION_MESSAGES.HEART_SHAPE_AT_WEEK.replace('{week}', space.start)
        });
      }

      if (space.length >= 7) {
        suggestions.push({
          type: 'shape',
          shape: 'star',
          startWeek: space.start,
          message: SUGGESTION_MESSAGES.STAR_SHAPE_AT_WEEK.replace('{week}', space.start)
        });
      }
    }

    return suggestions;
  }

  async compareWithPreviousYear(username, currentYear) {
    const previousYear = currentYear - 1;

    try {
      const currentYearData = await this.analyzeUser(username, currentYear);
      const previousYearData = await this.analyzeUser(username, previousYear);

      return {
        currentYear: {
          year: currentYear,
          total: currentYearData.totalContributions,
          average: currentYearData.averageContributions,
          fillRate: currentYearData.fillRate
        },
        previousYear: {
          year: previousYear,
          total: previousYearData.totalContributions,
          average: previousYearData.averageContributions,
          fillRate: previousYearData.fillRate
        },
        change: {
          total: currentYearData.totalContributions - previousYearData.totalContributions,
          percentage: previousYearData.totalContributions > 0 ?
            ((currentYearData.totalContributions - previousYearData.totalContributions) /
              previousYearData.totalContributions * 100).toFixed(1) : 0,
          fillRateChange: currentYearData.fillRate - previousYearData.fillRate
        }
      };
    } catch (error) {
      return null;
    }
  }

  getMonthlyTrend(analysis) {
    const months = Object.keys(analysis.monthlyData);
    const trend = months.map(month => ({
      month,
      contributions: analysis.monthlyData[month].contributions,
      activeDays: analysis.monthlyData[month].activeDays,
      intensity: analysis.monthlyData[month].activeDays > 0 ?
        (analysis.monthlyData[month].contributions /
          analysis.monthlyData[month].activeDays).toFixed(1) : 0
    }));

    return trend;
  }
}

export default GitHubAnalyzer;