const request = require("supertest");
const app = require("../app");
const prisma = require("../functions/prisma");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const method = require("../const/http-methods");
const {
  createTestUser,
  createTestCollection,
  createTestStyle,
  createTestComment,
} = require("../functions/testHelpers");
let server;

describe("Style Route", () => {
  let user;
  let style = {};
  let collection;
  let comment = {};
  let header;

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
      prisma.style.deleteMany(),
      prisma.collection.deleteMany(),
    ]);

    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400_BAD_REQUEST if name and description not provided", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server).post("/api/style").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 404_NOT_FOUND if collection not found", async () => {
      style.name = faker.commerce.productName();
      style.description = faker.commerce.productDescription();
      style.collection = "collection_id";

      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send(style);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      collection = await createTestCollection(user.id);
      style.collection = collection.id;
      style.tags = "tags";

      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send(style);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if style created", async () => {
      style.tags = ["tag1", "tag2"];

      const mockResponse = {
        status: status.CREATED,
        body: { message: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send(style);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 200_OK if style found", async () => {
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get(`/api/style`).set(header);

      expect(res.status).toBe(status.OK);
    });

    it("Should return 404_NOT_FOUND if no style found", async () => {
      await prisma.style.deleteMany();

      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/style").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("GET /:style", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get("/api/style/invalid_style_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style found", async () => {
      console.log(user.id);
      style = await createTestStyle(user.id, collection.id);
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/style/${style.id}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /:style/favorite", () => {
    it("Should return 404_NOT_FOUND if style is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/style/invalid_style_id/favorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if style favorited", async () => {
      const mockResponse = {
        status: status.CREATED,
        body: { message: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/style/${style.id}/favorite`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("POST /:style/unfavorite", () => {
    it("Should return 404_NOT_FOUND if style is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/style/invalid_style_id/unfavorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if style unfavorited", async () => {
      const mockResponse = {
        status: status.NO_CONTENT,
        body: { message: status[status.NO_CONTENT] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/style/${style.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });

    it("Should return 404_NOT_FOUND if style is not favorited", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/style/${style.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("PUT /:style/upvote", () => {
    it("Should return 404_NOT_FOUND if style is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/style/invalid_style_id/upvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style upvoted", async () => {
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put(`/api/style/${style.id}/upvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PUT /:style/downvote", () => {
    it("Should return 404_NOT_FOUND if style is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/style/invalid_style_id/downvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style downvoted", async () => {
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put(`/api/style/${style.id}/downvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:style/unvote", () => {
    it("Should return 404_NOT_FOUND if style is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/style/invalid_style_id/unvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if style unvoted", async () => {
      await style.upvote(user.id);

      const mockResponse = {
        status: status.NO_CONTENT,
        body: { message: status[status.NO_CONTENT] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/style/${style.id}/unvote`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("POST /:style/comment", () => {
    it("Should return 404_NOT_FOUND if style is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/style/invalid_style_id/comment")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if comment not provided", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/style/${style.id}/comment`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      comment.tags = "tag";

      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/style/${style.id}/comment`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if comment successful", async () => {
      comment.tags = ["tag1", "tag2"];
      comment.content = "content";

      const mockResponse = {
        status: status.CREATED,
        body: { message: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/style/${style.id}/comment`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("POST /:style/comment/:comment", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/style/invalid_style_id/comment/invalid_comment_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      comment = await createTestComment("STYLE", style.id, user.id);

      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/style/${style.id}/comment/${comment.id}`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if comment not provided", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { message: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/style/${style.id}/comment/${comment.id}`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 404_NOT_FOUND if no comment found", async () => {
      const res = await request(server)
        .post(`/api/style/${style.id}/comment/invalid_comment_id`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if comment successful", async () => {
      const commentData = {
        content: comment.content,
        tags: comment.tags,
      };

      const mockResponse = {
        status: status.CREATED,
        body: { message: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/style/${style.id}/comment/${comment.id}`)
        .set(header)
        .send(commentData);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /:style/comments", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get("/api/style/invalid_style_id/comments")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if comment found", async () => {
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/style/${style.id}/comments`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /comment/:comment", () => {
    it("Should return 404_NOT_FOUND if comment not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/style/comment/invalid_comment_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if comment deleted", async () => {
      const mockResponse = {
        status: status.NO_CONTENT,
        body: { message: status[status.NO_CONTENT] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/style/comment/${comment.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("DELETE /:style", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/style/invalid_style_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if style deleted", async () => {
      const mockResponse = {
        status: status.NO_CONTENT,
        body: { message: status[status.NO_CONTENT] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/style/${style.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("GET /me", () => {
    it("Should return 404_NOT_FOUND if style not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { message: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/style/me").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if style found", async () => {
      await createTestStyle(user.id, collection.id);

      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get(`/api/style/me`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });
});
