/**
 * Application messages for errors, warnings, success, and info notifications
 */

export const ERROR_MESSAGES = {
  // GitHub API errors
  GITHUB_TOKEN_INVALID: 'GitHub token is invalid or missing',
  GITHUB_TOKEN_REQUIRED: 'GitHub token is required for this operation',
  GITHUB_API_ERROR: 'GitHub API error occurred',
  GITHUB_RATE_LIMIT: 'GitHub API rate limit exceeded',
  GITHUB_USER_NOT_FOUND: 'GitHub user not found',
  GITHUB_UNAUTHORIZED: 'Unauthorized: Please check your GitHub token',

  // Pattern validation errors
  INVALID_WEEK: 'Invalid week number (must be 1-52)',
  INVALID_WEEK_RANGE: 'Please enter a value between 1 and 52!',
  INVALID_DAY: 'Invalid day (must be 0-6)',
  INVALID_COMMITS: 'Invalid commit count (must be >= 1)',
  INVALID_INTENSITY_RANGE: 'Please enter a value between 1 and 4!',
  PATTERN_TOO_LARGE: 'Pattern exceeds available grid space',
  PATTERN_EMPTY: 'Pattern is empty',
  PATTERN_INVALID_FORMAT: 'Pattern has invalid format',
  PATTERN_VALIDATION_ERROR: 'Pattern validation error',
  TEXT_EMPTY: 'Text cannot be empty!',
  TEXT_TOO_LONG: 'Text "{text}" requires {required} weeks but only {available} weeks available from week {start}',
  MIN_COMMIT_REQUIRED: 'Must be at least 1 commit!',
  DATE_WRONG_YEAR: 'Date must be in year {year}',

  // File errors
  FILE_NOT_FOUND: 'File not found',
  FILE_READ_ERROR: 'Failed to read file',
  FILE_WRITE_ERROR: 'Failed to write file',

  // Config errors
  CONFIG_LOAD_ERROR: 'Failed to load configuration',
  CONFIG_SAVE_ERROR: 'Failed to save configuration',
  ENV_CREATE_ERROR: 'Error creating .env file',

  // Date errors
  INVALID_DATE: 'Invalid date',
  FUTURE_DATE: 'Cannot create commits in the future',
  DATE_OUT_OF_RANGE: 'Date is before account creation year',
  DATE_BEFORE_ACCOUNT: 'Date is before your GitHub account was created',
  YEAR_BEFORE_ACCOUNT: 'Your account created year is {year}. Cannot create commits before that!',
  YEAR_IN_FUTURE: 'Cannot create commits in the future year (after {year})!',

  // General errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  UNEXPECTED_ERROR: 'An error occurred',
  OPERATION_CANCELLED: 'Operation cancelled by user',
  OPERATION_FAILED: 'Operation failed',
  USERNAME_EMPTY: 'Username cannot be empty!',
  NAME_EMPTY: 'Name cannot be empty!',
  ANALYSIS_FAILED: 'Analysis failed!',
  ERROR_LABEL: 'Error',
};

export const WARNING_MESSAGES = {
  NO_SAVED_PATTERNS: 'No saved patterns found',
  NO_PATTERN_CREATED: 'Failed to create pattern',
  PATTERN_WARNINGS: 'Pattern warnings',
  CHARACTER_NOT_FOUND: 'Character \'{char}\' not found in letter definitions',
  TOKEN_NOT_FOUND: 'GitHub token not found!',
  ACTIVE_YEARS_FAILED: 'Failed to fetch active years, using default list',
  ACCOUNT_CREATED_YEAR: 'Your account was created in {year}. Creating commits earlier may appear suspicious!',
  COMMITS_WILL_BE_CREATED: 'Commits will be created and pushed to GitHub!',
  ACCOUNT_OPENED_WARNING: 'WARNING: Your account was created in {year}!',
  COMMIT_SUSPICIOUS: 'Creating commits in {year} may appear suspicious.',
  OPERATION_CANCELLED: 'Operation cancelled',
  FUTURE_COMMITS_WARNING: 'Warning: {count} commits in {days} future days will be skipped!',
};

