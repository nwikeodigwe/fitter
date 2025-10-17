const { app } = require("../app");
const { user } = require("../utils/User");
const { style } = require("../utils/Style");
const { collection } = require("../utils/Collection");
const { profile } = require("../utils/Profile");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const method = require("../const/http-methods");
let server;

describe("User route", () => {
  let header;
  let userData;
  let mockUserLoginResolveToken;
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
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await server.close();
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no user is found", async () => {
      jest.spyOn(user, "findMany").mockResolvedValue([]);

      const res = await request(server).get("/api/user").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if user found", async () => {
      jest.spyOn(user, "findMany").mockResolvedValue(mockUserLoginResolveToken);

      const res = await request(server).get("/api/user").set(header);
      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /:user/subscribe", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(null);

      const res = await request(server)
        .post(`/api/user/userId/subscribe`)
        .set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if subscription successful", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      jest
        .spyOn(user, "subscribe")
        .mockResolvedValue(mockUserLoginResolveToken);

      const res = await request(server)
        .post(`/api/user/${user.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });

    it("Should return 400_BAD_REQUEST if already subscribed", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      jest
        .spyOn(user, "isSubscribed")
        .mockResolvedValue(mockUserLoginResolveToken);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/user/${user.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("DELETE /:user/unsubscribe", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`/api/user/invalid_user_id/unsubscribe`)
        .set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if unsubscribed", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      jest
        .spyOn(user, "isSubscribed")
        .mockResolvedValue(mockUserLoginResolveToken);

      jest
        .spyOn(user, "unsubscribe")
        .mockResolvedValue(mockUserLoginResolveToken);

      const res = await request(server)
        .delete(`/api/user/${user.id}/unsubscribe`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });

    it("Should return 400_BAD_REQUEST if not subscribed", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      jest.spyOn(user, "isSubscribed").mockResolvedValue(false);

      const res = await request(server)
        .delete(`/api/user/${user.id}/unsubscribe`)
        .set(header);
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("GET /:user/style", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(null);

      const res = await request(server)
        .get("/api/user/invalid_user_id/style")
        .set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if no style found", async () => {
      jest.spyOn(style, "find").mockResolvedValue([]);

      const res = await request(server)
        .get(`/api/user/${user.id}/style`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if style found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      jest.spyOn(style, "findMany").mockResolvedValue([{ id: "style_id" }]);

      user.id = userData.id;

      const res = await request(server)
        .get(`/api/user/${user.id}/style`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:user/collection", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(null);

      const res = await request(server)
        .get("/api/user/invalid_user_id/collection")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if collection found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);
      jest
        .spyOn(collection, "findMany")
        .mockResolvedValue([{ id: "collection_id" }]);

      const res = await request(server)
        .get(`/api/user/${user.id}/collection`)
        .set(header);
      expect(res.status).toBe(status.OK);
    });

    it("should return 404_NOT_FOUND if no collection found", async () => {
      jest.spyOn(collection, "findMany").mockResolvedValue([]);

      const res = await request(server)
        .get(`/api/user/${user.id}/collection`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("PATCH /me", () => {
    it("should return 200_OK if data updated", async () => {
      jest.spyOn(user, "save").mockResolvedValue(mockUserLoginResolveToken);

      const newname = faker.internet.username();

      const res = await request(server)
        .patch("/api/user/me")
        .set(header)
        .send({ userData, name: newname, id: undefined });
      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /profile", () => {
    it("Should return 200_OK if profile updated", async () => {
      jest.spyOn(user, "updateProfile").mockResolvedValue({ id: "profile_id" });

      const res = await request(server)
        .patch("/api/user/profile")
        .set(header)
        .send({ firstname: faker.internet.username, id: undefined });
      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /password", () => {
    it("Should return 400_BAD_REQUEST if password is invalid", async () => {
      jest.spyOn(user, "passwordMatch").mockResolvedValue(false);

      const res = await request(server)
        .patch("/api/user/password")
        .set(header)
        .send({ password: "new_password" });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 200_OK if password is updated", async () => {
      jest.spyOn(user, "passwordMatch").mockResolvedValue(true);

      const newpassword = faker.internet.password();
      jest.spyOn(user, "save").mockResolvedValue(mockUserLoginResolveToken);

      const res = await request(server)
        .patch("/api/user/password")
        .set(header)
        .send({ password: newpassword });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:user", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(null);

      const res = await request(server).get("/api/user/userId").set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if user found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get(`/api/user/${user.id}`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /me", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      jest.spyOn(user, "find").mockResolvedValue(null);

      const res = await request(server).get("/api/user/me").set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if user exist", async () => {
      jest.spyOn(user, "find").mockResolvedValue(mockUserLoginResolveToken);

      const res = await request(server).get("/api/user/me").set(header);
      expect(res.status).toBe(status.OK);
    });
  });
});
