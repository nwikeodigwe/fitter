const { app } = require("../app");
const request = require("supertest");
const { user } = require("../utils/User");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");

let server;

describe("Auth route", () => {
  let userData;

  beforeAll(async () => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    mockUserResolveValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
      password: jest.fn(() => userData.password),
    };

    jest
      .spyOn(user, "createResetToken")
      .mockResolvedValue(faker.string.alphanumeric);

    server = app.listen(0);
  });

  afterAll(() => {
    jest.restoreAllMocks();
    server.close();
  });

  describe("POST /signup", () => {
    it("Should return 400_BAD_REQUEST if email and password is invalid", async () => {
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: null, password: null });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if user already exists", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserResolveValue);
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: userData.email, password: userData.password });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if user is created", async () => {
      jest.spyOn(user, "mail").mockResolvedValue(true);

      const res = await request(server).post("/api/auth/signup").send({
        email: userData.email,
        password: userData.password,
      });

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("POST /signin", () => {
    it("Should return 400_BAD_REQUEST if email and password is invalid", async () => {
      const res = await request(server).post("/api/auth/signin").send({});

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 200_OK if user is found", async () => {
      const res = await request(server)
        .post("/api/auth/signin")
        .send({ email: userData.email, password: userData.password });

      expect(res.status).toBe(status.OK);
    });

    it("Should return 400_BAD_REQUEST if password is invalid", async () => {
      const res = await request(server)
        .post("/api/auth/signin")
        .send({ email: userData.email, password: "invalid_password" });
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 404_NOT_FOUND if user is not found", async () => {
      user.id = undefined;
      user.name = undefined;
      user.email = undefined;

      const res = await request(server)
        .post("/api/auth/signin")
        .send({ email: "invalid_email", password: userData.password });

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("POST /reset", () => {
    it("should return 400_BAD_REQUEST if email is invalid", async () => {
      const res = await request(server).post("/api/auth/reset");

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if user is not found", async () => {
      const res = await request(server)
        .post("/api/auth/reset")
        .send({ email: "invalid_email@email.com" });

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if reset successful", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      user.email = userData.email;
      user.name = userData.name;
      await user.save();

      const res = await request(server)
        .post("/api/auth/reset")
        .send({ email: userData.email });
      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /reset/:token", () => {
    it("should return 400_BAD_REQUEST if token or password is undefined", async () => {
      res = await request(server).post(`/api/auth/reset/undefined_token`);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if token is invalid", async () => {
      const res = await request(server)
        .post("/api/auth/reset/invalid_token")
        .send({ password: userData.password });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 200_OK if password reset", async () => {
      jest
        .spyOn(user, "createResetToken")
        .mockResolvedValue(
          faker.string.alphanumeric({ length: 20, casing: "lower" })
        );
      const token = await user.createResetToken();

      jest.spyOn(user, "isValidResetToken").mockResolvedValue(user);

      res = await request(server)
        .post(`/api/auth/reset/${token}`)
        .send({ password: faker.internet.password() });

      expect(res.status).toBe(status.OK);
    });
  });
});
