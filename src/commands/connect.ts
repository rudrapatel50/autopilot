import { validateToken } from '../lib/github.js';
import { saveCurrentToken, getCurrentToken } from '../lib/cerds.js';
const prompts = require('prompts');
const chalk = require('chalk');

export async function connect() {
  console.log(chalk.blue('🔗 Connecting to GitHub...\n'));

  //check for existing token
  const existingToken = await getCurrentToken();
  if (existingToken) {
    console.log(chalk.yellow('⚠️  You are already connected to GitHub.'));
    console.log(chalk.cyan('💡 Run `autopilot logout` first to connect with a different account.\n'));
    return;
  }

  //check environment variable
  let token = process.env.GITHUB_TOKEN;
  if (token) {
    const { useEnv } = await prompts({
      type: 'confirm',
      name: 'useEnv',
      message: 'Found GITHUB_TOKEN in environment. Use it?',
      initial: true,
    });

    if (!useEnv) {
      token = undefined;
    }
  }

  //prompt for token if not using env variable
  if (!token) {
    const response = await prompts({
      type: 'password',
      name: 'token',
      message: 'Enter your GitHub Personal Access Token:',
      validate: (value: string) => value.length > 0 || 'Token cannot be empty',
    });

    if (!response.token) {
      console.log(chalk.red('❌ Connection cancelled'));
      return;
    }

    token = response.token;
  }

  //safety check
  if (!token) {
    console.log(chalk.red('❌ No token provided'));
    return;
  }

  //validate token
  console.log(chalk.cyan('\n🔍 Validating token...'));
  const result = await validateToken(token);

  if (!result.valid) {
    console.log(chalk.red('❌ Invalid token. Please check your token and try again.'));
    return;
  }

  //save token
  try {
    await saveCurrentToken(token);
    console.log(chalk.green(`\n✓ Successfully connected as ${chalk.bold('@' + result.username)}`));
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray('  - Run `autopilot init` to initialize a repository'));
    console.log(chalk.gray('  - Run `autopilot push` to commit and push changes'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to save token:'), error);
  }
}