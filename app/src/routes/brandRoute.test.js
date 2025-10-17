const jwt = require("jsonwebtoken");
const { app } = require("../app");
const { brand } = require("../utils/Brand");
const { user } = require("../utils/User");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");
const request = require("supertest");

let server;

describe("Brand route", () => {
  let header;
  let userData;
  let mockUserLoginResolveToken;
  let brandData;
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

    brandData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      owner: userData.id,
      logo: faker.string.uuid(),
      tags: ["tag1", "tag2"],
    };

    mockBrandResolveValue = {
      id: jest.fn(() => brandData.id),
      name: jest.fn(() => brandData.name),
      description: jest.fn(() => brandData.description),
      tags: jest.fn(() => brandData.tags),
      owner: { id: jest.fn(() => brandData.owner) },
      logo: jest.fn(() => brandData.logo),
      tags: jest.fn(() => brandData.tags),
    };

    commentData = {
      id: faker.string.uuid(),
      content: faker.lorem.sentence(),
      author: { id: userData.id, name: userData.name },
    };

    mockCommentResolvedValue = {
      id: jest.fn(() => commentData.id),
      content: jest.fn(() => commentData.content),
      author: {
        id: jest.fn(() => commentData.author.id),
        name: jest.fn(() => commentData.author.name),
      },
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    server.close();
  });

  describe("POST /", () => {
    it("should return 400_BAD_REQUEST if  or description is not provided", async () => {
      const res = await request(server).post("/api/brand").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if tag is not an array", async () => {
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send({
          ...brandData,
          id: undefined,
          tags: "tag1",
        });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if brand already exists", async () => {
      jest.spyOn(brand, "find").mockResolvedValue(mockBrandResolveValue);
      brand.id = brandData.id;

      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send({ ...brandData, id: undefined });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if brand is created", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);
      jest.spyOn(brand, "find").mockResolvedValue(null);
      jest.spyOn(brand, "save").mockResolvedValue(mockBrandResolveValue);

      brand.id = undefined;

      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send({ ...brandData, id: undefined });

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 200_OK if brand found", async () => {
      jest.spyOn(brand, "findMany").mockResolvedValue([mockBrandResolveValue]);

      const res = await request(server).get("/api/brand").set(header);

      expect(res.status).toBe(status.OK);
    });

    it("Should return 404_NOT_FOUND if no brand found", async () => {
      jest.spyOn(brand, "findMany").mockResolvedValue([]);

      const res = await request(server).get("/api/brand").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("GET /:brand", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      const res = await request(server)
        .get("/api/brand/invalid_brand_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if brand is found", async () => {
      jest.spyOn(brand, "find").mockResolvedValue(mockBrandResolveValue);

      const res = await request(server)
        .get(`/api/brand/${brand.id}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /:brand", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      const res = await request(server)
        .patch("/api/brand/invalid_brand_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 400_BAD_REQUEST if tag is not an array", async () => {
      jest.spyOn(brand, "find").mockResolvedValue(mockBrandResolveValue);
      const res = await request(server)
        .patch(`/api/brand/${brand.id}`)
        .set(header)
        .send({ tags: "tag" });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 200_OK if brand is updated", async () => {
      jest.spyOn(brand, "find").mockResolvedValue(mockBrandResolveValue);
      jest.spyOn(brand, "save").mockResolvedValue(mockBrandResolveValue);

      brand.id = brandData.id;
      const res = await request(server)
        .patch(`/api/brand/${brand.id}`)
        .set(header)
        .send({ name: faker.commerce.productName() });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:brand", () => {
    it("Should return 404_NOT_FOUND if brand not found", async () => {
      const res = await request(server)
        .delete("/api/brand/invalid_brand_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if brand deleted", async () => {
      jest.spyOn(brand, "find").mockResolvedValue(mockBrandResolveValue);

      const res = await request(server)
        .delete(`/api/brand/${brand.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
