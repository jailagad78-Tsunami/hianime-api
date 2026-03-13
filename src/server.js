import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import router from "./routes/index.js";
import { fetchPage } from "./utils/request.js";
const app = new Hono();
app.use("*", cors({ origin: "*", allowMethods: ["GET", "OPTIONS"] }));
app.use("*", logger());
app.route("/api/v1", router);
app.get("/debug", async (c) => {
  try {
    const html = await fetchPage("/home");
    return c.text(html.slice(0, 3000));
  } catch (err) {
    return c.text("Error: " + err.message);
  }
});
app.get("/", (c) => c.json({ name: "HiAnime API", status: "running" }));
app.notFound((c) => c.json({ success: false, message: "Not found" }, 404));
app.onError((err, c) => c.json({ success: false, message: err.message }, 500));
const PORT = parseInt(process.env.PORT || "3030");
console.log(`HiAnime API running at http://localhost:${PORT}`);
export default { port: PORT, fetch: app.fetch, idleTimeout: 60 };