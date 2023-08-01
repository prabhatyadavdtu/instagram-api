// add single user in database

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

const User = db.user;

const utils = require("./app/utils");

const test_user = new User({
  email: "user@example.com",
  password: utils.makeHash("123456"),
  name: "User One",
});

test_user
  .save(test_user)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
