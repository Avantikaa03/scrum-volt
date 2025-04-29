const express = require("express");
const router = express.Router();

const ProjectsModel = require("../models/projectModel");
const UserModel = require("../models/userModel");
const auth = require("../middlewares/auth");

/* Note: Following routes are prefixed with `/project/` */

router.post("/create", auth, async (req, res) => {
  try {
    const owner = await UserModel.findById(req.user_id);
    if (!owner) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { title, description, members } = req.body;

    // Check for empty fields
    if (!title || !description) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    var member_ids = [];
    
    // Only run this block if 'members' is provided and is a non-empty array
    console.log(Array.isArray(members) && members.length > 0)
    if (Array.isArray(members) && members.length > 0) {
      for (const uname of members) {
        const mem = await UserModel.findOne({ username: uname });
        if (mem) {
          member_ids.push(mem._id);
        }
      }
      console.log(member_ids)
    }

    const project = new ProjectsModel({
      title: title,
      description: description,
      owner: owner._id,
      members: member_ids,
    });

    await project.save();
    res.json({ text: "Project created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
