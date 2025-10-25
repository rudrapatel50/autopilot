import { exec } from 'child_process';

/**
 * Checks if Git is installed on the system.
 * @returns A Promise that resolves to true if Git is installed, false otherwise.
 */
export async function isGitInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
        exec('git --version', (error, stdout) => {
            if (error) {
                resolve(false);
            } else {
                resolve(stdout.includes('git version'));
            }
        });
    });
}

/**
 * Checks if the current folder is a git repository.
 * @returns A Promise that resolves to true if it is a git repo, false otherwise.
 */
export async function isGitRepository(): Promise<boolean> {
    return new Promise((resolve) => {
        exec('git rev-parse --is-inside-work-tree', (error) => {
            resolve(!error);
        });
    });
}

/**
 * Gets the git status to check for changes.
 * @returns A Promise that resolves to the status output or null if error.
 */
export async function getGitStatus(): Promise<string | null> {
    return new Promise((resolve) => {
        exec('git status --porcelain', (error, stdout) => {
            if (error) {
                resolve(null);
            } else {
                resolve(stdout);
            }
        });
    });
}

/**
 * Checks if a remote named 'origin' exists.
 * @returns A Promise that resolves to true if remote exists, false otherwise.
 */
export async function hasRemote(): Promise<boolean> {
    return new Promise((resolve) => {
        exec('git remote -v', (error, stdout) => {
            if (error) {
                resolve(false);
            } else {
                resolve(stdout.includes('origin'));
            }
        });
    });
}

/**
 * Stages all changes (git add -A).
 * @returns A Promise that resolves on success, rejects on error.
 */
export async function stageAll(): Promise<void> {
    return new Promise((resolve, reject) => {
        exec('git add -A', (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Commits staged changes with a message.
 * @param message - The commit message.
 * @returns A Promise that resolves on success, rejects on error.
 */
export async function commit(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(`git commit -m "${message}"`, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Pushes commits to remote.
 * @returns A Promise that resolves on success, rejects on error.
 */
export async function push(): Promise<void> {
    return new Promise((resolve, reject) => {
        exec('git push', (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Gets the current branch name.
 * @returns A Promise that resolves to the branch name or null if error.
 */
export async function getCurrentBranch(): Promise<string | null> {
    return new Promise((resolve) => {
        exec('git branch --show-current', (error, stdout) => {
            if (error) {
                resolve(null);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}