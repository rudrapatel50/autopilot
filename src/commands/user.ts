const chalk = require('chalk');
import { getCurrentToken } from '../lib/cerds.js';
import { validateToken } from '../lib/github.js';

export async function user() {
  console.log(chalk.blue('👤 Checking current user...\n'));

  const token = await getCurrentToken();
  if (!token) {
    console.log(chalk.yellow('⚠️  You are not currently connected to GitHub.'));
    console.log(chalk.cyan('💡 Run `autopilot connect` to connect your account.\n'));
    return;
  }

  try {
    const result = await validateToken(token);
    
    if (!result.valid) {
      console.log(chalk.red('❌ Token is invalid or expired.'));
      console.log(chalk.cyan('💡 Run `autopilot logout` then `autopilot connect` to reconnect.\n'));
      return;
    }

    console.log(chalk.green('✓ Connected as:'), chalk.bold(`@${result.username}`));
    if (result.name) {
      console.log(chalk.gray('  Name:'), result.name);
    }
    if (result.email) {
      console.log(chalk.gray('  Email:'), result.email);
    }
    console.log();
  } catch (error) {
    console.log(chalk.red('❌ Failed to fetch user info:'), error);
  }
}