const prisma = require("../functions/prisma");

class Profile {
  constructor(profile = {}) {
    this.id = profile.id || null;
    this.userId = this.userId || null;
    this.firstname = profile.firstname || null;
    this.lastname = profile.lastname || null;
    this.bio = profile.bio || null;
  }

  save(data = {}) {
    return prisma.profile.upsert({
      where: { userId: this.id },
      update: { ...data },
      create: { ...data, user: { connect: { id: this.userId } } },
      select: {
        firstname: true,
        lastname: true,
        bio: true,
      },
    });
  }
}

module.exports = Profile;
