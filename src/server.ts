import Fastify from "fastify";
import cors from "@fastify/cors";
import { pool } from "./db";

import { businessRoutes } from "./routes/businesses";
import { websiteRoutes } from "./routes/websites";
import { contactRoutes } from "./routes/contacts";
import { observationRoutes } from "./routes/observations";
import { opportunityRoutes } from "./routes/opportunities";
import { outreachRoutes } from "./routes/outreach";

const app = Fastify();

app.register(cors, {
  origin: true,
  methods: [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: ["Content-Type"],
});

app.get("/health", async () => {
  const result = await pool.query("SELECT NOW()");

  return {
    status: "ok",
    databaseTime: result.rows[0].now,
  };
});

app.register(businessRoutes);
app.register(websiteRoutes);
app.register(contactRoutes);
app.register(observationRoutes);
app.register(opportunityRoutes);
app.register(outreachRoutes);

app.listen({
  port: 3000,
});