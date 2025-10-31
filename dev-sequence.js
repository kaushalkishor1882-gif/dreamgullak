// dev-sequence.js
import fetch from "node-fetch";

const base = "http://localhost:3000";

const routes = ["/add-money", "/home", "/dashboard", "/"];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  console.log("⚙️ Waiting for Next.js server to start...");
  await delay(5000); // Wait 5 seconds for Next.js to start

  console.log("🚀 Now visiting routes in sequence:\n");

  for (const route of routes) {
    const start = Date.now();
    try {
      const res = await fetch(base + route);
      const time = Date.now() - start;
      console.log(`GET ${route} ${res.status} in ${time}ms`);
    } catch (err) {
      console.log(`❌ Failed to load ${route}:`, err.message);
    }
    await delay(1000); // wait 1s between each request
  }

  console.log("\n✅ All routes visited successfully.");
})();
