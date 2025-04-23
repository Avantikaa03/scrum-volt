// Ref(Authentication with MERN Stack): https://namanrivaan.medium.com/authentication-with-mern-stack-9a4dbcd2290d

const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("../middlewares/auth");
const UserModel = require("../models/userModel");

// Should definitely be changed as this is supposed to be private
// should also match the one in ./middlewares/auth.js
const JWT_KEY = "the_definition_of_insanity";

/* Note: Following routes are prefixed with `/user-auth/` */

router.post("/signup", async (req, res) => {
  // res.send("<h1><i>signup ur page</i></h1>");
  try {
    const { username, password, confirm_password, name, email } = req.body;

    // Check for empty fields
    if (!username || !password || !confirm_password || !name || !email) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    // Validate password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be atleast 6 characters :)" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }
    if (confirm_password !== password) {
      return res
        .status(400)
        .json({ error: "Both the passwords dont match -_-" });
    }

    // Check if username exists
    const exists = await UserModel.findOne({ username: username });
    if (exists) {
      return res.status(400).json({ error: "User name already taken ;)" });
    }

    // Check if email exists
    const emailexists = await UserModel.findOne({ email: email });
    if (emailexists) {
      return res.status(400).json({ error: "email already taken ;)" });
    }

    // Encrypt password
    const hashedPassword = await bcryptjs.hash(password, 8);

    const user = new UserModel({
      username,
      name,
      password: hashedPassword,
      is_admin: false,
      email,
    });
    await user.save();

    res.json({ text: "User created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if any field is empty
    if (!username || !password) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .send({ error: "User with this username does not exist" });
    }

    const isMatching = await bcryptjs.compare(password, user.password);

    if (!isMatching) {
      return res.status(400).send({ error: "Incorrect password :(" });
    }
    const token = jwt.sign({ id: user._id }, JWT_KEY);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user_id);
    if (!user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { new_name, new_pronouns } = req.body;

    // Check for empty fields
    if (!new_name || !new_pronouns) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    user.name = new_name;
    user.pronouns = new_pronouns;

    await user.save();

    res.json({ text: "User updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/reset-password", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user_id);
    if (!user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { old_password, new_password, confirm_new_password } = req.body;

    // Check for empty fields
    if (!old_password || !new_password || !confirm_new_password) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    const isMatching = await bcryptjs.compare(old_password, user.password);
    if (!isMatching) {
      return res.status(400).send({ error: "Incorrect password :(" });
    }

    // Validate password
    if (new_password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be atleast 6 characters :)" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }
    if (new_password !== confirm_new_password) {
      return res
        .status(400)
        .json({ error: "Both the passwords dont match -_-" });
    }

    // Encrypt password
    const hashedPassword = await bcryptjs.hash(new_password, 8);

    user.password = hashedPassword;

    await user.save();

    res.json({ text: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user_id);
    if (!user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { password } = req.body;

    // Check if any field is empty
    if (!password) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    const isMatching = await bcryptjs.compare(password, user.password);

    if (!isMatching) {
      return res.status(400).send({ error: "Incorrect password :(" });
    }

    await UserModel.deleteOne({ _id: req.user_id });

    res.json({ text: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/info", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user_id);
    if (!user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    // TODO Get assigned projects

    res.json({
      username: user.username,
      email: user.email,
      name: user.name,
      pronouns: user.pronouns,
      // assigned_projects: 123
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout should be done at front-end

module.exports = router;
