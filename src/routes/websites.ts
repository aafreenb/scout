import { FastifyInstance } from "fastify";
import { pool } from "../db";
import {
  createWebsiteSchema,
  updateWebsiteSchema,
  CreateWebsiteBody,
  UpdateWebsiteBody,
  WebsiteParams,
} from "../schemas/website";

export async function websiteRoutes(
  app: FastifyInstance
) {
  // GET /businesses/:id/websites
  app.get<{ Params: { id: string } }>(
    "/businesses/:id/websites",
    async (request, reply) => {
      const businessId = Number(request.params.id);

      const result = await pool.query(
        `
        SELECT *
        FROM websites
        WHERE business_id = $1
        ORDER BY id
        `,
        [businessId]
      );

      return result.rows;
    }
  );

  // POST /businesses/:id/websites
  app.post<{
    Params: { id: string };
    Body: CreateWebsiteBody;
  }>(
    "/businesses/:id/websites",
    async (request, reply) => {
      const businessId = Number(request.params.id);

      const validation =
        createWebsiteSchema.safeParse(
          request.body
        );

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

      const { url } = validation.data;

      const result = await pool.query(
        `
        INSERT INTO websites (
          business_id,
          url
        )
        VALUES ($1, $2)
        RETURNING *
        `,
        [businessId, url]
      );

      return reply
        .status(201)
        .send(result.rows[0]);
    }
  );

  // PATCH /websites/:id
  app.patch<{
    Params: WebsiteParams;
    Body: UpdateWebsiteBody;
  }>(
    "/websites/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const validation =
        updateWebsiteSchema.safeParse(
          request.body
        );

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

      const { url } = validation.data;

      const result = await pool.query(
        `
        UPDATE websites
        SET url = COALESCE($1, url)
        WHERE id = $2
        RETURNING *
        `,
        [url, id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Website not found",
        });
      }

      return result.rows[0];
    }
  );

  // DELETE /websites/:id
  app.delete<{ Params: WebsiteParams }>(
    "/websites/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const result = await pool.query(
        `
        DELETE FROM websites
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Website not found",
        });
      }

      return reply.status(204).send();
    }
  );
}