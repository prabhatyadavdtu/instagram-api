// imports
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

// make hash from string
const makeHash = (str) => {
  var crypto = require("crypto");
  var hash = crypto.createHash("sha256").update(str).digest("hex");
  return hash;
};

// check password with hash
const checkPassword = (password, hash) => makeHash(password) === hash;

// create jwt token
const createToken = (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: 86400, // 24 hours
    }
  );
  return token;
};

// check is user logged in
const isLoggedIn = async (req, res, next) => {
  if (req.url === "/authenticate" || req.url === '/register') return next();

  let token = req.headers["authorization"];
  if (!token) return res.status(401).send({ message: "Unauthorized" });

  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    // console.log(user);

    if (!user) return res.status(401).send({ message: "Unauthorized!" });
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "Unauthorized!" });
  }
};

module.exports = {
  makeHash,
  checkPassword,
  isLoggedIn,
  createToken,
};
