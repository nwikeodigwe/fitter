const prisma = require("../functions/prisma");
const Image = require("./Image");
const { faker } = require("@faker-js/faker");

describe("Image", () => {
  let image;
  let imageData;

  beforeAll(() => {
    image = new Image();
    imageData = {
      id: faker.string.uuid(),
      url: faker.internet.url(),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.image.deleteMany();
  });

  describe("create", () => {
    it("Should call create method when creating an image", async () => {
      mockcreate = jest.spyOn(image, "create").mockResolvedValue();
      await image.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created image object", async () => {
      image.url = imageData.url;
      const result = await image.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url");
    });

    it("Should create an image with the provided url", async () => {
      image.url = imageData.url;
      const result = await image.create();

      expect(result.url).toBe(imageData.url);
    });
  });

  describe("update", () => {
    it("Should call update method when updating an image", async () => {
      mockupdate = jest.spyOn(image, "update").mockResolvedValue();
      await image.update();

      expect(mockupdate).toHaveBeenCalled();
      mockupdate.mockRestore();
    });

    it("Should return the updated image object", async () => {
      const newUrl = faker.internet.url();
      image.url = newUrl;
      const result = await image.update();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url", newUrl);
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating an image", async () => {
      mocksave = jest.spyOn(image, "save").mockResolvedValue();
      await image.save();

      expect(mocksave).toHaveBeenCalled();
      mocksave.mockRestore();
    });

    it("Should call update method if image exist", async () => {
      const newUrl = faker.internet.url();
      image.url = newUrl;

      const result = await image.save();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url", newUrl);
    });

    it("Should call create method if image exist", async () => {
      await prisma.image.deleteMany();
      image.id = undefined;
      image.url = imageData.url;
      const result = await image.save();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url", imageData.url);
    });
  });

  describe("find", () => {
    it("Should call find method when finding an image", async () => {
      mockfind = jest.spyOn(image, "find").mockResolvedValue();
      await image.find();

      expect(mockfind).toHaveBeenCalled();
      mockfind.mockRestore();
    });

    it("Should return null if no image found", async () => {
      await prisma.image.deleteMany();
      const result = await image.find();

      expect(result).toBeNull();
    });

    it("Should return the found image object", async () => {
      image.id = undefined;
      await image.create();
      const result = await image.find();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url");
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting an image", async () => {
      mockdelete = jest.spyOn(image, "delete").mockResolvedValue();
      await image.delete();

      expect(mockdelete).toHaveBeenCalled();
      mockdelete.mockRestore();
    });

    it("Should return the deleted image object", async () => {
      const result = await image.delete();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url");
    });

    it("Should return null if no image found", async () => {
      const result = await image.delete();

      expect(result).toBeNull();
    });
  });
});
