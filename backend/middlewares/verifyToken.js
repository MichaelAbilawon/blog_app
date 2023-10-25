const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(403).json({ msg: "Not authorized! No token" });

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    // console.log("Token:", token);
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res.status(403).json({ msg: "Wrong or expired token" });
      } else {
        req.user = data;
        next();
      }
    });
  } else {
    return res
      .status(403)
      .json({ msg: "Not authorized. You are not logged in" });
  }
};

module.exports = verifyToken;
