import { randomBytes } from "crypto";

/**
 * Generate a secure random token for contract signing
 */
export function generateSigningToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Verify that a signing token matches the contract's token
 */
export function verifySigningToken(contractToken: string | null, providedToken: string | null): boolean {
  if (!contractToken || !providedToken) {
    return false;
  }
  return contractToken === providedToken;
}

