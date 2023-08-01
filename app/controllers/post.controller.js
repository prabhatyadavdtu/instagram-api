const db = require("../models");
const mongoose = require("mongoose");

const Post = db.post;
const Like = db.like;
const Comment = db.comment;

/**
 * Input: Title, Description
 * RETURN: Post-ID, Title, Description, Created Time(UTC).
 */
exports.create = async (req, res) => {
  const { title, description } = req.body;
  try {
    // validate request
    if (!title) return res.status(400).send({ message: "Title is required" });
    if (!description)
      return res.status(400).send({ message: "Description is required" });

    // create new post
    const post = new Post({
      title: title,
      description: description,
      published: true,
      owner: req.user.id,
    });

    // save post
    const data = await post.save();

    // return success with post data
    return res.json({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        createdAt: data.createdAt,
      },
      message: "Post created successfully",
    });
  } catch (err) {
    console.log("Error while creating post:", err);
    return res
      .status(500)
      .send({ message: "Oops something went wrong, Please try again later!" });
  }
};

// delete post
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    // validate request
    if (!id) return res.status(400).send({ message: "Post id is required" });

    // check if post exists
    const post = await Post.findById(id);
    if (!post) return res.status(404).send({ message: "Post not found" });

    // check if user is owner of post
    if (post.owner.toString() !== req.user.id)
      return res.status(401).send({ message: "Unauthorized" });

    // delete post
    await Post.findByIdAndDelete(id);

    // return success
    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res.status(400).send({ message: "Invalid id" });
    }
  }
};

exports.like = async (req, res) => {
  const { id } = req.params;
  try {
    // validate request
    if (!id) return res.status(400).send({ message: "Post id is required" });

    // check if post exists
    const post = await Post.findById(id);
    if (!post) return res.status(404).send({ message: "Post not found" });

    // check if already liked
    const like = await Like.findOne({ post: id, user: req.user.id });
    if (like) return res.status(409).send({ message: "Post already liked" });

    // create new like
    const newLike = new Like({
      post: id,
      user: req.user.id,
    });

    // save like
    await newLike.save();
    return res.json({ message: "Post liked successfully" });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res.status(400).send({ message: "Invalid id" });
    }
  }
};

exports.unlike = async (req, res) => {
  const { id } = req.params;
  try {
    // validate request
    if (!id) return res.status(400).send({ message: "Post id is required" });

    // check if post exists
    const post = await Post.findById(id);
    if (!post) return res.status(404).send({ message: "Post not found" });

    // check if not liked
    const like = await Like.findOne({ post: id, user: req.user.id });
    if (!like) return res.status(409).send({ message: "Post not liked" });

    // delete like
    await Like.findByIdAndDelete(like.id);
    return res.json({ message: "Post unliked successfully" });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res.status(400).send({ message: "Invalid id" });
    }
  }
};

exports.comment = async (req, res) => {
  const { id } = req.params;

  try {
    // validate request
    if (!id) return res.status(400).send({ message: "Post id is required" });

    // check if post exists
    const post = await Post.findById(id);
    if (!post) return res.status(404).send({ message: "Post not found" });

    // add comment
    const comment = new Comment({
      post: id,
      user: req.user.id,
      comment: req.body.comment,
    });

    // save comment
    await comment.save();
    return res.json({ message: "Comment added successfully" });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res.status(400).send({ message: "Invalid id" });
    }
  }
};

exports.getPost = async (req, res) => {
  const { id } = req.params;

  try {
    // validate request
    if (!id) return res.status(400).send({ message: "Post id is required" });

    // check if post exists
    const post = await Post.findById(id);
    if (!post) return res.status(404).send({ message: "Post not found" });

    // get all comments of post
    const comments = await Comment.find({ post: id });
    const likes = await Like.find({ post: id });

    return res.json({
      data: {
        id: post.id,
        title: post.title,
        description: post.description,
        createdAt: post.createdAt,
        likes: likes.length,
        comments: comments.length,
      },
    });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res.status(400).send({ message: "Invalid id" });
    }
  }
};
