const { app } = require("../app");
const { style } = require("../utils/Style");
const { collection } = require("../utils/Collection");
const { user } = require("../utils/User");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const method = require("../const/http-methods");

let server;

describe("Style Route", () => {
  let header;
  let userData;
  let mockUserLoginResolveToken;
  let itemData;
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

    styleData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      collection: faker.string.uuid(),
      creator: userData.id,
      brand: faker.string.uuid(),
      images: [faker.string.uuid(), faker.string.uuid()],
      tags: ["tag1", "tag2"],
    };

    mockStyleResolveValue = {
      id: jest.fn(() => styleData.id),
      name: jest.fn(() => styleData.name),
      description: jest.fn(() => styleData.description),
      collection: { id: jest.fn(() => styleData.collection) },
      creator: { id: jest.fn(() => styleData.creator) },
      images: jest.fn(() => styleData.images),
      tags: jest.fn(() => styleData.tags),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400_BAD_REQUEST if name and description not provided", async () => {
      const res = await request(server).post("/api/style").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 404_NOT_FOUND if collection not found", async () => {
      jest.spyOn(collection, "find").mockResolvedValue(null);

      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send({ ...styleData, collection: "invalid_id", id: undefined });

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send(style);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if style created", async () => {
      jest.spyOn(style, "save").mockResolvedValue(mockStyleResolveValue);
      jest
        .spyOn(collection, "find")
        .mockResolvedValue({ id: faker.string.uuid() });

      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send({ ...styleData, id: undefined });

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 200_OK if style found", async () => {
      jest.spyOn(style, "findMany").mockResolvedValue([mockStyleResolveValue]);

      const res = await request(server).get(`/api/style`).set(header);

      expect(res.status).toBe(status.OK);
    });

    it("Should return 404_NOT_FOUND if no style found", async () => {
      const res = await request(server).get("/api/style").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("GET /:style", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      const res = await request(server)
        .get("/api/style/invalid_style_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style found", async () => {
      jest.spyOn(style, "find").mockResolvedValue(mockStyleResolveValue);
      const res = await request(server)
        .get(`/api/style/${style.id}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:style", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      const res = await request(server)
        .delete("/api/style/invalid_style_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if style deleted", async () => {
      jest.spyOn(style, "find").mockResolvedValue(mockStyleResolveValue);
      jest.spyOn(style, "delete").mockResolvedValue(mockStyleResolveValue);

      const res = await request(server)
        .delete(`/api/style/${style.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("GET /me", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      jest.spyOn(style, "findMany").mockResolvedValue([]);

      const res = await request(server).get("/api/style/me").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style found", async () => {
      jest.spyOn(style, "findMany").mockResolvedValue([mockStyleResolveValue]);

      const res = await request(server).get(`/api/style/me`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });
});
