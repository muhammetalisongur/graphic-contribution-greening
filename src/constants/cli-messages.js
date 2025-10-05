/**
 * CLI interface messages and prompts
 */

export const CLI_MESSAGES = {
  // Application defaults
  DEFAULT_APP_NAME: 'GitHub Contribution Graph Art CLI',

  // Main menu
  MAIN_MENU_PROMPT: 'What would you like to do?',
  MENU_CREATE_PATTERN: 'Create New Pattern',
  MENU_ANALYZE_PROFILE: 'Analyze GitHub Profile',
  MENU_LOAD_PATTERN: 'Load Saved Pattern',
  MENU_SETTINGS: 'Settings',
  MENU_EXIT: 'Exit',

  // Pattern type selection
  PATTERN_TYPE_PROMPT: 'Select pattern type:',
  PATTERN_TYPE_TEXT: 'Text',
  PATTERN_TYPE_SHAPE: 'Shapes',
  PATTERN_TYPE_EFFECT: 'Effects',
  PATTERN_TYPE_MANUAL: 'Manual Pattern',
  PATTERN_TYPE_CUSTOM: 'Custom ASCII Art',

  // Text pattern
  TEXT_INPUT_PROMPT: 'Enter text to display:',
  START_WEEK_PROMPT: 'Start week (1-52):',
  INTENSITY_PROMPT: 'Select intensity:',
  INTENSITY_LIGHT: '🟩 Light (1-2 commits)',
  INTENSITY_MEDIUM: '🟢 Medium (3-4 commits)',
  INTENSITY_HEAVY: '🔵 Heavy (5+ commits)',
  INTENSITY_RANGE_PROMPT: 'Intensity (1-4):',
  EFFECTS_PROMPT: 'Add effects (Space to select):',

  // Shape pattern
  SHAPE_SELECT_PROMPT: 'Select shape:',
  SHAPE_HEART: 'Heart',
  SHAPE_STAR: 'Star',
  SHAPE_TRIANGLE: 'Triangle',
  SHAPE_SQUARE: 'Square',
  SHAPE_DIAMOND: 'Diamond',

  // Effect pattern
  EFFECT_SELECT_PROMPT: 'Select effect:',
  EFFECT_WAVE: 'Wave',
  EFFECT_CHECKERBOARD: 'Checkerboard',
  EFFECT_DIAGONAL: 'Diagonal',
  EFFECT_SPIRAL: 'Spiral',
  EFFECT_RANDOM: 'Random',

  // Manual pattern
  MANUAL_MODE_ENTER: 'Entering manual pattern creation mode.',
  MANUAL_MODE_DESC: 'You can specify commit count for each week and day.',
  WEEK_PROMPT: 'Week (1-52):',
  DAY_PROMPT: 'Day:',
  COMMIT_COUNT_PROMPT: 'Number of commits:',
  ADD_MORE_PATTERNS: 'Add another pattern?',

  // Days of week
  DAY_SUNDAY: 'Sunday',
  DAY_MONDAY: 'Monday',
  DAY_TUESDAY: 'Tuesday',
  DAY_WEDNESDAY: 'Wednesday',
  DAY_THURSDAY: 'Thursday',
  DAY_FRIDAY: 'Friday',
  DAY_SATURDAY: 'Saturday',
  DAY_ALL_WEEK: 'All week',

  // Custom pattern
  CUSTOM_ASCII_TITLE: 'Custom ASCII Art Creation',
  CUSTOM_ASCII_DESC: 'You can define patterns on a 7x52 grid.',
  CUSTOM_METHOD_PROMPT: 'How would you like to create it?',
  CUSTOM_METHOD_FILE: 'Load from file',
  CUSTOM_METHOD_DRAW: 'Draw manually',
  FILE_PATH_PROMPT: 'Pattern file path (JSON):',

  // Year selection
  YEAR_SELECT_PROMPT: 'Select year:',
  YEAR_INPUT_PROMPT: 'Enter year:',
  CURRENT_YEAR_LABEL: '(Current year)',
  ACCOUNT_CREATED_LABEL: '(Account created)',
  ACCOUNT_CREATED_IN: 'Account created in',
  TOTAL_ACTIVE_YEARS: 'Found total active years:',
  CUSTOM_YEAR_ENTRY: 'Enter custom year...',
  DETECTING_ACTIVE_YEARS: 'Detecting active years...',

  // Profile analysis
  ADD_TOKEN_NOW: 'Would you like to add a token now?',
  ANALYZING_PROFILE: 'Analyzing profile...',
  ANALYSIS_RESULTS_TITLE: 'Profile Analysis',
  AFTER_MONTHLY_TREND_PROMPT: 'What would you like to do next?',
  AFTER_YEAR_COMPARISON_PROMPT: 'What would you like to do next?',
  TOTAL_CONTRIBUTIONS: 'Total contributions',
  ACTIVE_DAYS: 'Active days',
  EMPTY_DAYS: 'Empty days',
  BUSIEST_DAY: 'Busiest day',
  AVERAGE_CONTRIBUTIONS: 'Average contributions',
  EMPTY_WEEKS: 'Empty weeks',
  FILL_RATE: 'Fill rate',
  CURRENT_STREAK: 'Current streak',
  MAX_STREAK: 'Maximum streak',
  VIEW_MONTHLY_TREND: 'View monthly trend',
  COMPARE_WITH_PREVIOUS_YEAR: 'Compare with previous year',

  // Year comparison
  COMPARING_WITH_PREVIOUS_YEAR: 'Comparing with previous year...',
  COMPARISON_COMPLETE: 'Comparison complete!',
  COULD_NOT_COMPARE_YEARS: 'Could not compare years',
  COMPARISON_FAILED: 'Comparison failed',
  COMPARISON_TOTAL: 'Total',
  COMPARISON_AVERAGE: 'Average',
  COMPARISON_FILL_RATE: 'Fill Rate',
  COMPARISON_CHANGE: 'Change',

  // Effects
  EFFECT_GRADIENT: 'Gradient',
  EFFECT_ALTERNATING: 'Alternating',
  EFFECT_SHADOW: 'Shadow',

  // Suggestions
  SUGGESTIONS_TITLE: 'Suggestions',
  SUGGESTION_EMPTY_WEEKS: 'Weeks {start}-{end} are empty, you can write "HELLO" there.',
  SUGGESTION_LOW_FILL: 'Year is {percent}% empty, you can add large patterns.',
  SUGGESTION_HIGH_FILL: 'Year is quite full, prefer small patterns.',
  SUGGESTION_LONGEST_STREAK: 'Longest empty streak: {weeks} weeks',
  SUGGESTION_CHECK_GIT_REPO: 'Make sure this is a git repository',
  SUGGESTION_CHECK_PUSH_PERMISSION: 'Check GitHub push permissions',
  SUGGESTION_CHECK_FILE_WRITABLE: 'Ensure contribution-tracker.json is writable',

  // GitHub username
  GITHUB_USERNAME_PROMPT: 'GitHub username:',

  // Pattern loading & selection
  PATTERN_SELECT_PROMPT: 'Select pattern:',

  // Settings
  SETTINGS_MENU_TITLE: 'Settings:',
  SETTINGS_SET_TOKEN: 'Set GitHub Token',
  SETTINGS_SET_USERNAME: 'Set GitHub Username',
  SETTINGS_CLEAR_PATTERNS: 'Clear Saved Patterns',
  SETTINGS_CONFIRM_CLEAR: 'All saved patterns will be deleted. Are you sure?',

  // Pattern confirmation & actions
  PATTERN_PREVIEW: 'Pattern Preview',
  PATTERN_CONFIRM_USE: 'Use this pattern?',
  PATTERN_READY_PROMPT: 'Pattern ready! What would you like to do?',
  PATTERN_NAME_PROMPT: 'Pattern name:',
  NEXT_ACTION_PROMPT: 'What would you like to do?',

  // Actions
  ACTION_CREATE_NEW: 'Create new pattern',
  ACTION_CREATE_PATTERN: 'Create pattern',
  ACTION_EDIT_AGAIN: 'Re-edit',
  ACTION_RETURN_MENU: 'Back to main menu',
  ACTION_RETRY: 'Try again',
  ACTION_ADD_PATTERN_EMPTY: 'Add pattern to empty spaces',
  ACTION_GET_SUGGESTION: 'Get suggestions',
  ACTION_PUSH_GITHUB: 'Push to GitHub',
  ACTION_SAVE_AND_PUSH: 'Save and push',
  ACTION_SAVE_ONLY: 'Save only',
  ACTION_BACK: 'Back',
  ACTION_CANCEL: 'Cancel',
  ACTION_VIEW_ANALYSIS_AGAIN: 'View analysis results again',
  ACTION_RETURN_ANALYSIS_MENU: 'Return to analysis menu',

  // GitHub push
  SUMMARY_TITLE: 'Summary',
  TOTAL_PATTERN_POINTS: 'Total pattern points',
  TOTAL_COMMITS: 'Total commits',
  VALID_COMMITS: 'Valid commits (will be created)',
  FUTURE_COMMITS: 'Future commits',
  WEEK_RANGE: 'Week range',
  SELECTED_YEAR: 'Selected year',
  CONTINUE_ANYWAY: 'Continue anyway?',
  CONFIRM_CONTINUE: 'Continue?',
  CREATING_COMMITS: 'Creating commits...',
  PROCESSING_COMMITS: '{current}/{total} commits processing...',
  PUSHING_TO_GITHUB: 'Pushing to GitHub...',
  CHECK_PROFILE: 'Check your GitHub profile',

  // Exit messages
  EXIT_GOODBYE: 'Goodbye!',
  EXIT_SHUTDOWN: 'Program shutting down',

  // Token configuration
  ENV_COMMENT_TOKEN: '# GitHub Personal Access Token (Classic)',
  ENV_COMMENT_SCOPE: '# Scope: read:user (minimum)',
  ENV_COMMENT_USERNAME: '# GitHub Username (optional)',
  ENV_COMMENT_DEFAULT_USERNAME: '# Your default GitHub username',
  ENV_COMMENT_REQUIRED: '# Required for profile analysis (optional)',
  ENV_COMMENT_QUICKLINK: '# Quick link: https://github.com/settings/tokens/new',
  ENV_COMMENT_HOW_TO: '# How to create:',
  ENV_COMMENT_STEP1: '# 1. Go to the link above or: GitHub → Settings → Developer settings → Tokens (classic)',
  ENV_COMMENT_STEP2: '# 2. Click "Generate new token (classic)"',
  ENV_COMMENT_STEP3: '# 3. Name it, set expiration (90 days recommended)',
  ENV_COMMENT_STEP4: '# 4. Select scope: read:user (for reading profile data)',
  ENV_COMMENT_STEP5: '# 5. Click "Generate token" and copy it immediately',
  TOKEN_CREATE_TITLE: '\n🔑 Creating GitHub Personal Access Token (Classic):\n',
  TOKEN_CREATE_LINK: 'Quick link: https://github.com/settings/tokens/new',
  TOKEN_CREATE_STEP_1: '1. Click the link above or go to: Settings → Developer settings → Tokens (classic)',
  TOKEN_CREATE_STEP_2: '2. Click "Generate new token (classic)"',
  TOKEN_CREATE_STEP_3: '3. Name it (e.g., "Contribution CLI"), set expiration (90 days recommended)',
  TOKEN_CREATE_STEP_4: '4. Select scope: read:user (for reading profile data)',
  TOKEN_CREATE_STEP_5: '5. Click "Generate token" and copy it (you won\'t see it again!)\n',
  TOKEN_INPUT_PROMPT: 'Paste your GitHub Personal Access Token:',
  TOKEN_EXISTING_FOUND: '\n⚠️  Existing token found.\n',
  TOKEN_OVERWRITE_PROMPT: 'Overwrite it?',
  TOKEN_VALIDATE_EMPTY: 'Token cannot be empty!',
  TOKEN_UPDATE_SUCCESS: '\n✓ Token updated successfully!\n',

  // Suggestions
  SHAPE_PLACEMENTS_TITLE: 'Suggested shape placements:',
  TEXT_PLACEMENT_PROMPT: 'Would you like to get placement suggestions for a specific text?',
  TEXT_INPUT_FOR_PLACEMENT: 'Enter the text you want to place:',
  TEXT_LENGTH_VALIDATION: 'Text should be between 1-10 characters',
  TEXT_PLACEMENT_OPTIONS: 'Text placement options for "{text}":',
  NO_SUITABLE_SPACE: 'No suitable space found for "{text}" (needs {weeks} consecutive empty weeks)',
};

export default CLI_MESSAGES;
