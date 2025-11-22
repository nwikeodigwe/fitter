const { brands } = require("./Brand");
const { faker } = require("@faker-js/faker");
const prisma = require("../functions/prisma");

describe("Brand", () => {
  let userData;
  let brandData;
  let mockUserReturnValue;
  let mockBrandReturnValue;

  beforeEach(async () => {
    jest.resetModules();
    // user.email = faker.internet.email();
    // user.password = faker.internet.password();
    // await user.save();

    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
    };

    brandData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      description: faker.commerce.productDescription(),
      tags: ["tag1", "tag2"],
    };

    mockUserReturnValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };

    mockBrandReturnValue = {
      id: jest.fn(() => brandData.id),
      name: jest.fn(() => brandData.name),
      description: jest.fn(() => brandData.description),
    };
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call save method when creating a brand", async () => {
      const create = jest
        .spyOn(prisma.brand, "create")
        .mockResolvedValue(brandData);

      brands.name = brandData.name;
      brands.description = brandData.description;

      await brands.create();

      expect(prisma.brand.create).toHaveBeenCalled();
      expect(create).toHaveBeenCalled();
    });

    it("Should return the created user object", async () => {
      jest.spyOn(prisma.brand, "create").mockResolvedValue(brandData);

      brands.tags = brandData.tags;
      const result = await brands.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("tags");
    });
  });

  describe("find", () => {
    it("Should return null if brand not found", async () => {
      jest.spyOn(prisma.brand, "findFirst").mockResolvedValue(null);

      const result = await brands.find({ id: "invalid_brand_id" });

      expect(prisma.brand.findFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("Should throw error if id, name or slug is not provided", async () => {
      brands.id = undefined;
      brands.name = undefined;
      brands.slug = undefined;

      await expect(brands.find()).rejects.toThrow(
        /At least one of id, name or slug must be provided/
      );
    });

    it("Should return brand object if found", async () => {
      jest
        .spyOn(prisma.brand, "findFirst")
        .mockResolvedValue(mockBrandReturnValue);

      brands.name = faker.commerce.product();
      brands.description = brandData.description;

      const result = await brands.find();

      expect(prisma.brand.findFirst).toHaveBeenCalled();
      expect(result).toMatchObject(mockBrandReturnValue);
    });
  });

  describe("findById", () => {
    it("Should return null if brand not found", async () => {
      jest.spyOn(prisma.brand, "findUnique").mockResolvedValue(null);

      brands.id = "invalid_brand_id";
      const result = await brands.findById();

      expect(prisma.brand.findUnique).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("Should return brand object if found", async () => {
      jest
        .spyOn(prisma.brand, "findUnique")
        .mockResolvedValue(mockBrandReturnValue);

      brands.id = brandData.id;
      const result = await brands.findById();

      expect(prisma.brand.findUnique).toHaveBeenCalled();
      expect(result).toMatchObject(mockBrandReturnValue);
    });
  });

  describe("update", () => {
    it("Should return null if brand.id invalid", async () => {
      jest.spyOn(prisma.brand, "findFirst").mockResolvedValue(null);

      brands.id = "invalid_brand_id";
      const update = await brands.update();

      expect(prisma.brand.findFirst).toHaveBeenCalled();
      expect(update).toBeFalsy();
    });

    it("Should return the updated user object", async () => {
      jest
        .spyOn(prisma.brand, "update")
        .mockResolvedValue({ ...mockBrandReturnValue, name: "new_name" });

      jest
        .spyOn(prisma.brand, "findFirst")
        .mockResolvedValue(mockBrandReturnValue);

      brands.name = brandData.name;
      brands.description = brandData.description;
      brands.id = brandData.id;
      brands.tags = ["tag1", "tag2"];
      brands.name = "new_name";

      const result = await brands.update();

      expect(prisma.brand.findFirst).toHaveBeenCalled();
      expect(prisma.brand.update).toHaveBeenCalled();
      expect(result).toMatchObject({
        ...mockBrandReturnValue,
        name: "new_name",
      });
    });
  });

  describe("delete", () => {
    it("Should return false if invalid brand provided", async () => {
      jest.spyOn(prisma.brand, "findFirst").mockResolvedValue(null);

      brands.id = "invalid_brand_id";
      const result = await brands.delete();

      expect(prisma.brand.findFirst).toHaveBeenCalled();
      expect(result).toBeFalsy();
    });

    it("Should return true if brand deleted", async () => {
      jest.spyOn(prisma.brand, "findFirst").mockResolvedValue(true);

      jest.spyOn(prisma.brand, "delete").mockResolvedValue(true);

      const result = await brands.delete();

      expect(prisma.brand.findFirst).toHaveBeenCalled();
      expect(prisma.brand.delete).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });
});
