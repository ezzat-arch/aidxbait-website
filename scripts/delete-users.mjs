// Deletes users completely from the DB (all related rows + auth account) by
// calling the delete_user_completely() SQL function via the service role.
//
// Run:  node scripts/delete-users.mjs user2@mail.com 01234567890 7
//       node scripts/delete-users.mjs --dry-run user2@mail.com
//
// Arguments are matched against users.email, users.phone_number, or users.id.
// Nothing is deleted until you confirm the listed users at the prompt
// (skip the prompt with --yes).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const autoYes = args.includes("--yes");
const targets = args.filter((a) => !a.startsWith("--"));

if (!targets.length) {
  console.error("Usage: node scripts/delete-users.mjs [--dry-run] [--yes] <email|phone|id> ...");
  process.exit(1);
}

async function resolve(target) {
  const filters = [`email.eq.${target}`, `phone_number.eq.${target}`];
  if (/^\d+$/.test(target)) filters.push(`id.eq.${target}`);

  const { data, error } = await db
    .from("users")
    .select("id, email, phone_number, first_name, last_name, user_type, is_soft_deleted")
    .or(filters.join(","));

  if (error) throw new Error(`lookup "${target}" failed: ${error.message}`);
  return { target, rows: data ?? [] };
}

async function main() {
  const found = [];
  for (const t of targets) {
    const { rows } = await resolve(t);
    if (!rows.length) {
      console.log(`  ✗ "${t}" — no matching user, skipped`);
      continue;
    }
    for (const u of rows) {
      if (found.some((f) => f.id === u.id)) continue; // same user matched twice
      found.push(u);
      const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || "(no name)";
      console.log(
        `  ✓ id=${u.id}  ${name}  <${u.email ?? "no email"}>  ${u.phone_number}  ` +
        `[${u.user_type}]${u.is_soft_deleted ? " (soft-deleted)" : ""}`
      );
    }
  }

  if (!found.length) {
    console.log("\nNothing to delete.");
    return;
  }

  if (dryRun) {
    console.log(`\nDry run — ${found.length} user(s) would be deleted. Nothing was changed.`);
    return;
  }

  if (!autoYes) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `\nPermanently delete the ${found.length} user(s) above and ALL their data? Type "DELETE" to confirm: `
    );
    rl.close();
    if (answer.trim() !== "DELETE") {
      console.log("Aborted. Nothing was deleted.");
      return;
    }
  }

  console.log("");
  for (const u of found) {
    const { data, error } = await db.rpc("delete_user_completely", { p_user_id: u.id });
    if (error) {
      console.error(`  ✗ id=${u.id} failed: ${error.message}`);
      continue;
    }
    if (data?.error) {
      console.error(`  ✗ id=${u.id}: ${data.error}`);
      continue;
    }
    const rows = Object.entries(data.deleted ?? {})
      .map(([table, n]) => `${table}=${n}`)
      .join(", ");
    console.log(`  ✓ id=${u.id} deleted — ${rows || "no related rows"}`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
