const prisma = require("../functions/prisma");
const { image } = require("./Image");
const { faker } = require("@faker-js/faker");

describe("Image", () => {
  let imageData;
  let mockImageReturnValue;

  beforeAll(async () => {
    imageData = {
      id: faker.string.uuid(),
      url: faker.internet.url(),
    };

    mockImageReturnValue = {
      id: jest.fn(() => imageData.id),
      url: jest.fn(() => imageData.url),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
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
      jest.spyOn(image, "create").mockResolvedValue(mockImageReturnValue);

      image.url = imageData.url;
      const result = await image.create();

      expect(result).toMatchObject(mockImageReturnValue);
    });
  });

  describe("update", () => {
    it("Should call update method when updating an image", async () => {
      jest.spyOn(image, "update").mockResolvedValue();

      await image.update();

      expect(image.update).toHaveBeenCalled();
    });

    it("Should return the updated image object", async () => {
      const newUrl = faker.internet.url();
      image.url = newUrl;

      jest
        .spyOn(image, "update")
        .mockResolvedValue({ ...mockImageReturnValue, url: newUrl });

      const result = await image.update();

      expect(result).toMatchObject({ ...mockImageReturnValue, url: newUrl });
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating an image", async () => {
      jest.spyOn(image, "save").mockResolvedValue();

      await image.save();

      expect(image.save).toHaveBeenCalled();
    });

    it("Should call update method if image exist", async () => {
      const newUrl = faker.internet.url();
      image.url = newUrl;

      jest
        .spyOn(image, "save")
        .mockResolvedValue({ ...mockImageReturnValue, url: newUrl });

      const result = await image.save();

      expect(result).toMatchObject({ ...mockImageReturnValue, url: newUrl });
    });

    it("Should call create method if image exist", async () => {
      jest.spyOn(image, "save").mockResolvedValue(null);

      image.id = undefined;
      image.url = imageData.url;
      const result = await image.save();

      expect(image.save).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("find", () => {
    it("Should call find method when finding an image", async () => {
      jest.spyOn(image, "find").mockResolvedValue();
      await image.find();

      expect(image.find).toHaveBeenCalled();
    });

    it("Should return null if no image found", async () => {
      jest.spyOn(image, "deleteMany").mockResolvedValue();

      await image.deleteMany();

      jest.spyOn(image, "find").mockResolvedValue(null);
      const result = await image.find();

      expect(result).toBeNull();
    });

    it("Should return the found image object", async () => {
      jest.spyOn(image, "create").mockResolvedValue();

      image.id = undefined;
      await image.create();

      jest.spyOn(image, "find").mockResolvedValue(mockImageReturnValue);
      const result = await image.find();

      expect(result).toMatchObject(mockImageReturnValue);
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting an image", async () => {
      jest.spyOn(image, "delete").mockResolvedValue();
      await image.delete();

      expect(image.delete).toHaveBeenCalled();
    });

    it("Should return the deleted image object", async () => {
      jest.spyOn(image, "delete").mockResolvedValue(mockImageReturnValue);

      const result = await image.delete();

      expect(result).toMatchObject(mockImageReturnValue);
    });

    it("Should return null if no image found", async () => {
      jest.spyOn(image, "delete").mockResolvedValue(null);

      const result = await image.delete();

      expect(result).toBeNull();
    });
  });
});