export const SUCCESS_MESSAGES = {
  PATTERN_CREATED: 'Pattern created successfully',
  PATTERN_SAVED: 'Pattern "{name}" saved successfully',
  PATTERN_LOADED: '"{name}" loaded successfully',
  PATTERNS_CLEARED: 'All saved patterns cleared successfully',
  COMMITS_CREATED: 'Commits created successfully',
  PUSHED_TO_GITHUB: 'Successfully pushed to GitHub',
  PUSH_SUCCESS: 'Successfully pushed! ({count} commits)',
  ALL_COMMITS_UPLOADED: 'All commits uploaded to GitHub',
  CONFIG_UPDATED: 'Configuration updated successfully',
  TOKEN_SAVED: 'GitHub token saved successfully',
  ENV_CREATED: '.env file created successfully',
  ACTIVE_YEARS_FOUND: 'Active years found!',
  ANALYSIS_COMPLETE: 'Analysis complete!',
  OPERATION_CANCELLED_RIGHT_CHOICE: 'Operation cancelled. Good decision!',

  // Visualizer success
  EXPORTED_TO: 'Exported to: {filename}',
};

export const INFO_MESSAGES = {
  ANALYZING_PROFILE: 'Analyzing GitHub profile...',
  CREATING_COMMITS: 'Creating commits...',
  PUSHING_TO_REMOTE: 'Pushing to remote repository...',
  LOADING_CONFIG: 'Loading configuration...',
  GENERATING_PATTERN: 'Generating pattern...',
  VALIDATING_PATTERN: 'Validating pattern...',
  FEATURE_COMING_SOON: 'This feature is coming soon!',
  IMAGE_CONVERSION_COMING_SOON: 'Image conversion feature coming soon!',
  TOKEN_SETUP_HINT: 'Add GITHUB_TOKEN to .env file for detailed analysis.',
  ENV_FILE_CREATED: '📄 .env file created with template values',
  TOKEN_ADD_LATER: 'You can add your GitHub token later in Settings menu',

  // Visualizer info
  COMMIT_INFO_TITLE: 'Commit Info',
  GRAPH_VISUALIZATION_TITLE: 'GitHub Contribution Graph Visualization',
  STATISTICS_TITLE: 'Statistics:',
  TOTAL_DAYS_WITH_COMMITS: 'Total days with commits',
  TOTAL_COMMITS_PLANNED: 'Total commits planned',
  AVERAGE_COMMITS_PER_DAY: 'Average commits per active day',
  VALID_COMMITS: 'Valid commits',
  FUTURE_COMMITS_SKIP: 'Future commits (will be skipped)',

  // GitHub Analyzer info
  FETCHING_PUBLIC_DATA: 'Fetching public data without token...',
  ERROR_FETCHING_YEARS: 'Error fetching active years',
  ANALYSIS_ERROR: 'Analysis error',
};

export const SUGGESTION_MESSAGES = {
  TEXT_FITS_WEEKS: '"{text}" fits between weeks {start}-{end}',
  YEAR_MOSTLY_EMPTY: 'Year is mostly empty, you can add large patterns or long texts',
  SUITABLE_MEDIUM_PATTERNS: 'Suitable for medium-sized patterns or short texts',
  SUITABLE_SMALL_PATTERNS: 'Suitable for small patterns or symbols',
  YEAR_QUITE_FULL: 'Year is quite full, make minimal additions',
  HEART_SHAPE_AT_WEEK: 'Heart shape can be added at week {week}',
  STAR_SHAPE_AT_WEEK: 'Star shape can be added at week {week}',
};

export default {
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  SUCCESS_MESSAGES,
  INFO_MESSAGES,
  SUGGESTION_MESSAGES,
};