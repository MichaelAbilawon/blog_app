const express = require("express");
const bcrypt = require("bcrypt");
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/user");
const userRouter = express.Router();

userRouter.get("/find/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new Error("No such user");
    }
    const { password, ...others } = user._doc;
    return res.status(200).json(others);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

userRouter.get("/findALL", async (req, res) => {
  try {
    const users = await User.find(req.params.userId);
    if (!users) {
      throw new Error("No Users");
    }
    const formattedUsers = users.map((user) => {
      return {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
    return res.status(200).json(formattedUsers);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

userRouter.put("/updateUser/:userId", verifyToken, async (req, res) => {
  if (req.params.userId === req.user.id) {
    try {
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  } else {
    return res
      .status(401)
      .json({ msg: "You can only update your own profile" });
  }
});

userRouter.delete("/deleteUser/:userId", verifyToken, async (req, res) => {
  if (req.params.userId === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.userId);
      return res.status(200).json({ msg: "User Deleted!" });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  } else {
    return res
      .status(401)
      .json({ msg: "You can only delete your own profile" });
  }
});

module.exports = userRouter;
