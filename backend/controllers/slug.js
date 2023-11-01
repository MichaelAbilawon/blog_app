function generateSlug(title) {
  // Convert to lowercase, replace spaces with hyphens, and remove special characters
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

module.exports = generateSlug;
