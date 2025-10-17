const { app } = require("../app");
const { user } = require("../utils/User");
const { collection } = require("../utils/Collection");
const { style } = require("../utils/Style");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const method = require("../const/http-methods");

let server;

describe("Collection route", () => {
  let header;
  let userData;
  let mockUserLoginResolveToken;
  let collectionData;
  let mockCollectionResolveValue;
  let styleData;
  let mockStyleResolveValue;
  let mockResponse;

  beforeAll(async () => {
    server = app.listen(0);

    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.username(),
      password: faker.internet.password(),
    };

    const token = jwt.sign(
      {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const refresh = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    mockUserLoginResolveToken = {
      token: refresh,
    };

    jest.spyOn(user, "login").mockResolvedValue(mockUserLoginResolveToken);

    user.email = userData.email;
    user.password = userData.password;
    login = await user.login();

    header = { Authorization: `Bearer ${token}` };

    jest.spyOn(jwt, "verify").mockResolvedValue({
      id: userData.id,
      name: userData.name,
      email: userData.email,
    });

    collectionData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      owner: userData.id,
      logo: faker.string.uuid(),
      tags: ["tag1", "tag2"],
    };

    mockCollectionResolveValue = {
      id: jest.fn(() => collectionData.id),
      name: jest.fn(() => collectionData.name),
      description: jest.fn(() => collectionData.description),
      tags: jest.fn(() => collectionData.tags),
      owner: { id: jest.fn(() => collectionData.owner) },
      logo: jest.fn(() => collectionData.logo),
      tags: jest.fn(() => collectionData.tags),
    };

    styleData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      author: userData.id,
      images: [faker.string.uuid(), faker.string.uuid()],
      tags: ["tag1", "tag2"],
    };

    mockStyleResolveValue = {
      id: jest.fn(() => styleData.id),
      name: jest.fn(() => styleData.name),
      description: jest.fn(() => styleData.description),
      tags: jest.fn(() => styleData.tags),
      author: { id: jest.fn(() => styleData.owner) },
      images: jest.fn(() => styleData.logo),
      tags: jest.fn(() => stylenData.tags),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400_BAD_REQUEST if name and description are not given", async () => {
      const res = await request(server).post("/api/collection").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      collection.tags = "tag1";

      const res = await request(server)
        .post("/api/collection")
        .set(header)
        .send(collection);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED collection created", async () => {
      jest
        .spyOn(collection, "save")
        .mockResolvedValue(mockCollectionResolveValue);

      const res = await request(server)
        .post("/api/collection")
        .set(header)
        .send({ ...collectionData, id: undefined });

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no collection found", async () => {
      jest.spyOn(collection, "findMany").mockResolvedValue([]);

      const res = await request(server).get("/api/collection").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if collection found", async () => {
      jest
        .spyOn(collection, "findMany")
        .mockResolvedValue([mockCollectionResolveValue]);

      const res = await request(server).get("/api/collection").set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:collection", () => {
    it("Should return 404_NOT_FOUND if collection not fouund", async () => {
      jest.spyOn(collection, "find").mockResolvedValue(null);

      const res = await request(server)
        .get("/api/collection/invalid_collection_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if collection found", async () => {
      jest
        .spyOn(collection, "find")
        .mockResolvedValue(mockCollectionResolveValue);

      collection.id = collectionData.id;

      const res = await request(server)
        .get(`/api/collection/${collection.id}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:collection/styles", () => {
    it("Should return 404_NOT_FOUND if no style found", async () => {
      jest.spyOn(style, "findMany").mockResolvedValue([]);

      const res = await request(server)
        .get(`/api/collection/${collection.id}/styles`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style is found", async () => {
      jest.spyOn(style, "findMany").mockResolvedValue([mockStyleResolveValue]);

      const res = await request(server)
        .get(`/api/collection/${collection.id}/styles`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /:collection", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      jest.spyOn(collection, "find").mockResolvedValue(null);
      const res = await request(server)
        .patch("/api/collection/invalid_collection_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      jest
        .spyOn(collection, "find")
        .mockResolvedValue(mockCollectionResolveValue);

      const res = await request(server)
        .patch(`/api/collection/${collection.id}`)
        .set(header)
        .send({
          ...collectionData,
          tags: "tag",
          id: undefined,
        });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 200_OK if collection updated", async () => {
      jest
        .spyOn(collection, "find")
        .mockResolvedValue(mockCollectionResolveValue);

      const newname = faker.commerce.productName();

      jest
        .spyOn(collection, "save")
        .mockResolvedValue({ ...mockCollectionResolveValue, name: newname });

      const res = await request(server)
        .patch(`/api/collection/${collection.id}`)
        .set(header)
        .send({ ...collectionData, name: newname, id: undefined });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:collection", () => {
    it("Should return 404_NOT_FOUND if collection not found", async () => {
      jest.spyOn(collection, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete("/api/collection/invalid_collection_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204 if collection deleted", async () => {
      jest
        .spyOn(collection, "find")
        .mockResolvedValue(mockCollectionResolveValue);

      jest
        .spyOn(collection, "delete")
        .mockResolvedValue(mockCollectionResolveValue);

      const res = await request(server)
        .delete(`/api/collection/${collection.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
