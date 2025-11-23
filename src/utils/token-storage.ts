import { promises as fs } from 'fs';
import * as path from 'path';

// Store credentials in .credentials folder in current working directory
const CREDENTIALS_DIR = path.join(process.cwd(), '.credentials');
const TOKENS_FILE = path.join(CREDENTIALS_DIR, 'tokens.json');

export interface StoredTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
  scope: string;
}

/**
 * Ensures the credentials directory exists
 */
async function ensureCredentialsDir(): Promise<void> {
  await fs.mkdir(CREDENTIALS_DIR, { recursive: true });
}

/**
 * Saves OAuth tokens to local storage
 */
export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await ensureCredentialsDir();
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

/**
 * Loads stored OAuth tokens
 * @returns tokens if they exist, null otherwise
 */
export async function loadTokens(): Promise<StoredTokens | null> {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8');
    return JSON.parse(data) as StoredTokens;
  } catch {
    return null;
  }
}

/**
 * Checks if valid tokens exist
 */
export async function hasValidTokens(): Promise<boolean> {
  const tokens = await loadTokens();
  if (!tokens) return false;

  // Check if refresh token exists (access token can be refreshed)
  return !!tokens.refresh_token;
}

/**
 * Deletes stored tokens (for logout/reset)
 */
export async function deleteTokens(): Promise<void> {
  try {
    await fs.unlink(TOKENS_FILE);
  } catch {
    // File doesn't exist, ignore
  }
}

/**
 * Gets the path to the tokens file (for display purposes)
 */
export function getTokensFilePath(): string {
  return TOKENS_FILE;
}

/**
 * Gets the credentials directory path
 */
export function getCredentialsDir(): string {
  return CREDENTIALS_DIR;
}
