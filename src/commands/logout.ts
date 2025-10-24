import chalk from 'chalk';
import { getCurrentToken, deleteCurrentToken } from '../lib/cerds.js';

export async function logout() {
  console.log(chalk.blue('👋 Logging out...\n'));

  // Check if user is logged in
  const token = await getCurrentToken();
  if (!token) {
    console.log(chalk.yellow('⚠️  You are not currently connected to GitHub.'));
    console.log(chalk.cyan('💡 Run `autopilot connect` to connect your account.\n'));
    return;
  }

  // Delete the token
  try {
    await deleteCurrentToken();
    console.log(chalk.green('✓ Successfully logged out'));
    console.log(chalk.gray('Run `autopilot connect` to connect again.\n'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to logout:'), error);
  }
}