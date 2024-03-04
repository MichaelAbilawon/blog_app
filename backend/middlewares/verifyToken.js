const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies.token;

  const token = authHeader || tokenFromCookie;
  if (!token) return res.status(401).json({ msg: "No token found" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user to the request for future use
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Invalid token" });
  }
};

module.exports = verifyToken;
