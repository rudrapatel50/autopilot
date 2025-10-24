import { Entry } from '@napi-rs/keyring';

const SERVICE_NAME = 'autopilot-cli';

export async function saveToken(
    username: string,
    token: string
): Promise<void> {
    try {
        const entry = new Entry(SERVICE_NAME, username);
        await entry.setPassword(token);
    } catch (error) {
        throw new Error(`Failed to save token: ${error}`);
    }
}

export async function getToken(username: string): Promise<string | null> {
    try {
        const entry = new Entry(SERVICE_NAME, username);
        const token = await entry.getPassword();
        return token;
    } catch (error) {
        return null;
    }
}

export async function deleteToken(username: string): Promise<void> {
    try {
        const entry = new Entry(SERVICE_NAME, username);
        await entry.deletePassword();
    } catch (error) {
        throw new Error(`Failed to delete token: ${error}`);
    }
}

export async function hasToken(username: string): Promise<boolean> {
    const token = await getToken(username);
    return token !== null;
}

// For single-user scenario (optional)
export async function saveCurrentToken(token: string): Promise<void> {
    return saveToken("default", token);
}

export async function getCurrentToken(): Promise<string | null> {
    return getToken("default");
}

export async function deleteCurrentToken(): Promise<void> {
    return deleteToken("default");
}