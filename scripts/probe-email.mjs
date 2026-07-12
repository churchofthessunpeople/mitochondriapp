/**
 * Probe Resend using local .env (same path production uses).
 * Usage: npm run email:probe -- you@example.com
 */
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local" });

const to = process.argv[2];
const key = process.env.RESEND_API_KEY?.trim();
const from =
  process.env.EMAIL_FROM?.trim() ||
  "Mitochondriapp <onboarding@resend.dev>";
const authUrl = process.env.AUTH_URL?.trim() || "http://localhost:3000";

console.log("hasApiKey:", Boolean(key));
console.log("from:", from);
console.log("AUTH_URL:", authUrl);
console.log("to:", to || "(missing — pass an email as the first argument)");

if (!key) {
  console.error("RESEND_API_KEY is missing from .env");
  process.exit(1);
}

if (!to) {
  console.error("Usage: npm run email:probe -- you@your-resend-account-email.com");
  process.exit(1);
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "Mitochondriapp local verify probe",
    html: `<p>Localhost Resend probe OK.</p><p>AUTH_URL=${authUrl}</p>`,
    text: `Localhost Resend probe OK. AUTH_URL=${authUrl}`,
  }),
});

const body = await res.text();
console.log("status:", res.status);
console.log("body:", body);

if (!res.ok) {
  console.error(
    "\nIf this says you can only send to your own email, use the address on your Resend account.",
  );
  process.exit(1);
}

console.log("\nSuccess — check that inbox (and spam).");
