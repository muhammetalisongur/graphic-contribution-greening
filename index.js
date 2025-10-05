/**
 * Entry point - Redirects to bin/cli.js
 * This file is kept for backward compatibility
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Redirect to bin/cli.js
const cliPath = join(__dirname, 'bin', 'cli.js');
const child = spawn('node', [cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
