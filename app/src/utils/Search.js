const prisma = require("../functions/prisma");

class Search {
  constructor() {
    this.selectedFields = {
      query: true,
    };
  }

  add(query) {
    return prisma.search.create({
      data: {
        query,
      },
      select: this.selectedFields,
    });
  }

  find(where = {}) {
    return prisma.search.findFirst({
      where: where,
      select: this.selectedFields,
    });
  }

  findMany(
    where = {},
    limit = 10,
    offset = 0,
    orderBy = { createdAt: "desc" }
  ) {
    return prisma.search.findMany({
      where: where,
      select: this.selectedFields,
      orderBy: orderBy,
      take: limit,
      skip: offset,
    });
  }
}

const search = new Search();
module.exports = search;
