const router = require("express").Router();
const User = require("../models/User");

const { registerValidation, loginValidation } = require("../validation.js");

const bcrypt = require("bcryptjs");

const jwt = require('jsonwebtoken');

const verify = require('./verifyToken');

router.post("/register", async (req, res) => {
  // VALIDATE DATA
  const validation = registerValidation(req.body);
  if (validation.error)
    return res.status(400).send(validation.error.details[0].message);

  // Checking E-Mail Already Exist
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("E-Mail Already Exist");

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPasswprd = await bcrypt.hash(req.body.password, salt);

  // Send Data
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPasswprd,
  });
  try {
    const savedUser = await user.save();
    res.status(200).send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  // VALIDATE DATA
  const validation = loginValidation(req.body);
  if (validation.error)
    return res.status(400).send(validation.error.details[0].message);

  // Checking If the E-Mail Exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("E-Mail or Password is Wrong!");

  // Password is Correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("E-Mail or Password is Wrong!");
  
  // Create and assign a token
  const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
  res.header('auth-token', token).send(token);
});

router.get('/info', verify , async (req, res) => {
    const user = await User.findById(req.user._id);
    res.send(user);
});

module.exports = router;