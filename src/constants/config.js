/**
 * Application constants and configuration
 */

export const GRID_CONFIG = {
  ROWS: 7,
  WEEKS_PER_YEAR: 52,
  DAYS_PER_WEEK: 7,
};

export const PATTERN_CONFIG = {
  DEFAULT_INTENSITY: 3,
  MIN_INTENSITY: 1,
  MAX_INTENSITY: 20,
  LETTER_SPACING: 1,
  LETTER_HEIGHT: 7,
  LETTER_WIDTH: 5,
};

export const GITHUB_CONFIG = {
  API_URL: 'https://api.github.com/graphql',
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    BEARER_PREFIX: 'Bearer',
    JSON_CONTENT: 'application/json',
  },
};

export const FILE_PATHS = {
  DATA_FILE: './contribution-tracker.json',
  CONFIG_FILE: '.config.json',
  ENV_FILE: '.env',
  PACKAGE_JSON: '../../package.json',
  CUSTOM_PATTERN_DEFAULT: './patterns/custom.json',
  GIT_CONFIG: '.git/config',
};

export const ENV_DEFAULTS = {
  TEMPLATE_TOKEN: 'your_github_personal_access_token_here',
  TEMPLATE_USERNAME: 'your_github_username_here',
  TOKEN_KEY: 'GITHUB_TOKEN',
  USERNAME_KEY: 'GITHUB_USERNAME',
};

export const COMMIT_CONFIG = {
  MESSAGE_PREFIX: 'feat:',
  TIME_OFFSET_MINUTES: 30,
};

export const CLI_CONFIG = {
  DEFAULT_MODE: 'color',
  AVAILABLE_MODES: ['ascii', 'color', 'emoji'],
  FILE_ENCODING: 'utf-8',
  PROCESS_SIGNALS: ['SIGINT', 'SIGTERM'],
  PLATFORM_WIN32: 'win32',
  JSON_INDENT: 2,
  HISTORY_LIMIT: 100,
};

export const VISUALIZATION_CHARS = {
  ASCII: {
    EMPTY: '  ',
    LIGHT: '░░',
    MEDIUM: '▒▒',
    HEAVY: '▓▓',
    FULL: '██',
    FUTURE: '××',
  },
  EMOJI: {
    EMPTY: '⬜',
    LIGHT: '🟩',
    MEDIUM: '🟢',
    HEAVY: '🟣',
    FULL: '🔵',
    FUTURE: '❌',
  },
  COLOR: {
    BLOCK: '■',
    FUTURE: '×',
  },
  GRAPH: {
    BAR: '█',
  }
};

export const APP_INFO = {
  GITHUB_URL: 'https://github.com/muhammetalisongur/graphic-contribution-greening',
  REPO_NAME: 'graphic-contribution-greening',
  AUTHOR: 'muhammetalisongur',
};

export default {
  GRID_CONFIG,
  PATTERN_CONFIG,
  GITHUB_CONFIG,
  FILE_PATHS,
  ENV_DEFAULTS,
  COMMIT_CONFIG,
  CLI_CONFIG,
  VISUALIZATION_CHARS,
  APP_INFO,
};
