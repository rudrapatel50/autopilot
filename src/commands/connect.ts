import inquirer from "inquirer";
import chalk from "chalk";
import { saveToken, getToken } from "../lib/cerds";
import { validateToken } from "../lib/github";
export async function connect() {
    try {
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "status",
                message: chalk.bgBlue("Enter your Personal Access Token (PAT) from Github\n"),
            },
        ]);
        const token = answers.status;
        const user = await validateToken(token);
        if(user.valid) {
            saveToken(user.username, token);
            console.log(chalk.bgBlue(`✓ Connected as ${user.username}`));
        } else {
            console.log(chalk.bgRedBright(`Invalid token! Failed to verify`));
        }
    } catch (error) {
        if (error) {
        // Prompt couldn't be rendered in the current environment
        } else {
        // Something else went wrong
        }
    }
}