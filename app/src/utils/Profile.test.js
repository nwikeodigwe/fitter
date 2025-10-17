const { profile } = require("./Profile");
const { user } = require("./User");
const { faker } = require("@faker-js/faker");

describe("Profile", () => {
  let userData;
  let mockUserResolveValue;
  let profileData;
  let mockProfileResolveValue;

  beforeAll(async () => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password,
    };

    mockUserResolveValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };

    profileData = {
      id: faker.string.uuid(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      bio: faker.lorem.sentence(),
    };

    mockProfileResolveValue = {
      id: jest.fn(() => profileData.id),
      firstname: jest.fn(() => profileData.firstname),
      lastname: jest.fn(() => profileData.lastname),
      bio: jest.fn(() => profileData.bio),
    };
  });

  afterAll(async () => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call create method when creating a profile", async () => {
      jest.spyOn(profile, "create").mockResolvedValue();
      await profile.create();

      expect(profile.create).toHaveBeenCalled();
    });

    it("Should return the created profile object", async () => {
      jest.spyOn(profile, "create").mockResolvedValue(mockProfileResolveValue);

      profile.firstname = profileData.firstname;
      profile.lastname = profileData.lastname;
      profile.bio = profileData.bio;
      profile.user = user.id;
      const result = await profile.create();

      expect(result).toMatchObject(mockProfileResolveValue);
    });
  });

  describe("update", () => {
    it("Should call update method when updating a profile", async () => {
      jest.spyOn(profile, "update").mockResolvedValue();
      await profile.update();

      expect(profile.update).toHaveBeenCalled();
    });

    it("Should return the updated profile object", async () => {
      jest.spyOn(profile, "update").mockResolvedValue(mockUserResolveValue);

      const newBio = faker.lorem.sentence();
      profile.bio = newBio;

      const result = await profile.update();

      expect(result).toMatchObject(mockUserResolveValue);
    });
  });

  describe("save", () => {
    it("Should call save method when saving a profile", async () => {
      jest.spyOn(profile, "save").mockResolvedValue();
      await profile.save();

      expect(profile.save).toHaveBeenCalled();
    });

    it("Should call update method if profile exist", async () => {
      const newBio = faker.lorem.sentence();
      profile.bio = newBio;

      jest
        .spyOn(profile, "save")
        .mockResolvedValue({ ...mockUserResolveValue, bio: newBio });
      const result = await profile.save();

      expect(result).toMatchObject({ ...mockUserResolveValue, bio: newBio });
    });

    it("Should call create method if profile does not exist", async () => {
      jest.spyOn(profile, "deleteMany").mockResolvedValue();

      await profile.deleteMany();

      profile.id = undefined;
      profile.firstname = profileData.firstname;
      profile.lastname = profileData.lastname;
      profile.bio = profileData.bio;
      profile.user = user.id;

      jest.spyOn(profile, "save").mockResolvedValue(mockProfileResolveValue);

      const result = await profile.save();

      expect(result).toMatchObject(mockProfileResolveValue);
    });
  });

  describe("find", () => {
    it("Should call find method when finding a profile", async () => {
      jest.spyOn(profile, "find").mockResolvedValue();
      await profile.find();

      expect(profile.find).toHaveBeenCalled();
    });

    it("Should return null if profile not found", async () => {
      jest.spyOn(profile, "deleteMany").mockResolvedValue();

      await profile.deleteMany();

      jest.spyOn(profile, "find").mockResolvedValue(null);
      const result = await profile.find();

      expect(result).toBeNull();
    });

    it("Should return the found profile object", async () => {
      jest.spyOn(profile, "create").mockResolvedValue();

      await profile.create();

      jest.spyOn(profile, "find").mockResolvedValue(mockProfileResolveValue);
      const result = await profile.find();

      expect(result).toMatchObject(mockProfileResolveValue);
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting a profile", async () => {
      jest.spyOn(profile, "delete").mockResolvedValue();
      await profile.delete();

      expect(profile.delete).toHaveBeenCalled();
    });

    it("Should return null if profile not found", async () => {
      jest.spyOn(profile, "deleteMany").mockResolvedValue();
      await profile.deleteMany();

      jest.spyOn(profile, "delete").mockResolvedValue(null);
      const result = await profile.delete();

      expect(result).toBeNull();
    });

    it("Should return the deleted profile object", async () => {
      jest.spyOn(profile, "create").mockResolvedValue();
      await profile.create();

      jest.spyOn(profile, "delete").mockResolvedValue(mockProfileResolveValue);
      const result = await profile.delete();

      expect(result).toMatchObject(mockProfileResolveValue);
    });
  });
});
