const prisma = require("../functions/prisma");

class Profile {
  constructor(profile = {}) {
    this.id = profile.id || null;
    this.user = this.user || null;
    this.firstname = profile.firstname || null;
    this.lastname = profile.lastname || null;
    this.bio = profile.bio || null;

    this.selectedFields = {
      id: true,
      firstname: true,
      lastname: true,
      bio: true,
      user: { select: { id: true, name: true } },
    };
  }

  async save(profile = {}) {
    this.id = profile.id || this.id;
    this.user = profile.user || this.user;
    this.firstname = profile.firstname || this.firstname;
    this.lastname = profile.lastname || this.lastname;
    this.bio = profile.bio || this.bio;

    profile = await this.find();
    return profile ? this.update() : this.create();
  }

  async create(profile = {}) {
    const user = profile.user || this.user;
    const firstname = profile.firstname || this.firstname;
    const lastname = profile.lastname || this.lastname;
    const bio = profile.bio || this.bio;

    profile = await prisma.profile.create({
      data: { firstname, lastname, bio, user: { connect: { id: user } } },
      select: this.selectedFields,
    });
    this.id = profile.id;
    return profile;
  }

  update(profile = {}) {
    const id = profile.id || this.id;
    const firstname = profile.firstname || this.firstname;
    const lastname = profile.lastname || this.lastname;
    const bio = profile.bio || this.bio;

    return prisma.profile.update({
      where: { id },
      data: { firstname, lastname, bio },
      select: this.selectedFields,
    });
  }

  async find(profile = {}) {
    const id = profile.id || this.id;
    const user = profile.user || this.user;
    profile = await prisma.profile.findFirst({
      where: { OR: [{ id }, { user: { id: user } }] },
      select: this.selectedFields,
    });

    return profile ? profile : null;
  }

  async delete(profile = {}) {
    this.id = profile.id || this.id;
    profile = await this.find();
    return profile ? prisma.profile.delete({ where: { id: this.id } }) : null;
  }

  deleteMany(where = {}) {
    return prisma.deleteMany({
      where,
    });
  }
}

const profile = new Profile();
module.exports = { profile, Profile };
