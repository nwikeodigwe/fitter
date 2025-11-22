const { app } = require("../app");
const request = require("supertest");
const { users } = require("../utils/user");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");

let server;

describe("Auth route", () => {
  let userData;
  let endpoint;

  beforeAll(async () => {
    server = app.listen(0);
    endpoint = "/api/auth";

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
      .spyOn(users, "createResetToken")
      .mockResolvedValue(faker.string.alphanumeric);
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
      jest.spyOn(users, "find").mockResolvedValue(mockUserResolveValue);
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: userData.email, password: userData.password });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if user is created", async () => {
      jest.spyOn(users, "mail").mockResolvedValue(true);

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

    it("Should return 404_NOT_FOUND if user is not found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(null);

      const res = await request(server).post("/api/auth/signin").send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if password is invalid", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);
      jest.spyOn(users, "passwordMatch").mockResolvedValue(false);

      const res = await request(server)
        .post(`${endpoint}/signin`)
        .send({ email: faker.internet.email(), password: "invalid_password" });

      expect(users.passwordMatch).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 200_OK if user is found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);
      jest.spyOn(users, "passwordMatch").mockResolvedValue(true);

      const res = await request(server).post(`${endpoint}/signin`).send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /reset", () => {
    it("should return 400_BAD_REQUEST if email is invalid", async () => {
      const res = await request(server).post("/api/auth/reset");

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if user is not found", async () => {
      const res = await request(server)
        .post(`${endpoint}/reset`)
        .send({ email: "invalid_email@email.com" });

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if reset successful", async () => {
      jest.spyOn(users, "createResetToken").mockResolvedValue();

      const res = await request(server)
        .post(`${endpoint}/reset`)
        .send({ email: userData.email });

      expect(users.createResetToken).toHaveBeenCalled();
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
        .post(`${endpoint}/reset/invalid_token`)
        .send({ password: userData.password });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 200_OK if password reset", async () => {
      jest
        .spyOn(users, "isValidResetToken")
        .mockResolvedValue({ user: { id: "user_id" } });

      res = await request(server)
        .post(`${endpoint}/reset/token`)
        .send({ password: faker.internet.password() });

      expect(users.isValidResetToken).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });
});
