module.exports = (app) => {
  const test = require("../controllers/test.controller.js");
  const user = require("../controllers/user.controller.js");
  const post = require("../controllers/post.controller.js");

  const utils = require("../utils");

  var apiRoutes = require("express").Router();

  apiRoutes.post("/", test.check);

  apiRoutes.post("/register", user.register);
  apiRoutes.post("/authenticate", user.login);

  // follow user 
  apiRoutes.post("/follow/:id", user.follow);
  apiRoutes.post("/unfollow/:id", user.unfollow);

  apiRoutes.post("/user",user.profile);
  apiRoutes.get("/all_posts",user.getAllPosts);

  // posts
  apiRoutes.post("/posts", post.create); 
  apiRoutes.delete("/posts/:id", post.delete);
  apiRoutes.get("/posts/:id", post.getPost);

  apiRoutes.post("/like/:id", post.like);
  apiRoutes.post("/unlike/:id", post.unlike);

  apiRoutes.post("/comment/:id", post.comment);


  // auth middleware
  app.use("/api", utils.isLoggedIn);

  app.use("/api", apiRoutes);
};
