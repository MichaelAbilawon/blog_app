const mongoose = require("mongoose");

//User Schema
const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, min: 6 },
  // user_id: [{ type: Schema.Types.ObjectId, ref: "users" }],
});

module.exports = mongoose.model("User", UserSchema);
