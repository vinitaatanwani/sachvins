// Dev-only helper: boots a self-contained local Postgres (no Docker/Homebrew
// required) so the app can be run and verified end-to-end in this environment.
// Production should point DATABASE_URL / DIRECT_URL at Supabase instead.
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.join(__dirname, "..", ".localdb");
const alreadyInitialised = fs.existsSync(path.join(databaseDir, "PG_VERSION"));

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "password",
  port: 5433,
  persistent: true,
});

const command = process.argv[2] ?? "start";

if (command === "start") {
  if (!alreadyInitialised) await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase("clarity_method");
  } catch {
    // already exists
  }
  console.log("Local Postgres ready at postgres://postgres:password@localhost:5433/clarity_method");
  process.on("SIGINT", async () => {
    await pg.stop();
    process.exit(0);
  });
  // keep process alive
  await new Promise(() => {});
} else if (command === "stop") {
  await pg.start().catch(() => {});
  await pg.stop();
}
