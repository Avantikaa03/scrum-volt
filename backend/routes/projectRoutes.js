const express = require("express");
const router = express.Router();

const ProjectsModel = require("../models/projectModel");
const UserModel = require("../models/userModel");
const auth = require("../middlewares/auth");

/* Note: Following routes are prefixed with `/project/` */

router.post("/create", auth, async (req, res) => {
  try {
    const logged_in_user = await UserModel.findById(req.user_id);
    if (!logged_in_user) {
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
      owner: logged_in_user._id,
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

router.get("/info", auth, async (req, res) => {
  try {
    const logged_in_user = await UserModel.findById(req.user_id);
    if (!logged_in_user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { project_id } = req.body;

    // Check if any field is empty
    if (!project_id) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }
    const project = await ProjectsModel.findById(project_id);
    if (!project) {
      return res.status(400).send({ error: "Can't find the project!" });
    }

    var member_usernames = [];

    // Only run this block if 'members' is provided and is a non-empty array
    // Find usernames of members from their ids
    if (Array.isArray(project.members) && project.members.length > 0) {
      for (const id of project.members) {
        const mem = await UserModel.findById(id);
        if (mem) {
          member_usernames.push(mem.username);
        }
      }
    }

    const output = {
      title: project.title,
      description: project.description,
      members: member_usernames,
      owner: logged_in_user.username,
    };

    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-owned-by-user", auth, async (req, res) => {
  try {
    const logged_in_user = await UserModel.findById(req.user_id);
    if (!logged_in_user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const projects = await ProjectsModel.find({ owner: logged_in_user._id });
    if (!projects) {
      return res.status(400).send({ error: "Can't find the project!" });
    }

    var projects_info = [];

    // Only run this block if 'members' is provided and is a non-empty array
    // Find usernames of members from their ids
    if (Array.isArray(projects) && projects.length > 0) {
      for (const pro of projects) {
        projects_info.push({
          title: pro.title,
          id: pro._id,
        });
      }
    }

    const output = {
      projects: projects_info,
    };

    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-joined-by-user", auth, async (req, res) => {
  try {
    const logged_in_user = await UserModel.findById(req.user_id);
    if (!logged_in_user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    // Find all projects where user is in the members array
    const projects = await ProjectsModel.find({ members: logged_in_user._id });
    if (!projects || projects.length === 0) {
      return res.status(404).send({ error: "No joined projects found!" });
    }

    const projects_info = projects.map((pro) => ({
      title: pro.title,
      id: pro._id,
    }));

    res.json({ projects: projects_info });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
