const app = require("../app");
const request = require("supertest");
const prisma = require("../functions/prisma");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");
const method = require("../const/http-methods");
const {
  createTestUser,
  createTestCollection,
  createTestStyle,
} = require("../functions/testHelpers");
let server;

describe("Collection route", () => {
  let user;
  let collection = {};
  let newCollection = {};
  let style;
  let header;

  beforeAll(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    const { account, login } = await createTestUser();
    user = account;
    header = { Authorization: `Bearer ${login.token}` };
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.collection.deleteMany(),
      prisma.style.deleteMany(),
    ]);

    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400_BAD_REQUEST if name and description are not given", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server).post("/api/collection").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      collection.tags = "tag1";

      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/collection")
        .set(header)
        .send(collection);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED collection created", async () => {
      collection.name = faker.commerce.productName();
      collection.description = faker.commerce.productDescription();
      collection.tags = ["tag1", "tag2"];

      const mockResponse = {
        status: status.CREATED,
        body: { error: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/collection")
        .set(header)
        .send(collection);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no collection found", async () => {
      await prisma.collection.deleteMany();

      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/collection").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if collection found", async () => {
      collection = await createTestCollection(user.id);

      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/collection").set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:collection", () => {
    it("Should return 404_NOT_FOUND if collection not fouund", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get("/api/collection/invalid_collection_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if collection found", async () => {
      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/collection/${collection.id}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:collection/styles", () => {
    it("Should return 404_NOT_FOUND if no style found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/collection/${collection.id}/styles`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style is found", async () => {
      await createTestStyle(user.id, collection.id);

      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/collection/${collection.id}/styles`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /:collection/favorite", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/collection/invalid_collection_id/favorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if collection favorited", async () => {
      const mockResponse = {
        status: status.CREATED,
        body: { message: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);

      const res = await request(server)
        .post(`/api/collection/${collection.id}/favorite`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("DELETE /:collection/unfovorite", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/collection/invalid_collection_id/favorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if collection unfavorited", async () => {
      const mockResponse = {
        status: status.CREATED,
        body: { error: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/collection/${collection.id}/favorite`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("PUT /:collection/upvote", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/collection/invalid_collection_id/upvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if collection upvoted", async () => {
      const mockResponse = {
        status: status.CREATED,
        body: { error: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put(`/api/collection/${collection.id}/upvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PUT /:collection/downvote", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/collection/invalid_collection_id/upvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if collection downvoted", async () => {
      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put(`/api/collection/${collection.id}/downvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:collection/unvote", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/collection/invalid_collection_id/unvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if collection unvoted", async () => {
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/collection/${collection.id}/unvote`)
        .set(header);

      expect(res.status).toBe(204);
    });

    it("Should return 404_NOT_FOUND if vote not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/collection/${collection.id}/unvote`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("PATCH /:collection", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);
      const res = await request(server)
        .patch("/api/collection/invalid_collection_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      newCollection.tags = "tag";

      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);
      const res = await request(server)
        .patch(`/api/collection/${collection.id}`)
        .set(header)
        .send(newCollection);
    });

    it("Should return 200_OK if collection updated", async () => {
      newCollection.tags = ["newTag1", "newTag2"];

      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .patch(`/api/collection/${collection.id}`)
        .set(header)
        .send(collection);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:collection", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/collection/invalid_collection_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204 if collection deleted", async () => {
      const mockResponse = {
        status: status.NO_CONTENT,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/collection/${collection.id}`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });
});
