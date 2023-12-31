const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
dotenv.config();
const blogRouter = require("./controllers/blog");
const userRouter = require("./controllers/user");
const path = require("path");
const router = require("./controllers/auth");

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DataBase is successfully connected");
  } catch (err) {
    console.error("Connection to the database failed:", err);
  }
}

connectToDatabase();

// Middleware and Routers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/blog", blogRouter);
app.use("/auth", router);
app.use("/user", userRouter);
app.set(express.static("public"));
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views")); //directory for views
app.get("/", (req, res) => {
  res.render("homepage");
});

// Server Listening
app.listen(6002, () => console.log("Server is connected succesfuly"));

module.exports = app;
