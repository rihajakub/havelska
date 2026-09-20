import { spawn } from "node:child_process";
const password = "smoke-only-password";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3101"], { cwd: process.cwd(), env: { ...process.env, VERCEL: "1", ENABLE_PRODUCTION_APP: "true", APP_PASSWORD: password }, stdio: ["ignore", "pipe", "pipe"] });
const ready = new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error("Server se nespustil včas.")), 15_000); const inspect = (chunk) => { if (String(chunk).includes("Ready")) { clearTimeout(timer); resolve(); } }; server.stdout.on("data", inspect); server.stderr.on("data", inspect); server.once("exit", (code) => reject(new Error(`Server skončil s kódem ${code}.`))); });
async function fetchWithRetry(options) { let lastError; for (let attempt = 0; attempt < 20; attempt += 1) { try { return await fetch("http://127.0.0.1:3101/", options); } catch (error) { lastError = error; } await new Promise((resolve) => setTimeout(resolve, 250)); } throw lastError; }
try {
  await ready;
  const anonymous = await fetchWithRetry();
  if (anonymous.status !== 401) throw new Error(`Anonymní požadavek měl vrátit 401, vrátil ${anonymous.status}.`);
  const credentials = Buffer.from(`havelska:${password}`).toString("base64");
  const authorized = await fetchWithRetry({ headers: { authorization: `Basic ${credentials}` } });
  if (!authorized.ok || !(await authorized.text()).includes("Produkční provoz je zatím uzamčený")) throw new Error("Ověřené přihlášení nevrátilo chráněnou stránku.");
  console.log("OK password protection");
} finally { server.kill("SIGTERM"); }
