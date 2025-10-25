const chalk = require("chalk");
const prompts = require("prompts");
import { getCurrentToken } from "../lib/cerds.js";
import {
    isGitInstalled,
    isGitRepository,
    getGitStatus,
    hasRemote,
    stageAll,
    commit,
    push as gitPush,
    getCurrentBranch,
} from "../lib/git.js";

export async function push(options?: { message?: string }) {
    console.log(chalk.blue("📦 Checking repository...\n"));

    // Check authentication
    const token = await getCurrentToken();
    if (!token) {
        console.log(chalk.yellow("⚠️  You are not connected to GitHub."));
        console.log(chalk.cyan("💡 Run `autopilot connect` first.\n"));
        return;
    }

    // Check Git is installed
    const gitInstalled = await isGitInstalled();
    if (!gitInstalled) {
        console.log(chalk.red("❌ Git is not installed"));
        console.log(
            chalk.yellow("💡 Install Git: https://git-scm.com/downloads\n")
        );
        return;
    }
    console.log(chalk.green("✓ Git installed"));

    // Check if in a git repository
    const inRepo = await isGitRepository();
    if (!inRepo) {
        console.log(chalk.yellow("❌ Not a git repository"));
        console.log(
            chalk.cyan("💡 Run `autopilot init` or `git init` first.\n")
        );
        return;
    }
    console.log(chalk.green("✓ Inside git repository"));

    // Check for changes
    const status = await getGitStatus();
    if (!status || status.trim() === "") {
        console.log(chalk.yellow("\n📝 No changes to commit"));
        console.log(chalk.gray("Working directory is clean.\n"));
        return;
    }

    // Show what files changed
    const changedFiles = status.trim().split("\n");
    console.log(chalk.cyan(`\n📝 Found ${changedFiles.length} change(s):`));
    changedFiles.slice(0, 5).forEach((file) => {
        console.log(chalk.gray(`  ${file}`));
    });
    if (changedFiles.length > 5) {
        console.log(chalk.gray(`  ... and ${changedFiles.length - 5} more`));
    }

    // Check if remote exists
    const remoteExists = await hasRemote();
    if (!remoteExists) {
        console.log(chalk.red("\n❌ No remote repository configured"));
        console.log(
            chalk.yellow("💡 Run `autopilot init` to set up GitHub repository.")
        );
        console.log(
            chalk.gray("Or manually add remote: git remote add origin <url>\n")
        );
        return;
    }
    console.log(chalk.green("✓ Remote origin found"));

    // Get commit message
    let commitMessage = options?.message;

    if (!commitMessage) {
        const response = await prompts({
            type: "text",
            name: "message",
            message: "Commit message:",
            initial: `Update ${new Date().toLocaleDateString()}`,
            validate: (value: string) =>
                value.length > 0 || "Message cannot be empty",
        });

        if (!response.message) {
            console.log(chalk.red("\n❌ Commit cancelled\n"));
            return;
        }

        commitMessage = response.message;
    }

    // Safety check
    if (!commitMessage) {
        console.log(chalk.red("\n❌ No commit message provided\n"));
        return;
    }

    try {
        // Stage all changes
        console.log(chalk.cyan("\n⚙️  Staging changes..."));
        await stageAll();
        console.log(chalk.green("✓ Changes staged"));

        // Commit
        console.log(chalk.cyan("💾 Committing..."));
        await commit(commitMessage);
        console.log(chalk.green(`✓ Committed: "${commitMessage}"`));

        // Get current branch
        const branch = await getCurrentBranch();
        const branchName = branch || "main";

        // Push
        console.log(chalk.cyan(`🚀 Pushing to origin/${branchName}...`));
        await gitPush();
        console.log(chalk.green("✓ Successfully pushed!\n"));

        console.log(chalk.cyan("🎉 All done!"));
        console.log(chalk.gray("Your changes are now on GitHub.\n"));
    } catch (error: any) {
        // Handle common push errors
        if (error.message.includes("no upstream branch")) {
            const branch = await getCurrentBranch();
            console.log(chalk.red("\n❌ No upstream branch set"));
            console.log(
                chalk.yellow(`💡 Run: git push -u origin ${branch || "main"}\n`)
            );
        } else if (error.message.includes("rejected")) {
            console.log(chalk.red("\n❌ Push rejected"));
            console.log(
                chalk.yellow("💡 Your local branch is behind the remote.")
            );
            console.log(chalk.gray("Try: git pull --rebase\n"));
        } else if (error.message.includes("nothing to commit")) {
            console.log(chalk.yellow("\n📝 Nothing to commit\n"));
        } else {
            console.log(chalk.red("\n❌ Failed to push:"), error.message);
            console.log(
                chalk.gray(
                    "Check your internet connection and repository access.\n"
                )
            );
        }
    }
}
