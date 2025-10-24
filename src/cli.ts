#!/usr/bin/env node
import { Command } from 'commander';
import { connect } from "./commands/connect"
import { user } from './commands/user';
import { logout } from './commands/logout';

const program = new Command();

program
    .name("autopilot")
    .description("Autopilot CLI")
    .version("1.0.0");

program
    .command("connect")
    .description("Connect your GitHub account with a Personal Access Token")
    // .option("--token <token>", "Github Personal Access Token")
    .action(connect);

program
    .command("user")
    .description("Check which GitHub account is currently connected")
    .action(user);

program
    .command("logout")
    .description("Disconnect your GitHub account and remove stored credentials")
    .action(logout)

program.parse(process.argv);