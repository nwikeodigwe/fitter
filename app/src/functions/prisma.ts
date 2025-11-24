import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generate/prisma/client";
// import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 32770,
  user: "root",
  database: "db",
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
