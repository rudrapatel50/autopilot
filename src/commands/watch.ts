const chalk = require('chalk');
import chokidar from 'chokidar';
import { getCurrentToken } from '../lib/cerds.js';
import { isGitInstalled, isGitRepository, hasRemote } from '../lib/git.js';
import { push } from './push.js';

let debounceTimer: NodeJS.Timeout | null = null;
let isProcessing = false;
const DEBOUNCE_TIME = 15000; // 15 seconds

export async function watch() {
    console.log(chalk.blue('👀 Starting Autopilot Watch Mode...\n'));

    const token = await getCurrentToken();
    if (!token) {
        console.log(chalk.yellow('⚠️  You are not connected to GitHub.'));
        console.log(chalk.cyan('💡 Run `autopilot connect` first.\n'));
        return;
    }

    const gitInstalled = await isGitInstalled();
    if (!gitInstalled) {
        console.log(chalk.red('❌ Git is not installed'));
        console.log(chalk.yellow('💡 Install Git: https://git-scm.com/downloads\n'));
        return;
    }

    const inRepo = await isGitRepository();
    if (!inRepo) {
        console.log(chalk.yellow('❌ Not a git repository'));
        console.log(chalk.cyan('💡 Run `autopilot init` first.\n'));
        return;
    }

    const remoteExists = await hasRemote();
    if (!remoteExists) {
        console.log(chalk.red('❌ No remote repository configured'));
        console.log(chalk.yellow('💡 Run `autopilot init` to set up GitHub repository.\n'));
        return;
    }

    console.log(chalk.green('✓ All checks passed\n'));
    console.log(chalk.cyan('🤖 Watching for changes...'));
    console.log(chalk.gray(`   Debounce time: ${DEBOUNCE_TIME / 1000}s`));
    console.log(chalk.gray('   Press Ctrl+C to stop\n'));

    //initialize watcher
    const watcher = chokidar.watch('.', {
        ignored: [
            /(^|[\/\\])\../, // hidden files
            '**/node_modules/**',
            '**/dist/**',
            '**/.git/**',
            '**/build/**',
            '**/coverage/**',
            '**/.next/**',
            '**/.cache/**',
        ],
        persistent: true,
        ignoreInitial: true, //don't trigger on startup
        awaitWriteFinish: {
            stabilityThreshold: 1000, // w.ait for file write to finish
            pollInterval: 100
        }
    });

    //handle file changes
    watcher.on('change', (path) => handleChange(path, 'modified'));
    watcher.on('add', (path) => handleChange(path, 'added'));
    watcher.on('unlink', (path) => handleChange(path, 'deleted'));

    //jandle errors
    watcher.on('error', (error) => {
        console.log(chalk.red(`\n❌ Watcher error: ${error}`));
    });

    //handle Ctrl+C gracefully
    process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n\n⏸️  Stopping watch mode...'));
        
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        await watcher.close();
        console.log(chalk.green('✓ Watch mode stopped\n'));
        process.exit(0);
    });

    //keep process alive
    process.stdin.resume();
}

function handleChange(path: string, action: string) {
    //skip if already processing
    if (isProcessing) {
        return;
    }

    //log the change
    const actionColor = action === 'deleted' ? chalk.red : chalk.cyan;
    console.log(actionColor(`📝 ${action}: ${path}`));

    //clear existing timer
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        console.log(chalk.gray('   ⏳ Resetting timer...\n'));
    }

    //start new debounce timer
    debounceTimer = setTimeout(async () => {
        await processChanges();
    }, DEBOUNCE_TIME);

    console.log(chalk.gray(`   ⏲️  Will process in ${DEBOUNCE_TIME / 1000}s if no new changes...\n`));
}

async function processChanges() {
    if (isProcessing) return;

    isProcessing = true;
    console.log(chalk.cyan('\n🔍 Processing changes...\n'));

    try {
        //call the existing push command
        await push({ message: `Auto-commit: ${new Date().toLocaleString()}` });
        console.log(chalk.green('\n✓ Changes pushed successfully\n'));
    } catch (error: any) {
        console.log(chalk.red(`\n❌ Failed to push: ${error.message}\n`));
    } finally {
        isProcessing = false;
        debounceTimer = null;
        console.log(chalk.cyan('👀 Watching for more changes...\n'));
    }
}