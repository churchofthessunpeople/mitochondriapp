/**
 * Email verification is off unless explicitly enabled.
 * Set EMAIL_VERIFICATION_ENABLED=true in .env / Vercel to turn it back on.
 */
export function isEmailVerificationEnabled(): boolean {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}
