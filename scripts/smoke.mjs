import { spawn } from "node:child_process";

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3100"], {
  cwd: process.cwd(),
  env: { ...process.env, LOCAL_DEV_BYPASS_AUTH: "true" },
  stdio: ["ignore", "pipe", "pipe"],
});

const ready = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("Server se nespustil včas.")), 15_000);
  const inspect = (chunk) => {
    if (String(chunk).includes("Ready")) {
      clearTimeout(timer);
      resolve();
    }
  };
  server.stdout.on("data", inspect);
  server.stderr.on("data", inspect);
  server.once("exit", (code) => reject(new Error(`Server skončil s kódem ${code}.`)));
});

const expectations = [
  ["/", "Nejdřív rozděl zásoby"],
  ["/inventar", "Inventář prádla"],
  ["/pobyty", "Zatím žádný pobyt"],
  ["/cesta?turns=3", "Co vzít do bytu"],
];

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try { return await fetch(url); } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw lastError;
}

try {
  await ready;
  for (const [path, expected] of expectations) {
    const response = await fetchWithRetry(`http://127.0.0.1:3100${path}`);
    const html = await response.text();
    if (!response.ok || !html.includes(expected)) throw new Error(`${path} neobsahuje očekávaný text: ${expected}`);
    console.log(`OK ${path}`);
  }
} finally {
  server.kill("SIGTERM");
}
