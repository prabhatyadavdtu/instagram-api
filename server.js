const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(
  cors({
    origin: "http://localhost:8081",
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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

// test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/api.routes.js")(app);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
