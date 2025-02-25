const fs = require("fs");

const provider = process.env.DATABASE_PROVIDER || "sqlite";
const schema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URI")
}
`;

fs.writeFileSync("prisma/schema.prisma", schema, "utf-8");
console.log(`Updated schema.prisma to use provider: ${provider}`);
