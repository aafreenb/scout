import { FastifyInstance } from "fastify";
import { pool } from "../db";
import {
  createObservationSchema,
  updateObservationSchema,
  CreateObservationBody,
  UpdateObservationBody,
} from "../schemas/observation";

type BusinessParams = {
  id: string;
};

type ObservationParams = {
  id: string;
};

export async function observationRoutes(
  app: FastifyInstance
) {
  // GET observations for a business
  app.get<{ Params: BusinessParams }>(
    "/businesses/:id/observations",
    async (request) => {
      const businessId = Number(request.params.id);

      const result = await pool.query(
        `
        SELECT *
        FROM observations
        WHERE business_id = $1
        ORDER BY id DESC
        `,
        [businessId]
      );

      return result.rows;
    }
  );

  // POST observation
  app.post<{
    Params: BusinessParams;
    Body: CreateObservationBody;
  }>(
    "/businesses/:id/observations",
    async (request, reply) => {
      const businessId = Number(request.params.id);

      const validation =
        createObservationSchema.safeParse(request.body);

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

      const { type, content } = validation.data;

      const result = await pool.query(
        `
        INSERT INTO observations (
          business_id,
          type,
          content
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [businessId, type, content]
      );

      return reply.status(201).send(result.rows[0]);
    }
  );

  // PATCH observation
  app.patch<{
    Params: ObservationParams;
    Body: UpdateObservationBody;
  }>(
    "/observations/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const validation =
        updateObservationSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

      const { type, content } = validation.data;

      const result = await pool.query(
        `
        UPDATE observations
        SET
          type = COALESCE($1, type),
          content = COALESCE($2, content)
        WHERE id = $3
        RETURNING *
        `,
        [type, content, id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Observation not found",
        });
      }

      return result.rows[0];
    }
  );

  // DELETE observation
  app.delete<{ Params: ObservationParams }>(
    "/observations/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const result = await pool.query(
        `
        DELETE FROM observations
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Observation not found",
        });
      }

      return reply.status(204).send();
    }
  );
}