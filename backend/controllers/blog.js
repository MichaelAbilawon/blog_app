const express = require("express");
const blogRouter = express.Router();
const Blog = require("../models/blog");
// const winston = require("winston");
const verifyToken = require("../middlewares/verifyToken");
const winston = require("./logger");
const blog = require("../models/blog");
const { calculateReadingTime } = require("./time");

blogRouter.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 20; // Fixed to 20 blogs per page

    // Calculate the starting index for the blogs based on the page and fixed limit
    const startIndex = (page - 1) * limit;

    // Get total number of blogs
    const totalBlogs = await blog.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalBlogs / limit);

    // Query the database to retrieve a subset of blogs
    const data = await blog.find().skip(startIndex).limit(limit);

    if (!data || data.length === 0) {
      throw new Error("No Data Found");
    }

    res.render("allblogs", {
      blogs: data,
      totalBlogs: totalBlogs,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(`Error ${err}`);
  }
});

// Route to search
blogRouter.get("/getfiltered", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 20; // Fixed to 20 blogs per page

    // Calculate the starting index for the filtered blogs based on the page and fixed limit
    const startIndex = (page - 1) * limit;

    // Construct the filter criteria based on query parameters (author, title, and tags)
    const filterCriteria = {};
    if (req.query.author) {
      filterCriteria.author = req.query.author;
    }
    if (req.query.title) {
      filterCriteria.title = req.query.title;
    }
    if (req.query.tags) {
      filterCriteria.tags = req.query.tags;
    }

    // Query the database to retrieve a subset of filtered blogs
    const data = await Blog.find(filterCriteria).skip(startIndex).limit(limit);

    // Get total number of filtered blogs
    const totalFilteredBlogs = await Blog.countDocuments(filterCriteria);

    // Calculate total pages
    const totalPages = Math.ceil(totalFilteredBlogs / limit);

    if (!data || data.length === 0) {
      throw new Error("No Data Found");
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      totalPages,
      currentPage: page,
      message: "Data fetched successfully!",
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(`Error ${err}`);
  }
});

blogRouter.get("/get/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "-password"
    );
    if (!blog) {
      throw new Error("Blog not found");
    }

    // The read_count increases by 1
    blog.read_count += 1;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new blog (initially in draft state)
blogRouter.post("/", verifyToken, async (req, res) => {
  const { title, body, tags, state, description } = req.body;
  const author = req.user.id;

  try {
    if (!title || !body || !description) {
      return res.status(400).json({ msg: "Please enter important fields" });
    }

    //To ensure the user is logged in
    if (!req.user) {
      return res.status(403).json("You are not logged in");
    }

    //Calculating Reading time
    const readingTime = calculateReadingTime(body);

    //Create the new blog
    const newBlog = new Blog({
      title,
      description,
      state: "draft", // Initially in draft state
      body,
      tags: tags || [],
      author,
      reading_time: readingTime, //Reading time
      read_count: 0, // Initialize read_count
    });

    // Save the new blog
    const blog = await newBlog.save();

    // Log the creation of the blog
    winston.info(`Blog created by ${req.user.email}: ${title}`);

    return res.status(201).json(blog);
  } catch (error) {
    winston.error(`Error in creating a blog: ${error.message}`);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get a list of the user's blogs
blogRouter.get("/myblogs", verifyToken, async (req, res) => {
  const userId = req.user.id; //this is to extract the user ID from the token
  const { page = 1, perPage = 20, state } = req.query;

  const query = { author: userId };
  if (state) query.state = state;
  try {
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage),
      Blog.countDocuments(query), //This is to count the total number of blogs
    ]);
    res.status(200).json({ total, blogs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching blogs", error: error.message });
  }
});

// Publish a blog
blogRouter.put("/publish/:id", verifyToken, async (req, res) => {
  const blogId = req.params.id;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    console.log(blog.author);
    if (blog.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not the author of this blog" });
    }

    if (blog.state === "published") {
      return res.status(400).json({ error: "Blog is already published" });
    }

    blog.state = "published";
    await blog.save();

    // Log the publication of the blog
    winston.info(`Blog published by ${req.user.email}: ${blog.title}`);

    res.json(blog);
  } catch (error) {
    winston.error(`Error in publishing a blog: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit a blog
blogRouter.put("/updateBlog/:id", verifyToken, async (req, res) => {
  const blogId = req.params.id;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    console.log(blog.author);

    if (blog.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own posts" });
    }

    const { title, body, tags, description } = req.body;

    if (title) blog.title = title;
    if (body) blog.body = body;
    if (tags) blog.tags = tags;
    if (description) blog.description = description;

    await blog.save();

    // Log the update of the blog
    winston.info(`Blog edited by ${req.user.email}: ${blog.title}`);

    res.json(blog);
  } catch (error) {
    winston.error(`Error in editing a blog: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a blog
blogRouter.delete("/deleteBlog/:id", verifyToken, async (req, res) => {
  const blogId = req.params.id;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (blog.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not the author of this blog" });
    }

    await blog.deleteOne();

    // Log the deletion of the blog
    winston.info(`Blog deleted by ${req.user.email}: ${blog.title}`);

    res.json({ msg: "Blog Successfully deleted" });
  } catch (error) {
    winston.error(`Error in deleting a blog: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = blogRouter;
