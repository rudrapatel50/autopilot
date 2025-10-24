const chalk = require("chalk");
const prompts = require("prompts");
import { exec } from "child_process";
import { isGitInstalled, isGitRepository } from "../lib/git.js";
import { getCurrentToken } from "../lib/cerds.js";
import { validateToken } from "../lib/github.js";
import axios from "axios";

export async function init() {
    console.log(chalk.blue("🚀 Initializing repository...\n"));

    //check authentication
    const token = await getCurrentToken();
    if (!token) {
        console.log(chalk.yellow("⚠️  You are not connected to GitHub."));
        console.log(chalk.cyan("💡 Run `autopilot connect` first.\n"));
        return;
    }

    //verify token is still valid
    const userInfo = await validateToken(token);
    if (!userInfo.valid) {
        console.log(chalk.red("❌ Your token is invalid or expired."));
        console.log(
            chalk.cyan("💡 Run `autopilot logout` then `autopilot connect`.\n")
        );
        return;
    }

    //check Git is installed
    const gitInstalled = await isGitInstalled();
    if (!gitInstalled) {
        console.log(chalk.red("❌ Git is not installed"));
        console.log(
            chalk.yellow("💡 Install Git: https://git-scm.com/downloads\n")
        );
        return;
    }

    //check if already a git repo
    const isRepo = await isGitRepository();

    if (!isRepo) {
        console.log(chalk.cyan("📁 Not a git repository. Initializing...\n"));

        //initialize git repo
        try {
            await runCommand("git init");
            console.log(chalk.green("✓ Git repository initialized"));

            //set default branch to main
            await runCommand("git branch -M main");
            console.log(chalk.green("✓ Default branch set to main"));

            //create initial files if they don't exist
            const { createFiles } = await prompts({
                type: "confirm",
                name: "createFiles",
                message: "Create .gitignore and README.md?",
                initial: true,
            });

            if (createFiles) {
                //create .gitignore
                await createGitignore();
                console.log(chalk.green("✓ Created .gitignore"));

                //create README.md
                await createReadme();
                console.log(chalk.green("✓ Created README.md"));
            }

            //initial commit
            await runCommand("git add -A");
            await runCommand('git commit -m "Initial commit"');
            console.log(chalk.green("✓ Initial commit created\n"));
        } catch (error) {
            console.log(chalk.red("❌ Failed to initialize git:"), error);
            return;
        }
    } else {
        console.log(chalk.green("✓ Already a git repository\n"));
    }

    //check if remote exists
    const hasRemote = await checkRemote();

    if (hasRemote) {
        console.log(chalk.green("✓ Remote origin already configured\n"));
        return;
    }

    //ask to create GitHub repo
    const { createRepo } = await prompts({
        type: "confirm",
        name: "createRepo",
        message: "Create a new GitHub repository?",
        initial: true,
    });

    if (!createRepo) {
        console.log(chalk.yellow("\n💡 You can manually add a remote with:"));
        console.log(chalk.gray("  git remote add origin <url>"));
        console.log(chalk.gray("  git push -u origin main\n"));
        return;
    }

    //get repo name
    const cwd = process.cwd();
    const defaultName = cwd.split("/").pop() || "my-repo";

    let repoName = "";
    let repoDescription = "";
    let isPrivate = true;
    let repoCreated = false;

    // Loop until we successfully create a repo or user cancels
    while (!repoCreated) {
        const nameResponse = await prompts({
            type: "text",
            name: "repoName",
            message: "Repository name:",
            initial: repoName || defaultName,
            validate: (value: string) =>
                value.length > 0 || "Name cannot be empty",
        });

        if (!nameResponse.repoName) {
            console.log(chalk.red("❌ Repository creation cancelled\n"));
            return;
        }

        repoName = nameResponse.repoName;

        // Only ask for description and privacy on first attempt
        if (!repoDescription) {
            const descResponse = await prompts({
                type: "text",
                name: "repoDescription",
                message: "Repository description (optional):",
                initial: "",
            });
            repoDescription = descResponse.repoDescription || "";

            const privacyResponse = await prompts({
                type: "confirm",
                name: "isPrivate",
                message: "Make repository private?",
                initial: true,
            });
            isPrivate = privacyResponse.isPrivate;
        }

        //create GitHub repo
        console.log(chalk.cyan("\n🔨 Creating GitHub repository...\n"));

        try {
            const response = await axios.post(
                "https://api.github.com/user/repos",
                {
                    name: repoName,
                    description: repoDescription || undefined,
                    private: isPrivate,
                    auto_init: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );

            const repoUrl = response.data.clone_url;
            const htmlUrl = response.data.html_url;

            console.log(chalk.green("✓ Repository created on GitHub"));

            //add remote
            await runCommand(`git remote add origin ${repoUrl}`);
            console.log(chalk.green("✓ Remote origin added"));

            //push to GitHub
            await runCommand("git push -u origin main");
            console.log(chalk.green("✓ Pushed to GitHub\n"));

            console.log(chalk.cyan("🎉 All done!"));
            console.log(chalk.gray(`View your repository: ${htmlUrl}\n`));

            repoCreated = true;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    console.log(
                        chalk.red(
                            `❌ Repository name '${repoName}' already exists`
                        )
                    );
                    console.log(chalk.yellow("💡 Try a different name\n"));
                    //loop will continue and ask for new name
                } else {
                    console.log(
                        chalk.red("❌ Failed to create repository:"),
                        error.response?.data?.message || error.message
                    );
                    return; //exit on other errors
                }
            } else {
                console.log(
                    chalk.red("❌ Failed to create repository:"),
                    error
                );
                return; //exit on non-axios errors
            }
        }
    }
}

//helper function to run git commands
function runCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

//helper to check if remote exists
function checkRemote(): Promise<boolean> {
    return new Promise((resolve) => {
        exec("git remote -v", (error, stdout) => {
            if (error) {
                resolve(false);
            } else {
                resolve(stdout.includes("origin"));
            }
        });
    });
}

//helper to create .gitignore
function createGitignore(): Promise<void> {
    return new Promise((resolve, reject) => {
        const fs = require("fs");
        const content = `node_modules/
            dist/
            .env
            .DS_Store
            *.log
            `;
        fs.writeFile(".gitignore", content, (err: any) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

//helper to create README.md
function createReadme(): Promise<void> {
    return new Promise((resolve, reject) => {
        const fs = require("fs");
        const cwd = process.cwd();
        const projectName = cwd.split("/").pop() || "My Project";
        const content = `# ${projectName} Created with Autopilot CLI`;
        fs.writeFile("README.md", content, (err: any) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
