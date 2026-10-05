import { FastifyInstance } from "fastify";
import { pool } from "../db";
import { createWebsiteSchema, CreateWebsiteBody } from "../schemas/website";

type BusinessParams = {
  id: string;
};

export async function websiteRoutes(app: FastifyInstance) {
  app.post<{
    Params: BusinessParams;
    Body: CreateWebsiteBody;
  }>("/businesses/:id/websites", async (request, reply) => {
    const validation = createWebsiteSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        errors: validation.error.issues,
      });
    }

    const businessId = Number(request.params.id);

    const businessResult = await pool.query(
      "SELECT id FROM businesses WHERE id = $1",
      [businessId],
    );

    if (businessResult.rows.length === 0) {
      return reply.status(404).send({
        message: "Business not found",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO websites (business_id, url)
        VALUES ($1, $2)
        RETURNING *
        `,
      [businessId, validation.data.url],
    );

    return reply.status(201).send(result.rows[0]);
  });

  app.delete<{
    Params: {
      id: string;
    };
  }>("/websites/:id", async (request, reply) => {
    const id = Number(request.params.id);

    const result = await pool.query(
      `
            DELETE FROM websites
            WHERE id = $1
            RETURNING *
            `,
      [id],
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Website not found",
      });
    }

    return reply.status(204).send();
  });

  app.get<{
    Params: BusinessParams;
  }>("/businesses/:id/websites", async (request, reply) => {
    const businessId = Number(request.params.id);

    const result = await pool.query(
      `
      SELECT *
      FROM websites
      WHERE business_id = $1
      ORDER BY id
      `,
      [businessId],
    );

    return result.rows;
  });
}
