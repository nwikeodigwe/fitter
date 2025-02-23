const app = require("../app");
const request = require("supertest");
const prisma = require("../functions/prisma");
const { status } = require("http-status");
const method = require("../const/http-methods");
const { faker } = require("@faker-js/faker");
const {
  createTestUser,
  createTestBrand,
  createTestImage,
  createTestLogo,
  response,
  createTestComment,
} = require("../functions/testHelpers");
let server;

describe("Brand route", () => {
  let user;
  let brand = {};
  let createdBrand;
  let comment = {};
  let image;
  let logo;
  let mockResponse;

  beforeAll(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    const { account, login } = await createTestUser();
    user = account;
    header = { Authorization: `Bearer ${login.token}` };

    image = await createTestImage();
    logo = await createTestLogo(image.id);
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.brand.deleteMany(),
    ]);
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("should return 400_BAD_REQUEST if  or description is not provided", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server).post("/api/brand").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if tag is not an array", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send({ tags: "tag1" });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if brand already exists", async () => {
      createdBrand = await createTestBrand(user.id, logo.id);

      brand.name = faker.commerce.productName();
      brand.description = faker.commerce.productDescription();
      brand.tags = ["tag1", "tag2"];
      brand.owner = user.id;
      brand.logo = logo.id;
      brand.name = createdBrand.name;
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send(brand);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if brand is created", async () => {
      brand.name = faker.commerce.productName();

      mockResponse = response(status.CREATED, status[status.CREATED]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send(brand);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 200_OK if brand found", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/brand").set(header);

      expect(res.status).toBe(status.OK);
    });

    it("Should return 404_NOT_FOUND if no brand found", async () => {
      await prisma.brand.deleteMany();
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/brand").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("GET /:brand", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get("/api/brand/invalid_brand_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if brand is found", async () => {
      brand = await createTestBrand(user.id, logo.id);
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/brand/${brand.id}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /:brand", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);
      const res = await request(server)
        .patch("/api/brand/invalid_brand_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 400_BAD_REQUEST if tag is not an array", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);
      const res = await request(server)
        .patch(`/api/brand/${brand.id}`)
        .set(header)
        .send({ tags: "tag" });

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 200_OK if brand is updated", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);
      const res = await request(server)
        .patch(`/api/brand/${brand.id}`)
        .set(header)
        .send({ name: faker.commerce.productName() });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /:brand/favorite", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/brand/invalid_brand_id/favorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if brand favorited", async () => {
      mockResponse = response(status.CREATED, status[status.CREATED]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/favorite`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("POST /:brand/unfavorite", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/brand/invalid_brand_id/unfavorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if brand unfavorited", async () => {
      mockResponse = response(status.NO_CONTENT, status[status.NO_CONTENT]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/brand/${brand.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });

    it("Should return 404_NOT_FOUND if brand is not favorited", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/brand/${brand.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });
  });

  describe("PUT /:brand/upvote", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/brand/invalid_brand_id/upvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if brand upvoted", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put(`/api/brand/${brand.id}/upvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PUT /:brand/downvote", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/brand/invalid_brand_id/downvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if brand downvoted", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put(`/api/brand/${brand.id}/downvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:brand/unvote", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/brand/invalid_brand_id/unvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if brand unvoted", async () => {
      mockResponse = response(status.NO_CONTENT, status[status.NO_CONTENT]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/brand/${brand.id}/unvote`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("POST /:brand/subscribe", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/brand/invalid_brand_id/subscribe")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if subscribed to brand", async () => {
      mockResponse = response(status.CREATED, status[status.CREATED]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });

    it("Should return 400_BAD_REQUEST if already subscribed", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("DELETE /:brand/unsubscribe", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);

      const res = await request(server)
        .delete("/api/brand/invalid_brand_id/unsubscribe")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if subscribed to brand", async () => {
      mockResponse = response(status.NO_CONTENT, status[status.NO_CONTENT]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/brand/${brand.id}/unsubscribe`)
        .set(header);
      expect(res.status).toBe(status.NO_CONTENT);
    });

    it("Should return 400_BAD_REQUEST if brand not subscribed", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/brand/${brand.id}/unsubscribe`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("POST /:brand/comment", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);

      const res = await request(server)
        .post("/api/brand/invalid_brand_id/comment")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if comment not provided", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/comment`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      comment.tags = "tag";
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/comment`)
        .set(header)
        .send(brand);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if comment successful", async () => {
      mockResponse = response(status.CREATED, status[status.CREATED]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/comment`)
        .set(header)
        .send({
          content: "comment",
          tags: ["tag1", "tag2"],
        });

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("POST /:brand/comment/:comment", () => {
    it("Should return 404_NOT_FOUND if brand not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/brand/invalid_brand_id/comment/invalid_comment_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      comment = await createTestComment("BRAND", brand.id, user.id);
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/comment/${comment.id}`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if comment not provided", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/comment/${comment.id}`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if comment successful", async () => {
      mockResponse = response(status.CREATED, status[status.CREATED]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/brand/${brand.id}/comment/${comment.id}`)
        .set(header)
        .send({ content: faker.lorem.sentence(), tags: ["tags1", "tag1"] });

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /:brand/comments", () => {
    it("Should return 404_NOT_FOUND if brand not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get("/api/brand/invalid_brand_id/comments")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if comment found", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .get(`/api/brand/${brand.id}/comments`)
        .set(header)
        .send({
          content: faker.commerce.productDescription,
          tags: ["tag1", "tag2"],
        });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /comment/:comment", () => {
    it("Should return 404_NOT_FOUND if comment not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/brand/comment/commentId")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if comment found", async () => {
      mockResponse = response(status.NO_CONTENT, status[status.NO_CONTENT]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/brand/comment/${comment.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("DELETE /:brand", () => {
    it("Should return 404_NOT_FOUND if comment not found", async () => {
      const res = await request(server)
        .delete("/api/brand/invalid_brand_id")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if comment found", async () => {
      mockResponse = response(status.NO_CONTENT, status[status.NO_CONTENT]);

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/brand/${brand.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
