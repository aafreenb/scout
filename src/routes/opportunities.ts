import { FastifyInstance } from "fastify";
import { pool } from "../db";
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  CreateOpportunityBody,
  UpdateOpportunityBody,
} from "../schemas/opportunity";

type BusinessParams = {
  id: string;
};

type OpportunityParams = {
  id: string;
};

export async function opportunityRoutes(
  app: FastifyInstance
) {
  // GET opportunities for a business
  app.get<{ Params: BusinessParams }>(
    "/businesses/:id/opportunities",
    async (request) => {
      const businessId = Number(request.params.id);

      const result = await pool.query(
        `
        SELECT *
        FROM opportunities
        WHERE business_id = $1
        ORDER BY id DESC
        `,
        [businessId]
      );

      return result.rows;
    }
  );

  // POST opportunity
  app.post<{
    Params: BusinessParams;
    Body: CreateOpportunityBody;
  }>(
    "/businesses/:id/opportunities",
    async (request, reply) => {
      const businessId = Number(request.params.id);

      const validation =
        createOpportunitySchema.safeParse(request.body);

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
        title,
        description,
        status,
      } = validation.data;

      const result = await pool.query(
        `
        INSERT INTO opportunities (
          business_id,
          title,
          description,
          status
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          businessId,
          title,
          description ?? null,
          status,
        ]
      );

      return reply.status(201).send(result.rows[0]);
    }
  );

  // PATCH opportunity
  app.patch<{
    Params: OpportunityParams;
    Body: UpdateOpportunityBody;
  }>(
    "/opportunities/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const validation =
        updateOpportunitySchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

      const {
        title,
        description,
        status,
      } = validation.data;

      const result = await pool.query(
        `
        UPDATE opportunities
        SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status)
        WHERE id = $4
        RETURNING *
        `,
        [
          title,
          description,
          status,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Opportunity not found",
        });
      }

      return result.rows[0];
    }
  );

  // DELETE opportunity
  app.delete<{ Params: OpportunityParams }>(
    "/opportunities/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const result = await pool.query(
        `
        DELETE FROM opportunities
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Opportunity not found",
        });
      }

      return reply.status(204).send();
    }
  );
}