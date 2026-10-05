import { FastifyInstance } from "fastify";
import { pool } from "../db";
import {
  createBusinessSchema,
  updateBusinessSchema,
  CreateBusinessBody,
  UpdateBusinessBody,
  BusinessParams,
} from "../schemas/business";

export async function businessRoutes(app: FastifyInstance) {
  // GET /businesses
  app.get("/businesses", async () => {
    const result = await pool.query(
      "SELECT * FROM businesses ORDER BY id"
    );

    return result.rows;
  });

  // GET /businesses/:id
  app.get<{ Params: BusinessParams }>(
    "/businesses/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const result = await pool.query(
        `
        SELECT
          b.id,
          b.name,
          b.industry,
          b.city,
          w.id AS website_id,
          w.url,
          w.created_at AS website_created_at
        FROM businesses b
        LEFT JOIN websites w
          ON w.business_id = b.id
        WHERE b.id = $1
        ORDER BY w.id
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Business not found",
        });
      }

      const business = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        industry: result.rows[0].industry,
        city: result.rows[0].city,
        websites: result.rows
          .filter((row) => row.website_id !== null)
          .map((row) => ({
            id: row.website_id,
            url: row.url,
            created_at: row.website_created_at,
          })),
      };

      return business;
    }
  );

  // POST /businesses
  app.post<{ Body: CreateBusinessBody }>(
    "/businesses",
    async (request, reply) => {
      const validation = createBusinessSchema.safeParse(
        request.body
      );

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
        [name, industry, city]
      );

      return reply.status(201).send(result.rows[0]);
    }
  );

  // PATCH /businesses/:id
  app.patch<{
    Params: BusinessParams;
    Body: UpdateBusinessBody;
  }>(
    "/businesses/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const validation = updateBusinessSchema.safeParse(
        request.body
      );

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

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
        [name, industry, city, id]
      );

      const business = result.rows[0];

      if (!business) {
        return reply.status(404).send({
          message: "Business not found",
        });
      }

      return business;
    }
  );

  // DELETE /businesses/:id
  app.delete<{ Params: BusinessParams }>(
    "/businesses/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const result = await pool.query(
        `
        DELETE FROM businesses
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Business not found",
        });
      }

      return reply.status(204).send();
    }
  );
}