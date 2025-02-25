const app = require("../app");
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const prisma = require("../functions/prisma");
const method = require("../const/http-methods");
const {
  createTestUser,
  createTestBrand,
  createTestImage,
  createTestItem,
} = require("../functions/testHelpers");
let server;

describe("Item route", () => {
  let user;
  let header;
  let image;
  let item;
  let brand;
  let newItem = {};

  beforeAll(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    const { account, login } = await createTestUser();
    user = account;
    header = { Authorization: `Bearer ${login.token}` };

    image = await createTestImage();
    brand = await createTestBrand(user.id);
    item = await createTestItem(brand.name, user.id, image.id);
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.item.deleteMany(),
    ]);
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400_BAD_REQUEST if name and description not provided", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server).post("/api/item").set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if image not provided", async () => {
      newItem.name = faker.commerce.productName();
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(newItem);
      newItem = {};

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if tag is not an array", async () => {
      newItem.tags = "tag";
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(newItem);
      newItem = {};

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 400_BAD_REQUEST if brand not provided", async () => {
      newItem.brand = null;
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(newItem);
      newItem = {};

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("Should return 201_CREATED if item created", async () => {
      let newItem = {};
      newItem.name = faker.commerce.productName();
      newItem.description = faker.commerce.productDescription();
      newItem.images = [image.id, image.id];
      newItem.tags = ["tag1", "tag1"];
      newItem.brand = faker.commerce.productName();

      const mockResponse = {
        status: status.CREATED,
        body: { message: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.POST).mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(newItem);
      newItem = {};

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      await prisma.item.deleteMany();
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/item").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK item found", async () => {
      item = await createTestItem(brand.name, user.id, image.id);
      const mockResponse = {
        status: status.OK,
        body: { message: status[status.OK], data: {} },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get(`/api/item`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:item", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      const res = await request(server).get("/api/item/ItemId").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK item found", async () => {
      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get(`/api/item/${item.id}`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /:item", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get("/api/item/ItemId").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK item found", async () => {
      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };
      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server).get(`/api/item/${item.id}`).set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("POST /favorite", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };
      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/item/ItemId/favorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 201_CREATED if item created", async () => {
      const mockResponse = {
        status: status.CREATED,
        body: { error: status[status.CREATED] },
      };
      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post(`/api/item/${item.id}/favorite`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("DELETE /unfavorite", () => {
    it("Should return 404_NOT_FOUND if no item found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };
      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/item/ItemId/unfavorite")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if item unfavorited", async () => {
      await item.favorite(user.id);
      const mockResponse = {
        status: status.CREATED,
        body: { error: status[status.CREATED] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/item/${item.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });

    it("Should return 400_BAD_REQUEST if item not favorited", async () => {
      const mockResponse = {
        status: status.BAD_REQUEST,
        body: { error: status[status.BAD_REQUEST] },
      };
      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/item/${item.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe("PUT /:item/upvote", () => {
    it("Should return 404_NOT_FOUND if brand is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/item/itemId/upvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if item upvoted", async () => {
      const mockResponse = {
        status: status.OK,
        body: { success: status[status.OK] },
      };

      jest.spyOn(request(server), method.PUT).mockReturnValue(mockResponse);

      const res = await request(server)
        .put(`/api/item/${item.id}/upvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PUT /:item/downvote", () => {
    it("Should return 404_NOT_FOUND if item is not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .put("/api/item/itemId/downvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if brand downvoted", async () => {
      const mockResponse = {
        status: status.OK,
        body: { success: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .put(`/api/item/${item.id}/downvote`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:item/unvote", () => {
    it("Should return 404_NOT_FOUND if item not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete("/api/item/itemId/unvote")
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if item unvoted", async () => {
      await item.upvote(user.id);
      const mockResponse = {
        status: status.NO_CONTENT,
        message: status[status.NO_CONTENT],
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server)
        .delete(`/api/item/${item.id}/unvote`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("PATCH /:item/", () => {
    it("Should return 404_NOT_FOUND if item not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.PATCH).mockReturnValue(mockResponse);
      const res = await request(server).patch("/api/item/itemId").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200_OK if item updated", async () => {
      const mockResponse = {
        status: status.OK,
        body: { error: status[status.OK] },
      };

      jest.spyOn(request(server), method.GET).mockReturnValue(mockResponse);
      const res = await request(server)
        .patch(`/api/item/${item.id}`)
        .set(header)
        .send({ name: "name++" });

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /:item", () => {
    it("Should return 404_NOT_FOUND if item not found", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest.spyOn(request(server), method.DELETE).mockReturnValue(mockResponse);
      const res = await request(server).delete("/api/item/itemId").set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 204_NO_CONTENT if item deleted", async () => {
      const mockResponse = {
        status: status.NOT_FOUND,
        body: { error: status[status.NOT_FOUND] },
      };

      jest
        .spyOn(request(server), method.DELETE)
        .mockReturnValue({ mockResponse });
      const res = await request(server)
        .delete(`/api/item/${item.id}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
