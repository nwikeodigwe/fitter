const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URI },
  },
});

module.exports = prisma;
