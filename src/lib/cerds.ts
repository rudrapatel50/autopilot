import { Entry } from '@napi-rs/keyring';
import chalk from 'chalk';

export async function saveToken(username:string, token:Uint8Array<ArrayBufferLike>) {
    // const entry = new Entry('autopilot_cli', username);
    // await entry.setSecret(token);
    console.log(chalk.red("save token called"))
}

export async function getToken() {
    
}
