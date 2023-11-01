const mongoose = require("mongoose");

//Blog Schema

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, min: 12 },
    description: { type: String, minlength: 6, unique: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    state: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
    slug: { type: String, required: true, unique: true },
    read_count: { type: Number, default: 0 },
    reading_time: Number,
    tags: [String],
    body: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
