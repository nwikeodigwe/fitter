module.exports = (data) => {
  return data
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, " ");
};
