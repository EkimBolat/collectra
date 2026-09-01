// One-off credential rotation for the demo accounts. Reads both the current
// and new password from the environment (never hardcoded — this script is
// committed to a public repo) and signs in as each demo user to change it
// via the self-service auth.updateUser API.
//
// Usage:
//   OLD_PASSWORD=... NEW_PASSWORD=... node scripts/rotate-demo-passwords.mjs
import fs from "node:fs";
import path from "node:path";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";

if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OLD_PASSWORD = process.env.OLD_PASSWORD;
const NEW_PASSWORD = process.env.NEW_PASSWORD;

if (!OLD_PASSWORD || !NEW_PASSWORD) {
  console.error("Set OLD_PASSWORD and NEW_PASSWORD environment variables first.");
  process.exit(1);
}

const USERNAMES = ["kemalkoleksiyon", "nazlipostaci", "ayseantika", "cemvinyl", "mustafapara"];

for (const username of USERNAMES) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const email = `${username}@example.com`;
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: OLD_PASSWORD,
  });
  if (signInError) {
    console.error(username, "sign-in failed:", signInError.message);
    continue;
  }
  const { error: updateError } = await supabase.auth.updateUser({ password: NEW_PASSWORD });
  if (updateError) {
    console.error(username, "password update failed:", updateError.message);
  } else {
    console.log(username, "-> password rotated");
  }
}
