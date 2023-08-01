const db = require("../models");

const Test = db.test;

exports.check = (req, res) => {    
    const user = req.user;
    res.json({ user: `Hello ${user?.name}, your email is ${user.email} ` });
}