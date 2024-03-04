//Calculating the reading time for a blog

function calculateReadingTime(body) {
  const averageSpeed = 200;
  const wordCount = body.split(/\s+/).length;
  const calculatedTime = Math.ceil(wordCount / averageSpeed);
  const readingTime = console.log(calculatedTime + "mins");
  return readingTime;
}

module.exports = { calculateReadingTime };
