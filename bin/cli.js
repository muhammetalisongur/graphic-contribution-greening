#!/usr/bin/env node

/**
 * GitHub Contribution Graph Art CLI - Entry Point
 */

import CLIInterface from '../src/ui/cli-interface.js';
import { APP_INFO, CLI_CONFIG } from '../src/constants/config.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), CLI_CONFIG.FILE_ENCODING));

const cli = new CLIInterface();

// CLI Mode Check
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${packageJson.displayName || 'GitHub Contribution Graph Art CLI'} v${packageJson.version}

Usage:
  npm start                  - Interactive CLI mode (recommended)
  node bin/cli.js            - Interactive CLI mode
  node bin/cli.js --help     - Show this help message

Features:
  • Create text patterns on your contribution graph
  • Add shapes (heart, star, diamond, etc.)
  • Apply effects (wave, spiral, checkerboard, etc.)
  • Analyze your GitHub profile
  • Save and load patterns

For more information, visit: ${APP_INFO.GITHUB_URL}
`);
  process.exit(0);
} else {
  // Start CLI interface
  cli.start().catch(err => {
    if (err.name === 'ExitPromptError') {
      // User pressed Ctrl+C, exit gracefully
      process.exit(0);
    }
    console.error("Error:", err);
    process.exit(1);
  });
}
