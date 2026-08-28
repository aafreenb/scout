import Fastify from "fastify";
import { pool } from "./db";
import { z } from "zod";

const createBusinessSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  city: z.string().min(1),
});

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
});

type Business = {
  id: number;
  name: string;
  industry: string;
  city: string;
};

type CreateBusinessBody = z.infer<typeof createBusinessSchema>;

type BusinessParams = {
  id: string;
};

type UpdateBusinessBody = z.infer<typeof updateBusinessSchema>;

const app = Fastify();

app.get("/health", async () => {
  const result = await pool.query("SELECT NOW()");

  return {
    status: "ok",
    databaseTime: result.rows[0].now,
  };
});

app.get("/businesses", async () => {
  const result = await pool.query("SELECT * FROM businesses ORDER BY id");
  return result.rows;
});

app.get<{ Params: BusinessParams }>(
  "/businesses/:id",

  async (request, reply) => {
    const id = Number(request.params.id);
    const result = await pool.query("SELECT * FROM businesses WHERE id = $1", [
      id,
    ]);

    const business = result.rows[0];

    if (!business) {
      return reply.status(404).send({
        message: "Business not found",
      });
    }
    return business;
  },
);

app.post<{ Body: CreateBusinessBody }>(
  "/businesses",
  async (request, reply) => {
    const validation = createBusinessSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        errors: validation.error.issues,
      });
    }

    const { name, industry, city } = validation.data;

    const result = await pool.query(
      `
    INSERT INTO businesses (name, industry, city)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
      [name, industry, city],
    );
    return reply.status(201).send(result.rows[0]);
  },
);

app.delete<{ Params: BusinessParams }>(
  "/businesses/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    const result = await pool.query(
      "DELETE FROM businesses WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Business not found",
      });
    }

    return reply.status(204).send();
  },
);

app.patch<{ Params: BusinessParams; Body: UpdateBusinessBody }>(
  "/businesses/:id",
  async (request, reply) => {
    const validation = updateBusinessSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        errors: validation.error.issues,
      });
    }
    const id = Number(request.params.id);

    const { name, industry, city } = validation.data;

    const result = await pool.query(
      `
      UPDATE businesses
      SET
        name = COALESCE($1, name),
        industry = COALESCE($2, industry),
        city = COALESCE($3, city)
      WHERE id = $4
      RETURNING *
    `,
      [name, industry, city, id],
    );

    const business = result.rows[0];

    if (!business) {
      return reply.status(404).send({
        message: "Business not found",
      });
    }

    return business;
  },
);

app.listen({
  port: 3000,
});
