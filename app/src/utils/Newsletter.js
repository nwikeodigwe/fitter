const prisma = require("../functions/prisma");
const logger = require("./Logger");

class Newsletter {
  constructor() {
    this.selectedFields = {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  save(email, name = undefined) {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name || normalizedEmail.split("@")[0];
    return prisma.newsletter.create({
      data: { email: normalizedEmail, name: normalizedName },
      select: this.selectedFields,
    });
  }

  findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    return prisma.newsletter.findUnique({
      where: { email: normalizedEmail },
      select: this.selectedFields,
    });
  }
}

const newsletter = new Newsletter();
module.exports = newsletter;
