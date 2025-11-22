const jwt = require("jsonwebtoken");
const { app } = require("../app");
const { users } = require("../utils/user");
const { brands } = require("../utils/brand");
const { comments } = require("../utils/comment");
const { collections } = require("../utils/collection");
const { styles } = require("../utils/style");
const { items } = require("../utils/item");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");

const request = require("supertest");

let server;

describe("Subscribe route", () => {
  let params;
  let models;
  let model;
  let header;
  let userData;
  let endpoint;

  beforeAll(async () => {
    endpoint = "/api/favorite";
    server = app.listen(0);

    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
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

    models = { brands, styles, users, items, collections, comments };
  });

  afterAll(() => {
    params = undefined;
    models = undefined;
    model = undefined;
    jest.restoreAllMocks();
    server.close();
  });

  describe("POST /favorite", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .post(`${endpoint}/invalid_model/model_id`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      params = ["brands", "styles", "items", "collections"];
      index = Math.floor(Math.random() * params.length);

      model = models[params[index]];

      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/invalid_model_id`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 201_CREATED if subscribe/item unvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(true);

      jest.spyOn(model, "favorite").mockResolvedValue(true);

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/${faker.string.uuid()}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(model.favorite).toHaveBeenCalled();
      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("DELETE /unfavorite", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .delete(`${endpoint}/invalid_model/model_id`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`${endpoint}/${params[index]}/invalid_model_id`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if not favorited", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(model, "isFavorite").mockResolvedValue(false);

      const res = await request(server)
        .delete(`${endpoint}/${params[index]}/${faker.string.uuid()}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(model.isFavorite).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 204_NO_CONTENT if /item unfavorited", async () => {
      jest.spyOn(model, "find").mockResolvedValue(true);
      jest.spyOn(model, "isFavorite").mockResolvedValue(true);
      jest.spyOn(model, "unfavorite").mockResolvedValue(true);

      const res = await request(server)
        .delete(`${endpoint}/${params[index]}/${faker.string.uuid()}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(model.isFavorite).toHaveBeenCalled();
      expect(model.unfavorite).toHaveBeenCalled();
      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
