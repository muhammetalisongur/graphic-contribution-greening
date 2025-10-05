import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { FILE_PATHS, CLI_CONFIG, ENV_DEFAULTS, PATTERN_CONFIG } from '../constants/config.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INFO_MESSAGES } from '../constants/messages.js';
import CLI_MESSAGES from '../constants/cli-messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '../../', FILE_PATHS.CONFIG_FILE);
    this.envPath = path.join(__dirname, '../../', FILE_PATHS.ENV_FILE);
    this.config = this.loadConfig();
    dotenv.config({ path: this.envPath });
  }

  loadConfig() {
    try {
      if (fsSync.existsSync(this.configPath)) {
        const data = fsSync.readFileSync(this.configPath, CLI_CONFIG.FILE_ENCODING);
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.CONFIG_LOAD_ERROR + ':', error.message);
    }

    return {
      githubUsername: null,
      savedPatterns: [],
      preferences: {
        defaultYear: new Date().getFullYear(),
        defaultIntensity: PATTERN_CONFIG.DEFAULT_INTENSITY,
        colorMode: CLI_CONFIG.DEFAULT_MODE
      },
      history: []
    };
  }

  saveConfig() {
    try {
      fsSync.writeFileSync(this.configPath, JSON.stringify(this.config, null, CLI_CONFIG.JSON_INDENT));
      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.CONFIG_SAVE_ERROR + ':', error.message);
      return false;
    }
  }

  async load() {
    this.config = this.loadConfig();

    if (!fsSync.existsSync(this.envPath)) {
      // Automatically create .env file with template content
      await this.createTemplateEnvFile();
    }

    dotenv.config();
  }

  async createTemplateEnvFile() {
    const templateContent = `${CLI_MESSAGES.ENV_COMMENT_TOKEN}
${CLI_MESSAGES.ENV_COMMENT_REQUIRED}
#
${CLI_MESSAGES.ENV_COMMENT_QUICKLINK}
#
${CLI_MESSAGES.ENV_COMMENT_HOW_TO}
${CLI_MESSAGES.ENV_COMMENT_STEP1}
${CLI_MESSAGES.ENV_COMMENT_STEP2}
${CLI_MESSAGES.ENV_COMMENT_STEP3}
${CLI_MESSAGES.ENV_COMMENT_STEP4}
${CLI_MESSAGES.ENV_COMMENT_STEP5}
#
${ENV_DEFAULTS.TOKEN_KEY}=${ENV_DEFAULTS.TEMPLATE_TOKEN}

${CLI_MESSAGES.ENV_COMMENT_USERNAME}
${CLI_MESSAGES.ENV_COMMENT_DEFAULT_USERNAME}
${ENV_DEFAULTS.USERNAME_KEY}=${ENV_DEFAULTS.TEMPLATE_USERNAME}
`;

    try {
      await fs.writeFile(this.envPath, templateContent, CLI_CONFIG.FILE_ENCODING);
      console.log(chalk.gray('\n' + INFO_MESSAGES.ENV_FILE_CREATED));
      console.log(chalk.gray(INFO_MESSAGES.TOKEN_ADD_LATER + '\n'));
    } catch (error) {
      console.error(ERROR_MESSAGES.ENV_CREATE_ERROR + ':', error.message);
    }
  }

  async createEnvFile() {
    console.log(chalk.cyan(`\n${CLI_MESSAGES.TOKEN_CREATE_TITLE}`));
    console.log(chalk.blue(CLI_MESSAGES.TOKEN_CREATE_LINK));
    console.log(chalk.gray(CLI_MESSAGES.TOKEN_CREATE_STEP_1));
    console.log(chalk.gray(CLI_MESSAGES.TOKEN_CREATE_STEP_2));
    console.log(chalk.gray(CLI_MESSAGES.TOKEN_CREATE_STEP_3));
    console.log(chalk.gray(CLI_MESSAGES.TOKEN_CREATE_STEP_4));
    console.log(chalk.gray(CLI_MESSAGES.TOKEN_CREATE_STEP_5));

    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: CLI_MESSAGES.TOKEN_INPUT_PROMPT,
        mask: '*'
      }
    ]);

    const envContent = `${CLI_MESSAGES.ENV_COMMENT_TOKEN}
${CLI_MESSAGES.ENV_COMMENT_SCOPE}
${ENV_DEFAULTS.TOKEN_KEY}=${token}

${CLI_MESSAGES.ENV_COMMENT_USERNAME}
${ENV_DEFAULTS.USERNAME_KEY}=${this.config.githubUsername || ''}
`;

    fsSync.writeFileSync(this.envPath, envContent);
    console.log(chalk.green(`\n✓ ${SUCCESS_MESSAGES.ENV_CREATED}\n`));

    dotenv.config();
  }

  getGitHubToken() {
    const token = process.env[ENV_DEFAULTS.TOKEN_KEY];
    // Return null if token is empty or is the template value
    if (!token || token === ENV_DEFAULTS.TEMPLATE_TOKEN) {
      return null;
    }
    return token;
  }

  async setGitHubToken() {
    const currentToken = this.getGitHubToken();

    if (currentToken) {
      console.log(chalk.yellow(`\n${CLI_MESSAGES.TOKEN_EXISTING_FOUND}\n`));
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: CLI_MESSAGES.TOKEN_OVERWRITE_PROMPT,
          default: false
        }
      ]);

      if (!overwrite) return;
    }

    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: CLI_MESSAGES.TOKEN_INPUT_PROMPT,
        mask: '*',
        validate: input => input.length > 0 ? true : CLI_MESSAGES.TOKEN_VALIDATE_EMPTY
      }
    ]);

    let envContent = '';
    if (fsSync.existsSync(this.envPath)) {
      envContent = fsSync.readFileSync(this.envPath, CLI_CONFIG.FILE_ENCODING);
      const tokenRegex = new RegExp(`${ENV_DEFAULTS.TOKEN_KEY}=.*`, 'g');
      envContent = envContent.replace(tokenRegex, `${ENV_DEFAULTS.TOKEN_KEY}=${token}`);
    } else {
      envContent = `${ENV_DEFAULTS.TOKEN_KEY}=${token}\n`;
    }

    fsSync.writeFileSync(this.envPath, envContent);
    dotenv.config();

    console.log(chalk.green(`\n✓ ${SUCCESS_MESSAGES.TOKEN_SAVED}\n`));
  }

  getGitHubUsername() {
    const envUsername = process.env[ENV_DEFAULTS.USERNAME_KEY];
    const validEnvUsername = (envUsername && envUsername !== ENV_DEFAULTS.TEMPLATE_USERNAME) ? envUsername : null;
    return this.config.githubUsername || validEnvUsername || null;
  }

  setGitHubUsername(username) {
    this.config.githubUsername = username;
    this.saveConfig();

    if (fsSync.existsSync(this.envPath)) {
      let envContent = fsSync.readFileSync(this.envPath, CLI_CONFIG.FILE_ENCODING);

      const usernameRegex = new RegExp(`${ENV_DEFAULTS.USERNAME_KEY}=.*`, 'g');
      if (envContent.includes(`${ENV_DEFAULTS.USERNAME_KEY}=`)) {
        envContent = envContent.replace(usernameRegex, `${ENV_DEFAULTS.USERNAME_KEY}=${username}`);
      } else {
        envContent += `\n${ENV_DEFAULTS.USERNAME_KEY}=${username}\n`;
      }

      fsSync.writeFileSync(this.envPath, envContent);
    }
  }

  savePattern(name, patternData) {
    const pattern = {
      name,
      data: patternData,
      date: new Date().toISOString(),
      stats: this.calculatePatternStats(patternData)
    };

    const existingIndex = this.config.savedPatterns.findIndex(p => p.name === name);

    if (existingIndex >= 0) {
      this.config.savedPatterns[existingIndex] = pattern;
    } else {
      this.config.savedPatterns.push(pattern);
    }

    this.saveConfig();
  }

  loadPattern(name) {
    return this.config.savedPatterns.find(p => p.name === name);
  }

  getSavedPatterns() {
    return this.config.savedPatterns;
  }

  async clearSavedPatterns() {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.red(CLI_MESSAGES.SETTINGS_CONFIRM_CLEAR),
        default: false
      }
    ]);

    if (confirm) {
      this.config.savedPatterns = [];
      this.saveConfig();
      return true;
    }

    return false;
  }

  calculatePatternStats(patternData) {
    if (!Array.isArray(patternData) || patternData.length === 0) {
      return {
        totalCommits: 0,
        totalDays: 0,
        weekRange: null
      };
    }

    const weeks = patternData.map(p => p.week);
    const totalCommits = patternData.reduce((sum, p) => sum + (p.commits || 1), 0);

    return {
      totalCommits,
      totalDays: patternData.length,
      weekRange: {
        start: Math.min(...weeks),
        end: Math.max(...weeks)
      }
    };
  }

  addToHistory(action) {
    const entry = {
      action,
      timestamp: new Date().toISOString()
    };

    this.config.history.push(entry);

    if (this.config.history.length > CLI_CONFIG.HISTORY_LIMIT) {
      this.config.history = this.config.history.slice(-CLI_CONFIG.HISTORY_LIMIT);
    }

    this.saveConfig();
  }
}

export default ConfigManager;