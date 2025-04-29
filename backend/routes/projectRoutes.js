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
    if (Array.isArray(members) && members.length > 0) {
      for (const uname of members) {
        const mem = await UserModel.findOne({ username: uname });
        if (mem) {
          member_ids.push(mem._id);
        }
      }
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

router.delete("/delete", auth, async (req, res) => {
  try {
    const { project_id } = req.body;

    // Check if any field is empty
    if (!project_id) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }
    const project = await ProjectsModel.findById(project_id);
    if (!project) {
      return res.status(400).send({ error: "Can't find the project!" });
    }

    await ProjectsModel.deleteOne({ _id: project_id });

    res.json({ text: "Project deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
