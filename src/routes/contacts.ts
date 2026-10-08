import { FastifyInstance } from "fastify";
import { pool } from "../db";
import {
  createContactSchema,
  updateContactSchema,
  CreateContactBody,
  UpdateContactBody,
} from "../schemas/contact";

type BusinessParams = {
  id: string;
};

type ContactParams = {
  id: string;
};

export async function contactRoutes(app: FastifyInstance) {
  // GET contacts for a business
  app.get<{ Params: BusinessParams }>(
    "/businesses/:id/contacts",
    async (request, reply) => {
      const businessId = Number(request.params.id);

      const result = await pool.query(
        `
        SELECT *
        FROM contacts
        WHERE business_id = $1
        ORDER BY id
        `,
        [businessId]
      );

      return result.rows;
    }
  );

  // POST contact
  app.post<{
    Params: BusinessParams;
    Body: CreateContactBody;
  }>(
    "/businesses/:id/contacts",
    async (request, reply) => {
      const businessId = Number(request.params.id);

      const validation = createContactSchema.safeParse(
        request.body
      );

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
        name,
        role,
        email,
        phone,
        linkedin_url,
      } = validation.data;

      const result = await pool.query(
        `
        INSERT INTO contacts (
          business_id,
          name,
          role,
          email,
          phone,
          linkedin_url
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          businessId,
          name,
          role ?? null,
          email ?? null,
          phone ?? null,
          linkedin_url ?? null,
        ]
      );

      return reply.status(201).send(result.rows[0]);
    }
  );

  // PATCH contact
  app.patch<{
    Params: ContactParams;
    Body: UpdateContactBody;
  }>(
    "/contacts/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const validation = updateContactSchema.safeParse(
        request.body
      );

      if (!validation.success) {
        return reply.status(400).send({
          message: "Invalid request body",
          errors: validation.error.issues,
        });
      }

      const {
        name,
        role,
        email,
        phone,
        linkedin_url,
      } = validation.data;

      const result = await pool.query(
        `
        UPDATE contacts
        SET
          name = COALESCE($1, name),
          role = COALESCE($2, role),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          linkedin_url = COALESCE($5, linkedin_url)
        WHERE id = $6
        RETURNING *
        `,
        [
          name,
          role,
          email,
          phone,
          linkedin_url,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Contact not found",
        });
      }

      return result.rows[0];
    }
  );

  // DELETE contact
  app.delete<{ Params: ContactParams }>(
    "/contacts/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      const result = await pool.query(
        `
        DELETE FROM contacts
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          message: "Contact not found",
        });
      }

      return reply.status(204).send();
    }
  );
}