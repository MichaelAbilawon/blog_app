//Calculating the reading time for a blog

function calculateReadingTime(body) {
  const averageSpeed = 200;
  const wordCount = body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / averageSpeed);
  return readingTime;
}

module.exports = { calculateReadingTime };
