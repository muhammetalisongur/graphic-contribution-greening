import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import moment from "moment";
import * as readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Visualizer from "./visualizer.js";
import GridCalculator from "../core/grid-calculator.js";
import GitHubAnalyzer from "../services/github-analyzer.js";
import PatternBuilder from "../core/pattern-builder.js";
import ConfigManager from "../services/config-manager.js";
import { FILE_PATHS, CLI_CONFIG, VISUALIZATION_CHARS } from "../constants/config.js";
import CLI_MESSAGES from "../constants/cli-messages.js";
import { execSync } from 'child_process';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
} from "../constants/messages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CLIInterface {
  constructor() {
    this.configManager = new ConfigManager();
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear;
    this.patterns = [];
    this.githubAnalyzer = null;

    // Get package info from package.json
    const packagePath = path.join(__dirname, FILE_PATHS.PACKAGE_JSON);
    const packageData = JSON.parse(fs.readFileSync(packagePath, CLI_CONFIG.FILE_ENCODING));
    this.version = packageData.version;
    this.appName = packageData.displayName || CLI_MESSAGES.DEFAULT_APP_NAME;

    // Graceful shutdown handlers
    this.setupExitHandlers();
  }

  getGitUsername() {
    try {
      // First try to get from git config origin URL
      const remoteUrl = execSync('git config --get remote.origin.url', { encoding: CLI_CONFIG.FILE_ENCODING }).trim();

      // Extract username from GitHub URL
      const match = remoteUrl.match(/github\.com[:/]([^/]+)\//);
      if (match && match[1]) {
        return match[1];
      }

      // If no remote URL, try to get global git user name
      const gitUser = execSync('git config --get user.name', { encoding: CLI_CONFIG.FILE_ENCODING }).trim();
      if (gitUser) {
        return gitUser;
      }
    } catch (error) {
      // Git config not found or not a git repo
    }
    return null;
  }

  setupExitHandlers() {
    // SIGINT (Ctrl+C) and SIGTERM handler
    const exitHandler = (signal) => {
      console.log(
        chalk.yellow(`\n\n👋 ${CLI_MESSAGES.EXIT_SHUTDOWN} (${signal})...\n`)
      );
      process.exit(0);
    };

    CLI_CONFIG.PROCESS_SIGNALS.forEach(signal => {
      process.on(signal, () => exitHandler(signal));
    });

    // Special handler for Windows
    if (process.platform === CLI_CONFIG.PLATFORM_WIN32) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.on("SIGINT", () => {
        process.emit("SIGINT");
      });
    }
  }

  async start() {
    try {
      console.clear();
      this.showBanner();

      await this.configManager.load();

      const mainChoice = await this.mainMenu();
      await this.handleMainChoice(mainChoice);
    } catch (error) {
      // User exited with Ctrl+C
      if (error.name === "ExitPromptError") {
        console.log(chalk.yellow(`\n\n👋 ${CLI_MESSAGES.EXIT_GOODBYE}\n`));
        process.exit(0);
      }
      // Other errors
      console.error(
        chalk.red(`\n❌ ${ERROR_MESSAGES.UNEXPECTED_ERROR}:`),
        error.message
      );
      process.exit(1);
    }
  }

  showBanner() {
    // Center the app name
    const appNamePadding = Math.floor((40 - this.appName.length) / 2);
    const appNameLine = " ".repeat(appNamePadding) + this.appName + " ".repeat(40 - appNamePadding - this.appName.length);

    // Center the version text
    const versionText = `v${this.version} - Interactive Mode`;
    const versionPadding = Math.floor((40 - versionText.length) / 2);
    const versionLine = " ".repeat(versionPadding) + versionText + " ".repeat(40 - versionPadding - versionText.length);

    console.log(chalk.cyan("╔════════════════════════════════════════╗"));
    console.log(
      chalk.cyan("║") +
        chalk.bold.yellow(appNameLine) +
        chalk.cyan("║")
    );
    console.log(
      chalk.cyan("║") +
        chalk.gray(versionLine) +
        chalk.cyan("║")
    );
    console.log(chalk.cyan("╚════════════════════════════════════════╝\n"));
  }

  async mainMenu() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: CLI_MESSAGES.MAIN_MENU_PROMPT,
        choices: [
          {
            name: "🎨 " + chalk.green(CLI_MESSAGES.MENU_CREATE_PATTERN),
            value: "create",
          },
          {
            name: "📊 " + chalk.blue(CLI_MESSAGES.MENU_ANALYZE_PROFILE),
            value: "analyze",
          },
          {
            name: "📂 " + chalk.yellow(CLI_MESSAGES.MENU_LOAD_PATTERN),
            value: "load",
          },
          {
            name: "⚙️  " + chalk.magenta(CLI_MESSAGES.MENU_SETTINGS),
            value: "settings",
          },
          { name: "❌ " + chalk.red(CLI_MESSAGES.MENU_EXIT), value: "exit" },
        ],
      },
    ]);

    return action;
  }

  async handleMainChoice(choice) {
    switch (choice) {
      case "create":
        await this.createPatternFlow();
        break;
      case "analyze":
        await this.analyzeProfile();
        break;
      case "load":
        await this.loadSavedPattern();
        break;
      case "settings":
        await this.showSettings();
        break;
      case "exit":
        console.log(chalk.yellow(`\n👋 ${CLI_MESSAGES.EXIT_GOODBYE}\n`));
        process.exit(0);
        break;
    }
  }

  async createPatternFlow() {
    // Get username if available
    const username = this.configManager.getGitHubUsername();

    // Select year with username
    const year = await this.selectYear(username);
    this.selectedYear = year;

    const patternBuilder = new PatternBuilder(year);
    const visualizer = new Visualizer(year);

    const { patternType } = await inquirer.prompt([
      {
        type: "list",
        name: "patternType",
        message: CLI_MESSAGES.PATTERN_TYPE_PROMPT,
        choices: [
          { name: "📝 " + CLI_MESSAGES.PATTERN_TYPE_TEXT, value: "text" },
          { name: "🎨 " + CLI_MESSAGES.PATTERN_TYPE_SHAPE, value: "shape" },
          { name: "🌊 " + CLI_MESSAGES.PATTERN_TYPE_EFFECT, value: "effect" },
          { name: "📊 " + CLI_MESSAGES.PATTERN_TYPE_MANUAL, value: "manual" },
          { name: "🎯 " + CLI_MESSAGES.PATTERN_TYPE_CUSTOM, value: "custom" },
        ],
      },
    ]);

    let patterns = [];

    switch (patternType) {
      case "text":
        patterns = await this.createTextPattern(patternBuilder);
        break;
      case "shape":
        patterns = await this.createShapePattern(patternBuilder);
        break;
      case "effect":
        patterns = await this.createEffectPattern(patternBuilder);
        break;
      case "manual":
        patterns = await this.createManualPattern(patternBuilder);
        break;
      case "custom":
        patterns = await this.createCustomPattern(patternBuilder);
        break;
    }

    if (patterns.length > 0) {
      visualizer.clearPatterns();
      visualizer.addPatterns(patterns);

      console.log(chalk.cyan(`\n📋 ${CLI_MESSAGES.PATTERN_PREVIEW}:\n`));
      visualizer.visualize("color");

      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: CLI_MESSAGES.PATTERN_CONFIRM_USE,
          default: true,
        },
      ]);

      if (confirm) {
        this.patterns = patterns;
        await this.finalizePattern();
      } else {
        // Pattern rejected, offer options
        const { nextAction } = await inquirer.prompt([
          {
            type: "list",
            name: "nextAction",
            message: CLI_MESSAGES.NEXT_ACTION_PROMPT,
            choices: [
              {
                name: "🔄 " + CLI_MESSAGES.ACTION_CREATE_NEW,
                value: "newPattern",
              },
              {
                name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_MENU,
                value: "mainMenu",
              },
              { name: "❌ " + CLI_MESSAGES.MENU_EXIT, value: "exit" },
            ],
          },
        ]);

        switch (nextAction) {
          case "newPattern":
            await this.createPatternFlow();
            break;
          case "mainMenu":
            await this.start();
            break;
          case "exit":
            console.log(chalk.yellow(`\n👋 ${CLI_MESSAGES.EXIT_GOODBYE}\n`));
            process.exit(0);
            break;
        }
      }
    } else {
      // No pattern could be created
      console.log(
        chalk.yellow(`\n⚠️  ${WARNING_MESSAGES.NO_PATTERN_CREATED}\n`)
      );

      const { nextAction } = await inquirer.prompt([
        {
          type: "list",
          name: "nextAction",
          message: CLI_MESSAGES.NEXT_ACTION_PROMPT,
          choices: [
            { name: "🔄 " + CLI_MESSAGES.ACTION_RETRY, value: "retry" },
            {
              name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_MENU,
              value: "mainMenu",
            },
            { name: "❌ " + CLI_MESSAGES.MENU_EXIT, value: "exit" },
          ],
        },
      ]);

      switch (nextAction) {
        case "retry":
          await this.createPatternFlow();
          break;
        case "mainMenu":
          await this.start();
          break;
        case "exit":
          console.log(chalk.yellow(`\n👋 ${CLI_MESSAGES.EXIT_GOODBYE}\n`));
          process.exit(0);
          break;
      }
    }
  }

  async createTextPattern(patternBuilder) {
    const { text } = await inquirer.prompt([
      {
        type: "input",
        name: "text",
        message: CLI_MESSAGES.TEXT_INPUT_PROMPT,
        validate: (input) =>
          input.length > 0 ? true : ERROR_MESSAGES.TEXT_EMPTY,
      },
    ]);

    const { startWeek } = await inquirer.prompt([
      {
        type: "number",
        name: "startWeek",
        message: CLI_MESSAGES.START_WEEK_PROMPT,
        default: 10,
        validate: (input) =>
          input >= 1 && input <= 52 ? true : ERROR_MESSAGES.INVALID_WEEK_RANGE,
      },
    ]);

    const { intensity } = await inquirer.prompt([
      {
        type: "list",
        name: "intensity",
        message: CLI_MESSAGES.INTENSITY_PROMPT,
        choices: [
          { name: CLI_MESSAGES.INTENSITY_LIGHT, value: 2 },
          { name: CLI_MESSAGES.INTENSITY_MEDIUM, value: 3 },
          { name: CLI_MESSAGES.INTENSITY_HEAVY, value: 4 },
        ],
      },
    ]);

    const { effects } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "effects",
        message: CLI_MESSAGES.EFFECTS_PROMPT,
        choices: [
          { name: CLI_MESSAGES.EFFECT_GRADIENT, value: "gradient" },
          { name: CLI_MESSAGES.EFFECT_ALTERNATING, value: "alternating" },
          { name: CLI_MESSAGES.EFFECT_SHADOW, value: "shadow" },
        ],
      },
    ]);

    return patternBuilder.createTextPattern(text, {
      startWeek,
      intensity,
      gradient: effects.includes("gradient"),
      alternating: effects.includes("alternating"),
      shadow: effects.includes("shadow"),
    });
  }

  async createShapePattern(patternBuilder) {
    const { shape } = await inquirer.prompt([
      {
        type: "list",
        name: "shape",
        message: CLI_MESSAGES.SHAPE_SELECT_PROMPT,
        choices: [
          { name: "❤️  " + CLI_MESSAGES.SHAPE_HEART, value: "heart" },
          { name: "⭐ " + CLI_MESSAGES.SHAPE_STAR, value: "star" },
          { name: "📐 " + CLI_MESSAGES.SHAPE_TRIANGLE, value: "triangle" },
          { name: "⬜ " + CLI_MESSAGES.SHAPE_SQUARE, value: "square" },
          { name: "🔷 " + CLI_MESSAGES.SHAPE_DIAMOND, value: "diamond" },
        ],
      },
    ]);

    const { startWeek } = await inquirer.prompt([
      {
        type: "number",
        name: "startWeek",
        message: CLI_MESSAGES.START_WEEK_PROMPT,
        default: 20,
        validate: (input) =>
          input >= 1 && input <= 52 ? true : ERROR_MESSAGES.INVALID_WEEK_RANGE,
      },
    ]);

    const { intensity } = await inquirer.prompt([
      {
        type: "number",
        name: "intensity",
        message: CLI_MESSAGES.INTENSITY_RANGE_PROMPT,
        default: 3,
        validate: (input) =>
          input >= 1 && input <= 4
            ? true
            : ERROR_MESSAGES.INVALID_INTENSITY_RANGE,
      },
    ]);

    return patternBuilder.createShapePattern(shape, startWeek, intensity);
  }

  async createEffectPattern(patternBuilder) {
    const { effect } = await inquirer.prompt([
      {
        type: "list",
        name: "effect",
        message: CLI_MESSAGES.EFFECT_SELECT_PROMPT,
        choices: [
          { name: "🌊 " + CLI_MESSAGES.EFFECT_WAVE, value: "wave" },
          {
            name: "♟️  " + CLI_MESSAGES.EFFECT_CHECKERBOARD,
            value: "checkerboard",
          },
          { name: "↗️  " + CLI_MESSAGES.EFFECT_DIAGONAL, value: "diagonal" },
          { name: "🌀 " + CLI_MESSAGES.EFFECT_SPIRAL, value: "spiral" },
          { name: "🔀 " + CLI_MESSAGES.EFFECT_RANDOM, value: "random" },
        ],
      },
    ]);

    return patternBuilder.createEffectPattern(effect);
  }

  async createManualPattern(patternBuilder) {
    console.log(chalk.yellow(`\n${CLI_MESSAGES.MANUAL_MODE_ENTER}`));
    console.log(chalk.gray(`${CLI_MESSAGES.MANUAL_MODE_DESC}\n`));

    const patterns = [];
    let addMore = true;

    while (addMore) {
      const { week, day, commits } = await inquirer.prompt([
        {
          type: "number",
          name: "week",
          message: CLI_MESSAGES.WEEK_PROMPT,
          validate: (input) =>
            input >= 1 && input <= 52
              ? true
              : ERROR_MESSAGES.INVALID_WEEK_RANGE,
        },
        {
          type: "list",
          name: "day",
          message: CLI_MESSAGES.DAY_PROMPT,
          choices: [
            { name: CLI_MESSAGES.DAY_SUNDAY, value: 0 },
            { name: CLI_MESSAGES.DAY_MONDAY, value: 1 },
            { name: CLI_MESSAGES.DAY_TUESDAY, value: 2 },
            { name: CLI_MESSAGES.DAY_WEDNESDAY, value: 3 },
            { name: CLI_MESSAGES.DAY_THURSDAY, value: 4 },
            { name: CLI_MESSAGES.DAY_FRIDAY, value: 5 },
            { name: CLI_MESSAGES.DAY_SATURDAY, value: 6 },
            { name: CLI_MESSAGES.DAY_ALL_WEEK, value: "all" },
          ],
        },
        {
          type: "number",
          name: "commits",
          message: CLI_MESSAGES.COMMIT_COUNT_PROMPT,
          default: 3,
          validate: (input) =>
            input >= 1 ? true : ERROR_MESSAGES.MIN_COMMIT_REQUIRED,
        },
      ]);

      if (day === "all") {
        for (let d = 0; d < 7; d++) {
          patterns.push({ week, day: d, commits });
        }
      } else {
        patterns.push({ week, day, commits });
      }

      const { more } = await inquirer.prompt([
        {
          type: "confirm",
          name: "more",
          message: CLI_MESSAGES.ADD_MORE_PATTERNS,
          default: false,
        },
      ]);

      addMore = more;
    }

    return patterns;
  }

  async createCustomPattern(patternBuilder) {
    console.log(chalk.yellow(`\n${CLI_MESSAGES.CUSTOM_ASCII_TITLE}`));
    console.log(chalk.gray(`${CLI_MESSAGES.CUSTOM_ASCII_DESC}\n`));

    const { method } = await inquirer.prompt([
      {
        type: "list",
        name: "method",
        message: CLI_MESSAGES.CUSTOM_METHOD_PROMPT,
        choices: [
          { name: CLI_MESSAGES.CUSTOM_METHOD_FILE, value: "file" },
          { name: CLI_MESSAGES.CUSTOM_METHOD_DRAW, value: "draw" },
        ],
      },
    ]);

    if (method === "file") {
      const { filepath } = await inquirer.prompt([
        {
          type: "input",
          name: "filepath",
          message: CLI_MESSAGES.FILE_PATH_PROMPT,
          default: FILE_PATHS.CUSTOM_PATTERN_DEFAULT,
        },
      ]);

      return patternBuilder.loadFromFile(filepath);
    } else {
      console.log(chalk.cyan(INFO_MESSAGES.FEATURE_COMING_SOON));
      return [];
    }
  }

  async selectYear(username = null) {
    const currentYear = new Date().getFullYear();
    let choices = [];
    let activeYearsData = null; // Function-wide accessible

    // If username and token exist, get user's active years
    if (username && this.configManager.getGitHubToken()) {
      const spinner = ora(CLI_MESSAGES.DETECTING_ACTIVE_YEARS).start();

      try {
        const analyzer = new GitHubAnalyzer(
          this.configManager.getGitHubToken()
        );
        activeYearsData = await analyzer.getUserActiveYears(username); // Defined outside for function-wide access
        spinner.succeed(SUCCESS_MESSAGES.ACTIVE_YEARS_FOUND);

        if (activeYearsData.years && activeYearsData.years.length > 0) {
          // Show user's active years
          choices = activeYearsData.years.map((year) => {
            if (year === currentYear) {
              return {
                name: chalk.green(`${year} ${CLI_MESSAGES.CURRENT_YEAR_LABEL}`),
                value: year,
              };
            } else if (year === activeYearsData.accountCreated) {
              return {
                name: chalk.blue(
                  `${year} ${CLI_MESSAGES.ACCOUNT_CREATED_LABEL}`
                ),
                value: year,
              };
            }
            return { name: `${year}`, value: year };
          });

          if (activeYearsData.accountCreated) {
            console.log(
              chalk.gray(
                `\n${CLI_MESSAGES.ACCOUNT_CREATED_IN} ${activeYearsData.accountCreated}`
              )
            );
            console.log(
              chalk.gray(
                `${CLI_MESSAGES.TOTAL_ACTIVE_YEARS} ${activeYearsData.totalYears}\n`
              )
            );
          }
        }
      } catch (error) {
        spinner.fail(WARNING_MESSAGES.ACTIVE_YEARS_FAILED);
      }
    }

    // If choices is empty or error occurred, use default list
    if (choices.length === 0) {
      choices = [
        {
          name: `${currentYear} ${CLI_MESSAGES.CURRENT_YEAR_LABEL}`,
          value: currentYear,
        },
        { name: `${currentYear - 1}`, value: currentYear - 1 },
        { name: `${currentYear - 2}`, value: currentYear - 2 },
      ];
    }

    // Add custom year entry option
    choices.push({
      name: chalk.yellow(CLI_MESSAGES.CUSTOM_YEAR_ENTRY),
      value: "custom",
    });

    const { year } = await inquirer.prompt([
      {
        type: "list",
        name: "year",
        message: CLI_MESSAGES.YEAR_SELECT_PROMPT,
        choices,
      },
    ]);

    if (year === "custom") {
      // Check account creation year
      let minYear = 2008;
      let warningMessage = "";

      if (activeYearsData && activeYearsData.accountCreated) {
        minYear = activeYearsData.accountCreated;
        warningMessage = chalk.yellow(
          `\n⚠️  ${WARNING_MESSAGES.ACCOUNT_CREATED_YEAR.replace(
            "{year}",
            minYear
          )}\n`
        );
      }

      if (warningMessage) {
        console.log(warningMessage);
      }

      const { customYear } = await inquirer.prompt([
        {
          type: "number",
          name: "customYear",
          message: CLI_MESSAGES.YEAR_INPUT_PROMPT,
          default: currentYear,
          validate: (input) => {
            if (input < minYear) {
              return chalk.red(
                ERROR_MESSAGES.YEAR_BEFORE_ACCOUNT.replace("{year}", minYear)
              );
            }
            if (input > currentYear) {
              return chalk.red(
                ERROR_MESSAGES.YEAR_IN_FUTURE.replace("{year}", currentYear)
              );
            }
            return true;
          },
        },
      ]);
      return customYear;
    }

    return year;
  }

  async handleAnalysisAction(analysis, username, year) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: CLI_MESSAGES.NEXT_ACTION_PROMPT,
        choices: [
          {
            name: "🎨 " + CLI_MESSAGES.ACTION_ADD_PATTERN_EMPTY,
            value: "addPattern",
          },
          {
            name: "💡 " + CLI_MESSAGES.ACTION_GET_SUGGESTION,
            value: "getSuggestion",
          },
          {
            name: "📊 " + CLI_MESSAGES.VIEW_MONTHLY_TREND,
            value: "monthlyTrend",
          },
          {
            name: "🔄 " + CLI_MESSAGES.COMPARE_WITH_PREVIOUS_YEAR,
            value: "compareYears",
          },
          { name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_MENU, value: "back" },
        ],
      },
    ]);

    if (action === "addPattern") {
      await this.createPatternFlow();
    } else if (action === "getSuggestion") {
      await this.showSuggestions(analysis);

      // Ask what to do after suggestions
      const { nextAction } = await inquirer.prompt([
        {
          type: "list",
          name: "nextAction",
          message: `\n${CLI_MESSAGES.NEXT_ACTION_PROMPT}`,
          choices: [
            {
              name: "🎨 " + CLI_MESSAGES.ACTION_CREATE_PATTERN,
              value: "create",
            },
            { name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_MENU, value: "menu" },
          ],
        },
      ]);

      if (nextAction === "create") {
        await this.createPatternFlow();
      } else {
        await this.start();
      }
    } else if (action === "monthlyTrend") {
      this.showMonthlyTrend(analysis);

      // Ask what to do after showing monthly trend
      const { nextAction } = await inquirer.prompt([
        {
          type: "list",
          name: "nextAction",
          message: CLI_MESSAGES.AFTER_MONTHLY_TREND_PROMPT,
          choices: [
            {
              name: "📊 " + CLI_MESSAGES.ACTION_VIEW_ANALYSIS_AGAIN,
              value: "viewAnalysis",
            },
            {
              name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_ANALYSIS_MENU,
              value: "analysisMenu",
            },
            {
              name: "🏠 " + CLI_MESSAGES.ACTION_RETURN_MENU,
              value: "mainMenu",
            },
          ],
        },
      ]);

      if (nextAction === "viewAnalysis") {
        // Re-show analysis results and menu
        this.showAnalysisResults(analysis);
        await this.handleAnalysisAction(analysis, username, year);
      } else if (nextAction === "analysisMenu") {
        await this.handleAnalysisAction(analysis, username, year);
      } else {
        await this.start();
      }
    } else if (action === "compareYears") {
      await this.showYearComparison(username, year);

      // Ask what to do after showing year comparison
      const { nextAction } = await inquirer.prompt([
        {
          type: "list",
          name: "nextAction",
          message: CLI_MESSAGES.AFTER_YEAR_COMPARISON_PROMPT,
          choices: [
            {
              name: "📊 " + CLI_MESSAGES.ACTION_VIEW_ANALYSIS_AGAIN,
              value: "viewAnalysis",
            },
            {
              name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_ANALYSIS_MENU,
              value: "analysisMenu",
            },
            {
              name: "🏠 " + CLI_MESSAGES.ACTION_RETURN_MENU,
              value: "mainMenu",
            },
          ],
        },
      ]);

      if (nextAction === "viewAnalysis") {
        // Re-show analysis results and menu
        this.showAnalysisResults(analysis);
        await this.handleAnalysisAction(analysis, username, year);
      } else if (nextAction === "analysisMenu") {
        await this.handleAnalysisAction(analysis, username, year);
      } else {
        await this.start();
      }
    } else {
      await this.start();
    }
  }

  async analyzeProfile() {
    const username = await this.getGitHubUsername();
    const token = this.configManager.getGitHubToken();

    if (!token) {
      console.log(chalk.yellow(`\n⚠️  ${WARNING_MESSAGES.TOKEN_NOT_FOUND}`));
      console.log(chalk.gray(`${INFO_MESSAGES.TOKEN_SETUP_HINT}\n`));

      const { addToken } = await inquirer.prompt([
        {
          type: "confirm",
          name: "addToken",
          message: CLI_MESSAGES.ADD_TOKEN_NOW,
          default: false,
        },
      ]);

      if (addToken) {
        await this.configManager.setGitHubToken();
      } else {
        console.log(chalk.yellow(`\n⚠️  ${WARNING_MESSAGES.TOKEN_NOT_FOUND}`));
        console.log(chalk.gray(`${INFO_MESSAGES.TOKEN_SETUP_HINT}\n`));

        const { nextAction } = await inquirer.prompt([
          {
            type: "list",
            name: "nextAction",
            message: CLI_MESSAGES.NEXT_ACTION_PROMPT,
            choices: [
              { name: "⚙️  " + CLI_MESSAGES.MENU_SETTINGS, value: "settings" },
              {
                name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_MENU,
                value: "mainMenu",
              },
              { name: "❌ " + CLI_MESSAGES.MENU_EXIT, value: "exit" },
            ],
          },
        ]);

        switch (nextAction) {
          case "settings":
            await this.showSettings();
            break;
          case "mainMenu":
            await this.start();
            break;
          case "exit":
            console.log(chalk.yellow(`\n👋 ${CLI_MESSAGES.EXIT_GOODBYE}\n`));
            process.exit(0);
            break;
        }
        return;
      }
    }

    // Select year with username (show active years)
    const year = await this.selectYear(username);
    this.githubAnalyzer = new GitHubAnalyzer(token);

    const spinner = ora(CLI_MESSAGES.ANALYZING_PROFILE).start();

    try {
      const analysis = await this.githubAnalyzer.analyzeUser(username, year);
      spinner.succeed(SUCCESS_MESSAGES.ANALYSIS_COMPLETE);

      this.showAnalysisResults(analysis);

      // Use the new handleAnalysisAction method
      await this.handleAnalysisAction(analysis, username, year);
    } catch (error) {
      spinner.fail(ERROR_MESSAGES.ANALYSIS_FAILED);
      console.error(chalk.red(error.message));
    }
  }

  showAnalysisResults(analysis) {
    console.log(chalk.cyan(`\n📊 ${CLI_MESSAGES.ANALYSIS_RESULTS_TITLE}:\n`));
    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.TOTAL_CONTRIBUTIONS}: ${chalk.bold(
          analysis.totalContributions
        )}`
      )
    );
    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.ACTIVE_DAYS}: ${chalk.bold(analysis.activeDays)}`
      )
    );
    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.EMPTY_DAYS}: ${chalk.bold(analysis.emptyDays)}`
      )
    );
    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.BUSIEST_DAY}: ${chalk.bold(analysis.busiestDay)}`
      )
    );
    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.AVERAGE_CONTRIBUTIONS}: ${chalk.bold(
          analysis.averageContributions.toFixed(2)
        )}`
      )
    );
    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.CURRENT_STREAK}: ${chalk.bold(analysis.currentStreak)} days`
      )
    );
    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.MAX_STREAK}: ${chalk.bold(analysis.maxStreak)} days`
      )
    );

    if (analysis.emptyWeeks.length > 0) {
      console.log(
        chalk.white(
          `  • ${CLI_MESSAGES.EMPTY_WEEKS}: ${chalk.bold(
            analysis.emptyWeeks.join(", ")
          )}`
        )
      );
    }

    console.log(
      chalk.white(
        `  • ${CLI_MESSAGES.FILL_RATE}: ${chalk.bold(
          analysis.fillRate.toFixed(1) + "%"
        )}\n`
      )
    );
  }

  showMonthlyTrend(analysis) {
    console.log(chalk.cyan(`\n📊 ${CLI_MESSAGES.VIEW_MONTHLY_TREND}:\n`));

    const trend = this.githubAnalyzer.getMonthlyTrend(analysis);

    trend.forEach(month => {
      const barLength = Math.ceil(month.intensity * 10);
      const bar = VISUALIZATION_CHARS.GRAPH.BAR.repeat(Math.max(1, barLength));

      console.log(
        chalk.white(
          `  ${month.month.padEnd(10)} ${chalk.green(bar)} ${month.contributions} commits (${month.activeDays} days)`
        )
      );
    });

    console.log("");
  }

  async showYearComparison(username, currentYear) {
    const spinner = ora(CLI_MESSAGES.COMPARING_WITH_PREVIOUS_YEAR).start();

    try {
      const comparison = await this.githubAnalyzer.compareWithPreviousYear(username, currentYear);

      if (comparison) {
        spinner.succeed(CLI_MESSAGES.COMPARISON_COMPLETE);
        console.log(chalk.cyan(`\n🔄 ${CLI_MESSAGES.COMPARE_WITH_PREVIOUS_YEAR}:\n`));

        console.log(chalk.white(`  ${comparison.previousYear.year}:`));
        console.log(chalk.gray(`    • ${CLI_MESSAGES.COMPARISON_TOTAL}: ${comparison.previousYear.total}`));
        console.log(chalk.gray(`    • ${CLI_MESSAGES.COMPARISON_AVERAGE}: ${comparison.previousYear.average.toFixed(2)}`));
        console.log(chalk.gray(`    • ${CLI_MESSAGES.COMPARISON_FILL_RATE}: ${comparison.previousYear.fillRate.toFixed(1)}%\n`));

        console.log(chalk.white(`  ${comparison.currentYear.year}:`));
        console.log(chalk.gray(`    • ${CLI_MESSAGES.COMPARISON_TOTAL}: ${comparison.currentYear.total}`));
        console.log(chalk.gray(`    • ${CLI_MESSAGES.COMPARISON_AVERAGE}: ${comparison.currentYear.average.toFixed(2)}`));
        console.log(chalk.gray(`    • ${CLI_MESSAGES.COMPARISON_FILL_RATE}: ${comparison.currentYear.fillRate.toFixed(1)}%\n`));

        const changeIcon = comparison.change.total > 0 ? '📈' : '📉';
        const changeColor = comparison.change.total > 0 ? chalk.green : chalk.red;

        console.log(chalk.white(`  ${CLI_MESSAGES.COMPARISON_CHANGE}:`));
        console.log(changeColor(`    ${changeIcon} ${CLI_MESSAGES.COMPARISON_TOTAL}: ${comparison.change.total > 0 ? '+' : ''}${comparison.change.total} (${comparison.change.percentage}%)`));
        console.log(changeColor(`    ${changeIcon} ${CLI_MESSAGES.COMPARISON_FILL_RATE}: ${comparison.change.fillRateChange > 0 ? '+' : ''}${comparison.change.fillRateChange.toFixed(1)}%`));
      } else {
        spinner.fail(CLI_MESSAGES.COULD_NOT_COMPARE_YEARS);
      }
    } catch (error) {
      spinner.fail(CLI_MESSAGES.COMPARISON_FAILED);
    }

    console.log("");
  }

  async showSuggestions(analysis) {
    console.log(chalk.cyan(`\n💡 ${CLI_MESSAGES.SUGGESTIONS_TITLE}:\n`));

    // Get pattern placement suggestions
    const suggestions = this.githubAnalyzer.suggestPatternPlacements(analysis);

    // Show fill rate based suggestions
    const fillSuggestion = suggestions.find(s => s.type === 'pattern' || s.type === 'warning');
    if (fillSuggestion) {
      const color = fillSuggestion.type === 'warning' ? chalk.yellow : chalk.green;
      console.log(color(`  ${fillSuggestion.type === 'warning' ? '⚠' : '✓'} ${fillSuggestion.message}`));
    }

    // Show empty weeks
    if (analysis.emptyWeeks.length > 10) {
      const startWeek = analysis.emptyWeeks[0];
      const endWeek = analysis.emptyWeeks[Math.min(9, analysis.emptyWeeks.length - 1)];
      console.log(
        chalk.green(
          `  ✓ ${CLI_MESSAGES.SUGGESTION_EMPTY_WEEKS.replace(
            "{start}",
            startWeek
          ).replace("{end}", endWeek)}`
        )
      );
    }

    // Show shape placement suggestions
    const shapeSuggestions = suggestions.filter(s => s.type === 'shape');
    if (shapeSuggestions.length > 0) {
      console.log(chalk.blue(`\n  📍 ${CLI_MESSAGES.SHAPE_PLACEMENTS_TITLE}`));
      shapeSuggestions.slice(0, 3).forEach(suggestion => {
        console.log(chalk.gray(`     • ${suggestion.message}`));
      });
    }

    // Ask if user wants to test with a text
    const { wantTextSuggestion } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'wantTextSuggestion',
        message: CLI_MESSAGES.TEXT_PLACEMENT_PROMPT,
        default: false
      }
    ]);

    if (wantTextSuggestion) {
      const { text } = await inquirer.prompt([
        {
          type: 'input',
          name: 'text',
          message: CLI_MESSAGES.TEXT_INPUT_FOR_PLACEMENT,
          validate: input => input.length > 0 && input.length <= 10 ? true : CLI_MESSAGES.TEXT_LENGTH_VALIDATION
        }
      ]);

      // Get text placement suggestions
      const textSuggestions = this.githubAnalyzer.suggestPatternPlacements(analysis, text);
      const textPlacements = textSuggestions.filter(s => s.type === 'text');

      if (textPlacements.length > 0) {
        console.log(chalk.green(`\n  ✓ ${CLI_MESSAGES.TEXT_PLACEMENT_OPTIONS.replace('{text}', text)}`));
        textPlacements.forEach(placement => {
          console.log(chalk.gray(`     • ${placement.message}`));
        });
      } else {
        console.log(chalk.yellow(`\n  ⚠ ${CLI_MESSAGES.NO_SUITABLE_SPACE.replace('{text}', text).replace('{weeks}', text.length * 6)}`));
      }
    }

    console.log("");
  }

  async getGitHubUsername() {
    const savedUsername = this.configManager.getGitHubUsername();
    const gitUsername = this.getGitUsername();

    // Use git username if saved username is not available
    const defaultUsername = savedUsername || gitUsername || "";

    const { username } = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: CLI_MESSAGES.GITHUB_USERNAME_PROMPT,
        default: defaultUsername,
        validate: (input) =>
          input.length > 0 ? true : ERROR_MESSAGES.USERNAME_EMPTY,
      },
    ]);

    if (username !== savedUsername) {
      this.configManager.setGitHubUsername(username);
    }

    return username;
  }

  async loadSavedPattern() {
    const savedPatterns = this.configManager.getSavedPatterns();

    if (savedPatterns.length === 0) {
      console.log(
        chalk.yellow(`\n⚠️  ${WARNING_MESSAGES.NO_SAVED_PATTERNS}\n`)
      );

      const { nextAction } = await inquirer.prompt([
        {
          type: "list",
          name: "nextAction",
          message: CLI_MESSAGES.NEXT_ACTION_PROMPT,
          choices: [
            { name: "🎨 " + CLI_MESSAGES.ACTION_CREATE_NEW, value: "create" },
            {
              name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_MENU,
              value: "mainMenu",
            },
          ],
        },
      ]);

      if (nextAction === "create") {
        await this.createPatternFlow();
      } else {
        await this.start();
      }
      return;
    }

    const { patternName } = await inquirer.prompt([
      {
        type: "list",
        name: "patternName",
        message: CLI_MESSAGES.PATTERN_SELECT_PROMPT,
        choices: savedPatterns.map((p) => ({
          name: `${p.name} (${p.date})`,
          value: p.name,
        })),
      },
    ]);

    const pattern = this.configManager.loadPattern(patternName);
    if (pattern) {
      this.patterns = pattern.data;
      console.log(
        chalk.green(
          `\n✓ ${SUCCESS_MESSAGES.PATTERN_LOADED.replace(
            "{name}",
            patternName
          )}\n`
        )
      );
      await this.finalizePattern();
    }
  }

  async showSettings() {
    const { setting } = await inquirer.prompt([
      {
        type: "list",
        name: "setting",
        message: CLI_MESSAGES.SETTINGS_MENU_TITLE,
        choices: [
          { name: "🔑 " + CLI_MESSAGES.SETTINGS_SET_TOKEN, value: "token" },
          {
            name: "👤 " + CLI_MESSAGES.SETTINGS_SET_USERNAME,
            value: "username",
          },
          {
            name: "🗑️  " + CLI_MESSAGES.SETTINGS_CLEAR_PATTERNS,
            value: "clearPatterns",
          },
          { name: "↩️  " + CLI_MESSAGES.ACTION_BACK, value: "back" },
        ],
      },
    ]);

    switch (setting) {
      case "token":
        await this.configManager.setGitHubToken();
        break;
      case "username":
        await this.getGitHubUsername();
        break;
      case "clearPatterns":
        await this.configManager.clearSavedPatterns();
        console.log(chalk.green(`\n✓ ${SUCCESS_MESSAGES.PATTERNS_CLEARED}\n`));
        break;
      case "back":
        break;
    }

    await this.start();
  }

  async finalizePattern() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: CLI_MESSAGES.PATTERN_READY_PROMPT,
        choices: [
          { name: "📤 " + CLI_MESSAGES.ACTION_PUSH_GITHUB, value: "push" },
          { name: "💾 " + CLI_MESSAGES.ACTION_SAVE_AND_PUSH, value: "save" },
          { name: "📥 " + CLI_MESSAGES.ACTION_SAVE_ONLY, value: "saveOnly" },
          { name: "🔄 " + CLI_MESSAGES.ACTION_EDIT_AGAIN, value: "edit" },
          { name: "❌ " + CLI_MESSAGES.ACTION_CANCEL, value: "cancel" },
        ],
      },
    ]);

    switch (action) {
      case "push":
        await this.pushToGitHub();
        break;
      case "save":
        await this.savePattern();
        await this.pushToGitHub();
        break;
      case "saveOnly":
        await this.savePattern();
        break;
      case "edit":
        await this.createPatternFlow();
        break;
      case "cancel":
        console.log(
          chalk.yellow(`\n⚠️  ${WARNING_MESSAGES.OPERATION_CANCELLED}\n`)
        );
        break;
    }

    // Offer options in every case
    if (action !== "cancel") {
      const { nextAction } = await inquirer.prompt([
        {
          type: "list",
          name: "nextAction",
          message: CLI_MESSAGES.NEXT_ACTION_PROMPT,
          choices: [
            {
              name: "🎨 " + CLI_MESSAGES.ACTION_CREATE_NEW,
              value: "newPattern",
            },
            {
              name: "↩️  " + CLI_MESSAGES.ACTION_RETURN_MENU,
              value: "mainMenu",
            },
            { name: "❌ " + CLI_MESSAGES.MENU_EXIT, value: "exit" },
          ],
        },
      ]);

      switch (nextAction) {
        case "newPattern":
          await this.createPatternFlow();
          break;
        case "mainMenu":
          await this.start();
          break;
        case "exit":
          console.log(chalk.yellow(`\n👋 ${CLI_MESSAGES.EXIT_GOODBYE}\n`));
          process.exit(0);
          break;
      }
    } else {
      // Cancelled, return to main menu
      await this.start();
    }
  }

  async savePattern() {
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: CLI_MESSAGES.PATTERN_NAME_PROMPT,
        default: `pattern_${Date.now()}`,
        validate: (input) =>
          input.length > 0 ? true : ERROR_MESSAGES.NAME_EMPTY,
      },
    ]);

    this.configManager.savePattern(name, this.patterns);
    console.log(
      chalk.green(
        `\n✓ ${SUCCESS_MESSAGES.PATTERN_SAVED.replace("{name}", name)}\n`
      )
    );
  }

  async pushToGitHub() {
    console.log(
      chalk.yellow(`\n⚠️  ${WARNING_MESSAGES.COMMITS_WILL_BE_CREATED}`)
    );

    // Calculate future commits before showing summary
    const today = moment();
    const gridCalc = new GridCalculator(this.selectedYear);
    let futureCommitCount = 0;
    let validCommitCount = 0;

    for (const pattern of this.patterns) {
      const targetDate = gridCalc.weekDayToDate(pattern.week, pattern.day);
      if (targetDate && targetDate.isAfter(today, "day")) {
        futureCommitCount += pattern.commits || 1;
      } else if (targetDate && targetDate.year() === this.selectedYear) {
        validCommitCount += pattern.commits || 1;
      }
    }

    // Show pattern details
    const totalCommits = this.patterns.reduce(
      (sum, p) => sum + (p.commits || 1),
      0
    );
    const weeks = [...new Set(this.patterns.map((p) => p.week))].sort(
      (a, b) => a - b
    );

    console.log(chalk.gray(`\n${CLI_MESSAGES.SUMMARY_TITLE}:`));
    console.log(
      chalk.gray(
        `  • ${CLI_MESSAGES.TOTAL_PATTERN_POINTS}: ${this.patterns.length}`
      )
    );
    console.log(
      chalk.gray(`  • ${CLI_MESSAGES.TOTAL_COMMITS}: ${totalCommits}`)
    );

    if (futureCommitCount > 0) {
      console.log(
        chalk.green(`  • ${CLI_MESSAGES.VALID_COMMITS}: ${validCommitCount}`)
      );
      console.log(
        chalk.red(
          `  • ${CLI_MESSAGES.FUTURE_COMMITS}: ${futureCommitCount} (will be skipped)`
        )
      );
    }

    console.log(
      chalk.gray(
        `  • ${CLI_MESSAGES.WEEK_RANGE}: ${weeks[0]}-${weeks[weeks.length - 1]}`
      )
    );
    console.log(
      chalk.gray(`  • ${CLI_MESSAGES.SELECTED_YEAR}: ${this.selectedYear}\n`)
    );

    // Check account creation year
    const username = this.configManager.getGitHubUsername();
    if (username && this.configManager.getGitHubToken()) {
      try {
        const analyzer = new GitHubAnalyzer(
          this.configManager.getGitHubToken()
        );
        const activeYearsData = await analyzer.getUserActiveYears(username);

        if (
          activeYearsData.accountCreated &&
          this.selectedYear < activeYearsData.accountCreated
        ) {
          console.log(
            chalk.red(
              `\n⛔ ${WARNING_MESSAGES.ACCOUNT_OPENED_WARNING.replace(
                "{year}",
                activeYearsData.accountCreated
              )}`
            )
          );
          console.log(
            chalk.red(
              `${WARNING_MESSAGES.COMMIT_SUSPICIOUS.replace(
                "{year}",
                this.selectedYear
              )}\n`
            )
          );

          const { continueAnyway } = await inquirer.prompt([
            {
              type: "confirm",
              name: "continueAnyway",
              message: chalk.yellow(CLI_MESSAGES.CONTINUE_ANYWAY),
              default: false,
            },
          ]);

          if (!continueAnyway) {
            console.log(
              chalk.yellow(
                `\n✓ ${SUCCESS_MESSAGES.OPERATION_CANCELLED_RIGHT_CHOICE}\n`
              )
            );
            await this.start();
            return;
          }
        }
      } catch (error) {
        // Silently continue
      }
    }

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: CLI_MESSAGES.CONFIRM_CONTINUE,
        default: false,
      },
    ]);

    if (confirm) {
      const spinner = ora(CLI_MESSAGES.CREATING_COMMITS).start();

      try {
        // Call generateContributions function
        const { default: simpleGit } = await import("simple-git");
        const git = simpleGit();
        const gridCalc = new GridCalculator(this.selectedYear);

        let processedCount = 0;
        const totalCommits = this.patterns.reduce(
          (sum, p) => sum + (p.commits || 1),
          0
        );

        spinner.text = CLI_MESSAGES.PROCESSING_COMMITS.replace(
          "{current}",
          "0"
        ).replace("{total}", totalCommits);

        const today = moment();
        let skippedFutureCommits = 0;

        for (const pattern of this.patterns) {
          const targetDate = gridCalc.weekDayToDate(pattern.week, pattern.day);

          if (!targetDate || targetDate.year() !== this.selectedYear) {
            continue;
          }

          // Skip future dates
          if (targetDate.isAfter(today, "day")) {
            skippedFutureCommits += pattern.commits || 1;
            continue;
          }

          // Create specified number of commits for each pattern
          for (let i = 1; i <= (pattern.commits || 1); i++) {
            const commitTime = targetDate.clone().add(i * 30, "minutes");

            // Final check: ensure commit time is not in the future
            if (commitTime.isAfter(today)) {
              skippedFutureCommits++;
              continue;
            }

            // Update contribution-tracker.json
            const data = {
              date: commitTime.format(),
              week: pattern.week,
              day: pattern.day,
              commit: i,
              total: pattern.commits || 1,
            };

            await this.writeContributionData(data);

            // Create git commit
            await git
              .add([FILE_PATHS.DATA_FILE])
              .commit(`feat: w${pattern.week}d${pattern.day} commit ${i}`, {
                "--date": commitTime.format(),
              });

            processedCount++;
            spinner.text = CLI_MESSAGES.PROCESSING_COMMITS.replace(
              "{current}",
              processedCount
            ).replace("{total}", totalCommits);
          }
        }

        spinner.text = CLI_MESSAGES.PUSHING_TO_GITHUB;

        // Push to GitHub
        await git.push();

        spinner.succeed(
          SUCCESS_MESSAGES.PUSH_SUCCESS.replace("{count}", processedCount)
        );
        console.log(
          chalk.green(`\n✓ ${SUCCESS_MESSAGES.ALL_COMMITS_UPLOADED}\n`)
        );

        const username = this.configManager.getGitHubUsername();
        if (username) {
          console.log(
            chalk.cyan(
              `${CLI_MESSAGES.CHECK_PROFILE}: https://github.com/${username}`
            )
          );
        }
      } catch (error) {
        spinner.fail(ERROR_MESSAGES.OPERATION_FAILED);
        console.error(
          chalk.red(`\n❌ ${ERROR_MESSAGES.ERROR_LABEL}:`),
          error.message
        );
        console.log(chalk.yellow(`\n${CLI_MESSAGES.SUGGESTIONS_TITLE}:`));
        console.log(`  1. ${CLI_MESSAGES.SUGGESTION_CHECK_GIT_REPO}`);
        console.log(`  2. ${CLI_MESSAGES.SUGGESTION_CHECK_PUSH_PERMISSION}`);
        console.log(`  3. ${CLI_MESSAGES.SUGGESTION_CHECK_FILE_WRITABLE}`);
      }
    } else {
      console.log(
        chalk.yellow(`\n⚠️  ${WARNING_MESSAGES.OPERATION_CANCELLED}\n`)
      );
    }
  }

  async writeContributionData(data) {
    const { default: jsonfile } = await import("jsonfile");

    return new Promise((resolve, reject) => {
      jsonfile.writeFile(FILE_PATHS.DATA_FILE, data, (error) => {
        error ? reject(error) : resolve();
      });
    });
  }
}

export default CLIInterface;
