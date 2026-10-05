import Fastify from "fastify";
import { pool } from "./db";
import { businessRoutes } from "./routes/businesses";
import { websiteRoutes } from "./routes/websites";

const app = Fastify();

app.get("/health", async () => {
  const result = await pool.query("SELECT NOW()");

  return {
    status: "ok",
    databaseTime: result.rows[0].now,
  };
});

app.register(businessRoutes);
app.register(websiteRoutes);

app.listen({
  port: 3000,
});