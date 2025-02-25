const prisma = require("../functions/prisma");

class Image {
  constructor(image = {}) {
    this.id = image.id || null;
    this.url = image.url || null;
    this.selectedFields = {
      id: true,
      url: true,
    };
  }

  async save(image = {}) {
    this.id = image.id || this.id;
    this.url = image.url || this.url;

    return this.id ? this.update() : this.create();
  }

  async create(url = this.url) {
    const image = await prisma.image.create({
      data: { url },
      select: { id: true },
    });

    this.id = image.id;
    return image;
  }

  update(image = {}) {
    const id = image.id || this.id;
    const url = image.url || this.url;

    return prisma.image.update({
      where: {
        id,
      },
      data: {
        url,
      },
    });
  }

  find(image = {}) {
    const id = image.id || this.id;

    return prisma.image.findFirst({
      where: { id },
      select: this.selectedFields,
    });
  }

  delete() {
    return prisma.image.delete({
      where: { id: this.id },
    });
  }
}

module.exports = Image;
