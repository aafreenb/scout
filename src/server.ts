import Fastify from "fastify";

type Business = {
  id: number;
  name: string;
  industry: string;
  city: string;
};

type CreateBusinessBody = {
  name: string;
  industry: string;
  city: string;
};

type BusinessParams = {
  id: string;
};

type UpdateBusinessBody = {
  name?: string;
  industry?: string;
  city?: string;
};

const app = Fastify();

const businesses = [
  {
    id: 1,
    name: "The Oberoi Rajvilas",
    industry: "Hospitality",
    city: "Jaipur",
  },
  {
    id: 2,
    name: "Some Cool Brand",
    industry: "Fashion",
    city: "Jaipur",
  },
];

app.get("/health", async () => {
  return { status: "ok" };
});

app.get("/businesses", async () => {
  return businesses;
});

app.get<{ Params: BusinessParams }>(
  "/businesses/:id",

  async (request, reply) => {
    const id = Number(request.params.id);
    const business = businesses.find((business) => business.id === id);

    if (!business) {
      return reply.status(404).send({
        message: "Business not found",
      });
    }
    return business;
  },
);

app.post<{ Body: CreateBusinessBody }>("/businesses", async (request) => {
  const newBusiness: Business = {
    id: businesses.length + 1,
    ...request.body,
  };

  businesses.push(newBusiness);
  return newBusiness;
});

app.delete<{ Params: BusinessParams }>(
  "/businesses/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    const businessIndex = businesses.findIndex(
      (business) => business.id === id,
    );

    if (businessIndex === -1) {
      return reply.status(404).send({
        message: "Business not found",
      });
    }

    businesses.splice(businessIndex, 1);

    return reply.status(204).send();
  },
);

app.patch<{ Params: BusinessParams; Body: UpdateBusinessBody }>(
  "/businesses/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    const business = businesses.find((business) => business.id === id);

    if (!business) {
      return reply.status(404).send({
        message: "Business not found",
      });
    }

    Object.assign(business, request.body);

    return business;
  },
);

app.listen({
  port: 3000,
});
