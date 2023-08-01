const db = require("../models");
const utils = require("../utils");
const mongoose = require("mongoose");

const User = db.user;
const Follower = db.follower;
const Post = db.post;

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if user exists
    const user = await User.find({ email });

    if (user.length === 0) {
      return res.status(404).send({ message: "Invalid Email or Password" });
    }

    // check password
    if (!utils.checkPassword(password, user[0].password)) {
      return res.status(401).send({ message: "Invalid Email or Password!" });
    }

    // return jwt token for user
    const token = utils.createToken(user[0]);

    // return success with access token
    return res.json({ access_token: token, message: "Login Successfull" });
  } catch (err) {
    console.log("Error while auth:", err);
    return res
      .status(500)
      .send({ message: "Oops something went wrong, Please try again later!" });
  }
};

// register new user

exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // validate request
    if (!email) res.status(400).send({ message: "Email is required" });
    if (!password) res.status(400).send({ message: "Password is required" });
    if (!name) res.status(400).send({ message: "Name is required" });

    // check if user exists
    let user = await User.find({ email });
    if (user.length > 0)
      return res.status(409).send({ message: "User already exists" });

    // create new user
    user = new User({
      email,
      password: utils.makeHash(password),
      name: name,
    });

    // save user
    await user.save(user);

    // return success with access token
    const token = utils.createToken(user);
    // return success with access token
    return res.json({ access_token: token, message: "Register Successfull" });
  } catch (err) {
    console.log("Error while auth:", err);
    return res
      .status(500)
      .send({ message: "Oops something went wrong, Please try again later!" });
  }
};

exports.follow = async (req, res) => {
  // console.log(req.params.id);

  const id = req.params?.id;
  // if id is not present
  if (!id) return res.status(400).send({ message: "id is required" });

  // if user with id is not present
  try {
    const following_user = await User.findById(id);

    if (!following_user)
      return res.status(404).send({ message: "User not found" });

    // if user is trying to follow himself
    if (`${req.user._id}` === `${following_user._id}`)
      return res.status(400).send({ message: "You can't follow yourself" });

    // check if user is already following
    const isFollowing = await Follower.find({
      user: req.user._id,
      following: following_user._id,
    });

    if (isFollowing.length > 0)
      return res.status(400).send({ message: "Already following" });

    // create new follower
    const follower = new Follower({
      user: req.user._id,
      following: following_user._id,
    });

    // save follower
    await follower.save(follower);

    res.send({ message: "Followed" });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res.status(400).send({ message: "Invalid id" });
    }

    console.log(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

exports.unfollow = async (req, res) => {
  // console.log(req.params.id);

  const id = req.params?.id;
  // if id is not present
  if (!id) return res.status(400).send({ message: "id is required" });

  // if user with id is not present
  try {
    const following_user = await User.findById(id);

    if (!following_user)
      return res.status(404).send({ message: "User not found" });

    // if user is trying to follow himself
    if (`${req.user._id}` === `${following_user._id}`)
      return res.status(400).send({ message: "You can't unfollow yourself" });

    // check if user is already following
    const isFollowing = await Follower.find({
      user: req.user._id,
      following: following_user._id,
    });

    if (isFollowing.length === 0)
      return res.status(400).send({ message: "Not following" });

    // delete follower
    await Follower.deleteOne({
      user: req.user._id,
      following: following_user._id,
    });

    res.send({ message: "Unfollowed" });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return res.status(400).send({ message: "Invalid id" });
    }

    console.log(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

//  User Name, number of followers & followings.
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const following = await Follower.find({ user: req.user._id });
    const followers = await Follower.find({ following: req.user._id });
    const data = {
      name: user.name,
      followers: followers.length,
      following: following.length,
    };
    res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    // get all posts with likes and comment count
    const posts = await Post.aggregate([
      {
        // should have owner id in post
        $match: { owner: req.user._id },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          createdAt: 1,
          likes: { $size: "$likes" },
          comments: {
            // select only title of comments
            $map: {
              input: "$comments",
              as: "comment",
              in: {
                comment: "$$comment.comment",
                createdAt: "$$comment.createdAt",
                commentedBy: "$$comment.user",
              },
            },
          },
        },
      },
    ]);

    res.send({ data: posts });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
