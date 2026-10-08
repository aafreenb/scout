import { FastifyInstance } from "fastify";
import { pool } from "../db";
import {
  createOutreachSchema,
  updateOutreachSchema,
  CreateOutreachBody,
  UpdateOutreachBody,
} from "../schemas/outreach";

type BusinessParams = {
  id: string;
};

type OutreachParams = {
  id: string;
};

export async function outreachRoutes(
  app: FastifyInstance
) {
  // GET outreach for a business
  app.get<{ Params: BusinessParams }>(
    "/businesses/:id/outreach",
    async (request) => {
      const businessId = Number(request.params.id);

      const result = await pool.query(
        `
        SELECT *
        FROM outreach
        WHERE business_id = $1
        ORDER BY id DESC
        `,
        [businessId]
      );

      return result.rows;
    }
  );

  // POST outreach
  app.post<{
    Params: BusinessParams;
    Body: CreateOutreachBody;
  }>(
    "/businesses/:id/outreach",
    async (request, reply) => {
      const businessId = Number(request.params.id);

      const validation =
        createOutreachSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

      const businessResult = await pool.query(
        "SELECT id FROM businesses WHERE id = $1",
        [businessId]
      );

      if (businessResult.rows.length === 0) {
        return reply.status(404).send({
          message: "Business not found",
        });
      }

      const {
        contact_id,
        channel,
        status,
        notes,
        contacted_at,
      } = validation.data;

      const result = await pool.query(
        `
        INSERT INTO outreach (
          business_id,
          contact_id,
          channel,
          status,
          notes,
          contacted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          businessId,
          contact_id ?? null,
          channel,
          status,
          notes ?? null,
          contacted_at ?? null,
        ]
      );

      return reply.status(201).send(result.rows[0]);
    }
  );

  // PATCH outreach
  app.patch<{
    Params: OutreachParams;
    Body: UpdateOutreachBody;
  }>(
    "/outreach/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const validation =
        updateOutreachSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

      const {
        contact_id,
        channel,
        status,
        notes,
        contacted_at,
      } = validation.data;

      const result = await pool.query(
        `
        UPDATE outreach
        SET
          contact_id = COALESCE($1, contact_id),
          channel = COALESCE($2, channel),
          status = COALESCE($3, status),
          notes = COALESCE($4, notes),
          contacted_at = COALESCE($5, contacted_at)
        WHERE id = $6
        RETURNING *
        `,
        [
          contact_id,
          channel,
          status,
          notes,
          contacted_at,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Outreach record not found",
        });
      }

      return result.rows[0];
    }
  );

  // DELETE outreach
  app.delete<{ Params: OutreachParams }>(
    "/outreach/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const result = await pool.query(
        `
        DELETE FROM outreach
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Outreach record not found",
        });
      }

      return reply.status(204).send();
    }
  );
}