const { app } = require("../app");
const { item } = require("../utils/Item");
const { user } = require("../utils/User");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const method = require("../const/http-methods");

const { response } = require("../functions/testHelpers");
let server;

describe("Item route", () => {
  let header;
  let userData;
  let mockUserLoginResolveToken;
  let itemData;
  let mockItemResolveValue;
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

    itemData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      creator: userData.id,
      brand: faker.string.uuid(),
      images: [faker.string.uuid(), faker.string.uuid()],
      tags: ["tag1", "tag2"],
    };

    mockItemResolveValue = {
      id: jest.fn(() => itemData.id),
      name: jest.fn(() => itemData.name),
      description: jest.fn(() => itemData.description),
      author: { id: jest.fn(() => itemData.author) },
      images: jest.fn(() => itemData.images),
      tags: jest.fn(() => itemData.tags),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400_BAD_REQUEST if name and description not provided", async () => {
      const res = await request(server).post("/api/item").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if image not provided", async () => {
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send({ ...itemData, images: undefined, id: true });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send({ ...itemData, tags: "tags", id: true });
      newItem = {};

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if brand not provided", async () => {
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send({ ...itemData, brand: undefined, id: undefined });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if item created", async () => {
      jest.spyOn(item, "find").mockResolvedValue(null);
      jest.spyOn(item, "save").mockResolvedValue(mockItemResolveValue);
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send({ ...itemData, id: undefined });

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      jest.spyOn(item, "findMany").mockResolvedValue([]);

      const res = await request(server).get("/api/item").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK item found", async () => {
      jest.spyOn(item, "findMany").mockResolvedValue([mockItemResolveValue]);

      const res = await request(server).get(`/api/item`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:item", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      jest.spyOn(item, "find").mockResolvedValue(null);

      const res = await request(server).get("/api/item/ItemId").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK item found", async () => {
      jest.spyOn(item, "find").mockResolvedValue(mockItemResolveValue);

      const res = await request(server).get(`/api/item/${item.id}`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:item", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      jest.spyOn(item, "find").mockResolvedValue(null);

      const res = await request(server)
        .get("/api/item/invalid_item_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK item found", async () => {
      jest.spyOn(item, "find").mockResolvedValue(mockItemResolveValue);

      const res = await request(server).get(`/api/item/${item.id}`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /:item", () => {
    it("Should return 404_NOT_FOUND if item not found", async () => {
      jest.spyOn(item, "find").mockResolvedValue(null);

      const res = await request(server)
        .patch("/api/item/invalid_item_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if item updated", async () => {
      jest.spyOn(item, "find").mockResolvedValue(mockItemResolveValue);
      jest.spyOn(item, "save").mockResolvedValue(mockItemResolveValue);

      const res = await request(server)
        .patch(`/api/item/${item.id}`)
        .set(header)
        .send({ name: faker.commerce.productName() });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:item", () => {
    it("Should return 404_NOT_FOUND if item not found", async () => {
      jest.spyOn(item, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete("/api/item/invalid_item_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if item deleted", async () => {
      jest.spyOn(item, "find").mockResolvedValue(mockItemResolveValue);
      jest.spyOn(item, "delete").mockResolvedValue(mockItemResolveValue);

      const res = await request(server)
        .delete(`/api/item/${item.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
