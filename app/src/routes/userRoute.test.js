const { app } = require("../app");
const { users } = require("../utils/User");
const { styles } = require("../utils/Style");
const { collections } = require("../utils/Collection");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const jwt = require("jsonwebtoken");
const request = require("supertest");
let server;

describe("User route", () => {
  let header;
  let userData;
  let mockUserLoginResolveToken;
  let endpoint;

  beforeAll(async () => {
    endpoint = "/api/users";
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

    jest.spyOn(users, "login").mockResolvedValue(mockUserLoginResolveToken);

    users.email = userData.email;
    users.password = userData.password;
    login = await users.login();

    header = { Authorization: `Bearer ${token}` };

    jest.spyOn(jwt, "verify").mockResolvedValue({
      id: userData.id,
      name: userData.name,
      email: userData.email,
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await server.close();
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no user is found", async () => {
      jest.spyOn(users, "findMany").mockResolvedValue([]);

      const res = await request(server).get(endpoint).set(header);

      expect(users.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if user found", async () => {
      jest.spyOn(users, "findMany").mockResolvedValue(["1", "2"]);

      const res = await request(server).get(endpoint).set(header);

      expect(users.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /:user/subscribe", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(null);

      const res = await request(server)
        .post(`${endpoint}/userId/subscribe`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if subscription successful", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);

      jest.spyOn(users, "subscribe").mockResolvedValue(true);

      const res = await request(server)
        .post(`${endpoint}/${users.id}/subscribe`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(users.subscribe).toHaveBeenCalled();
      expect(res.status).toBe(status.CREATED);
    });

    it("Should return 400_BAD_REQUEST if already subscribed", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);

      jest.spyOn(users, "isSubscribed").mockResolvedValue(true);

      const res = await request(server)
        .post(`${endpoint}/${users.id}/subscribe`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(users.isSubscribed).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("DELETE /:user/unsubscribe", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`${endpoint}/invalid_user_id/unsubscribe`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if unsubscribed", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);

      jest.spyOn(users, "isSubscribed").mockResolvedValue(true);

      jest.spyOn(users, "unsubscribe").mockResolvedValue(true);

      const res = await request(server)
        .delete(`${endpoint}/${users.id}/unsubscribe`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(users.isSubscribed).toHaveBeenCalled();
      expect(users.unsubscribe).toHaveBeenCalled();
      expect(res.status).toBe(status.NO_CONTENT);
    });

    it("Should return 400_BAD_REQUEST if not subscribed", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);

      jest.spyOn(users, "isSubscribed").mockResolvedValue(false);

      const res = await request(server)
        .delete(`${endpoint}/${users.id}/unsubscribe`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(users.isSubscribed).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("GET /:user/style", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(null);

      const res = await request(server)
        .get(`${endpoint}/invalid_user_id/style`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if no style found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);
      jest.spyOn(styles, "findMany").mockResolvedValue([]);
      const res = await request(server)
        .get(`${endpoint}/${users.id}/style`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(styles.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if style found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);

      jest.spyOn(styles, "findMany").mockResolvedValue([{ id: "style_id" }]);

      users.id = userData.id;

      const res = await request(server)
        .get(`${endpoint}/${users.id}/style`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(styles.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:user/collection", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(null);

      const res = await request(server)
        .get(`${endpoint}/invalid_user_id/collection`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if collection found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);
      jest
        .spyOn(collections, "findMany")
        .mockResolvedValue([{ id: "collection_id" }]);

      const res = await request(server)
        .get(`${endpoint}/${users.id}/collection`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(collections.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });

    it("should return 404_NOT_FOUND if no collection found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);
      jest.spyOn(collections, "findMany").mockResolvedValue([]);

      const res = await request(server)
        .get(`${endpoint}/${users.id}/collection`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(collections.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("PATCH /me", () => {
    it("should return 200_OK if data updated", async () => {
      jest.spyOn(users, "save").mockResolvedValue();

      const newname = faker.internet.username();

      const res = await request(server)
        .patch(`${endpoint}/me`)
        .set(header)
        .send({ userData, name: newname, id: undefined });

      expect(users.save).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /profile", () => {
    it("Should return 200_OK if profile updated", async () => {
      jest
        .spyOn(users, "updateProfile")
        .mockResolvedValue({ id: "profile_id" });

      const res = await request(server)
        .patch(`${endpoint}/profile`)
        .set(header)
        .send({ firstname: faker.internet.username, id: undefined });

      expect(users.updateProfile).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /password", () => {
    it("Should return 400_BAD_REQUEST if password is invalid", async () => {
      jest.spyOn(users, "passwordMatch").mockResolvedValue(false);

      const res = await request(server)
        .patch(`${endpoint}/password`)
        .set(header)
        .send({ password: "new_password" });

      expect(users.passwordMatch).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 200_OK if password is updated", async () => {
      jest.spyOn(users, "passwordMatch").mockResolvedValue(true);
      jest.spyOn(users, "save").mockResolvedValue(mockUserLoginResolveToken);

      const res = await request(server)
        .patch(`${endpoint}/password`)
        .set(header)
        .send({ password: faker.internet.password() });

      expect(users.passwordMatch).toHaveBeenCalled();
      expect(users.save).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:user", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(null);

      const res = await request(server).get(`${endpoint}/userId`).set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if user found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);

      const res = await request(server)
        .get(`${endpoint}/${users.id}`)
        .set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /me", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(users, "find").mockResolvedValue(null);

      const res = await request(server).get(`${endpoint}/me`).set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if user exist", async () => {
      jest.spyOn(users, "find").mockResolvedValue(true);

      const res = await request(server).get(`${endpoint}/me`).set(header);

      expect(users.find).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });
});
