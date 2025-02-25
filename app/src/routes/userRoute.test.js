const app = require("../app");
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const prisma = require("../functions/prisma");
const { status } = require("http-status");
const method = require("../const/http-methods");
const {
  createTestUser,
  createTestCollection,
  createTestStyle,
} = require("../functions/testHelpers");
let server;

describe("User route", () => {
  let header;
  let user;
  let collection;
  let passwordReset = {};

  beforeAll(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    const { account, login } = await createTestUser();
    user = account;

    header = { Authorization: `Bearer ${login.token}` };

    collection = await createTestCollection(user.id);
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.collection.deleteMany(),
    ]);

    await prisma.$disconnect();
    await server.close();
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no user is found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/user").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if user found", async () => {
      await createTestUser();
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/user").set(header);
      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /:user/subscribe", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/user/userId/subscribe`)
        .set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if subscription successful", async () => {
      const mockResponse = {
        status: status.CREATED,
        body: { message: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/user/${user.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });

    it("Should return 400_BAD_REQUEST if already subscribed", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/user/${user.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("DELETE /:user/unsubscribe", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/user/invalid_user_id/unsubscribe`)
        .set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if unsubscribed", async () => {
      const mockResponse = {
        status: status.NO_CONTENT,
        body: { message: status[status.NO_CONTENT] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/user/${user.id}/unsubscribe`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });

    it("Should return 400_BAD_REQUEST if not subscribed", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/user/${user.id}/unsubscribe`)
        .set(header);
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("GET /:user/style", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get("/api/user/invalid_user_id/style")
        .set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if no style found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/user/${user.id}/style`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if style found", async () => {
      await createTestStyle(user.id, collection.id);
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/user/${user.id}/style`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:user/collection", () => {
    it("should return 404_NOT_FOUND if user not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get("/api/user/invalid_user_id/collection")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if collection found", async () => {
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/user/${user.id}/collection`)
        .set(header);
      expect(res.status).toBe(status.OK);
    });

    it("should return 404_NOT_FOUND if no collection found", async () => {
      await collection.delete();
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/user/${user.id}/collection`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("PATCH /me", () => {
    it("should return 200_OK if data updated", async () => {
      const updateData = {
        name: faker.internet.username(),
        email: faker.internet.email(),
      };

      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);

      const res = await request(server)
        .patch("/api/user/me")
        .set(header)
        .send(updateData);
      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /profile", () => {
    it("Should return 200_OK if profile updated", async () => {
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);

      const updatedProfile = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        bio: faker.person.jobDescriptor(),
      };

      const res = await request(server)
        .patch("/api/user/profile")
        .set(header)
        .send(updatedProfile);
      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /password", () => {
    it("Should return 400_BAD_REQUEST if password is invalid", async () => {
      passwordReset.password = "wrongpassword";
      const res = await request(server)
        .patch("/api/user/password")
        .set(header)
        .send(passwordReset);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 200_OK if password is updated", async () => {
      passwordReset.password = user.password;
      passwordReset.newpassword = faker.internet.password();

      const res = await request(server)
        .patch("/api/user/password")
        .set(header)
        .send(passwordReset);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:user", () => {
    it("Should return 404_NOT_FOUND if user not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/user/userId").set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if user found", async () => {
      const mockResponse = {
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
      await user.delete();
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/user/me").set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if user exist", async () => {
      const { account, login } = await createTestUser();
      user = account;
      header = { Authorization: `Bearer ${login.token}` };
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/user/me").set(header);
      expect(res.status).toBe(status.OK);
    });
  });
});
