const prisma = require("../functions/prisma");
const Brand = require("./Brand");
const { faker } = require("@faker-js/faker");
const User = require("./User");

describe("Brand", () => {
  let user;
  let brand;
  let userData;
  let mockUserReturnValue;

  beforeAll(() => {
    user = new User();
    brand = new Brand();
  });

  beforeEach(async () => {
    // user.email = faker.internet.email();
    // user.password = faker.internet.password();
    // await user.save();

    brandData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      description: faker.commerce.productDescription(),
    };

    mockUserReturnValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.brand.deleteMany(),
    ]);
  });

  describe("create", () => {
    it("Should call save method when creating a brand", async () => {
      brand.name = brandData.name;
      brand.description = brandData.description;

      mockcreate = jest.spyOn(brand, "create").mockResolvedValue();
      await brand.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created user object", async () => {
      brand.tags = ["tag1", "tag2"];
      const result = await brand.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("tags");
    });
  });

  describe("find", () => {
    it("Should return null if brand not found", async () => {
      const result = await brand.find({ id: "invalid_brand_id" });

      expect(result).toBeNull();
    });

    it("Should throw error if id, name  not provided", async () => {
      brand.id = undefined;
      brand.name = undefined;

      expect(() => brand.find({})).toThrow(
        "At least one of id, name must be provided"
      );
    });

    it("Should return brand object if found", async () => {
      brand.name = brandData.name;
      brand.description = brandData.description;
      //   brand.owner = user.id;

      await brand.save();
      const result = await brand.find();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", brandData.name);
    });
  });

  describe("findById", () => {
    it("Should return null if brand not found", async () => {
      brand.id = "invalid_brand_id";
      const result = await brand.findById();

      expect(result).toBeNull();
    });

    it("Should return brand object if found", async () => {
      const saved = await brand.save();
      brand.id = saved.id;
      const result = await brand.findById();

      expect(result).toHaveProperty("id", saved.id);
      expect(result).toHaveProperty("name", saved.name);
      expect(result).toHaveProperty("description", saved.description);
    });
  });

  describe("update", () => {
    it("Should return null if brand.id invalid", async () => {
      brand.id = "invalid_brand_id";
      const update = await brand.update();

      expect(update).toBeNull();
    });

    it("should return the updated user object", async () => {
      brand.name = brandData.name;
      brand.description = brandData.description;
      const saved = await brand.save();
      const newname = faker.internet.username();
      brand.id = saved.id;
      brand.tags = ["tag1", "tag2"];
      brand.name = newname;

      const result = await brand.update();

      expect(result).toHaveProperty("id", saved.id);
      expect(result).toHaveProperty("name", newname);
      expect(result).toHaveProperty("description", brandData.description);
    });
  });

  describe("delete", () => {
    it("Should return false if invalid brand provided", async () => {
      brand.id = "invalid_brand_id";
      const result = await brand.delete();

      expect(result).toBeNull();
    });

    it("Should return false if invalid brand provided", async () => {
      await brand.save();
      const result = await brand.delete();

      expect(result).toBeTruthy();
    });
  });
});
