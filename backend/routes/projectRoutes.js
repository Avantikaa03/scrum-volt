const express = require("express");
const router = express.Router();

const ProjectsModel = require("../models/projectModel");
const UserModel = require("../models/userModel");
const auth = require("../middlewares/auth");

/* Note: Following routes are prefixed with `/project/` */


/**
 * @route   POST /project/create
 * @desc    Creates a new project with given title, description, and optional members
 * @access  Private (Requires authentication)
 * @body    { title: String, description: String, members?: [String] (usernames) }
 * @returns { message: String } or error
 */
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

/**
 * @route   DELETE /project/delete
 * @desc    Deletes a project by ID
 * @access  Private (Only owner can delete)
 * @body    { project_id: String }
 * @returns { message: String } or error
 */
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

/**
 * @route   GET /project/info
 * @desc    Returns detailed info about a project including members and owner
 * @access  Private
 * @body    { project_id: String }
 * @returns { title, description, members: [usernames], owner: username } or error
 */
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

/**
 * @route   GET /project/get-owned-by-user
 * @desc    Fetches all projects created/owned by the logged-in user
 * @access  Private
 * @returns { projects: [{ title, id }] } or error
 */
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

/**
 * @route   GET /project/get-joined-by-user
 * @desc    Fetches all projects where the user is a member (but not necessarily the owner)
 * @access  Private
 * @returns { projects: [{ title, id }] } or error
 */
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

/**
 * @route   PUT /project/update
 * @desc    Updates the title and description of a project (owner-only)
 * @access  Private
 * @body    { project_id: String, new_title: String, new_description: String }
 * @returns { message: String } or error
 */
router.put("/update", auth, async (req, res) => {
  try {
    const logged_in_user = await UserModel.findById(req.user_id);
    if (!logged_in_user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { project_id, new_title, new_description } = req.body;
    // Check for empty fields
    if (!project_id || !new_title || !new_description) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    const project = await ProjectsModel.findById(project_id);
    if (!project) {
      return res.status(400).send({ error: "Can't find the project!" });
    }

    
    const project_owner = await UserModel.findById(project.owner);
    if (!project_owner) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    if (project_owner.username === logged_in_user.username) {
      project.title = new_title
      project.description = new_description

      await project.save();

      res.json({ text: "Project updated successfully!" });
    } else {
      return res.status(400).send({ error: "Project not owned by the user!!" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /project/add-members
 * @desc    Adds users to a project by their usernames (owner-only)
 * @access  Private
 * @body    { project_id: String, usernames: [String] }
 * @returns { message: String } or error
 */
router.post("/add-members", auth, async (req, res) => {
  try {
    const { project_id, usernames } = req.body;
    
    // Check for empty fields
    if (!project_id || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: "Project ID and usernames are required." });
    }

    const project = await ProjectsModel.findById(project_id);
    if (!project) return res.status(404).json({ error: "Project not found." });

    if (String(project.owner) !== req.user_id) {
      return res.status(403).json({ error: "Only the project owner can add members." });
    }

    const users = await UserModel.find({ username: { $in: usernames } });

    const newMemberIds = users
      .map((u) => u._id)
      .filter((id) => !project.members.includes(id)); // avoid duplicates

    project.members.push(...newMemberIds);
    await project.save();

    res.json({ message: "Members added successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /project/remove-members
 * @desc    Removes users from a project by their usernames (owner-only)
 * @access  Private
 * @body    { project_id: String, usernames: [String] }
 * @returns { message: String } or error
 */
router.post("/remove-members", auth, async (req, res) => {
  try {
    const { project_id, usernames } = req.body;

    if (!project_id || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({ error: "Project ID and usernames are required." });
    }

    const project = await ProjectsModel.findById(project_id);
    if (!project) return res.status(404).json({ error: "Project not found." });

    if (String(project.owner) !== req.user_id) {
      return res.status(403).json({ error: "Only the project owner can remove members." });
    }

    const users = await UserModel.find({ username: { $in: usernames } });
    const removeIds = users.map((u) => u._id.toString());

    project.members = project.members.filter(
      (memberId) => !removeIds.includes(memberId.toString())
    );

    await project.save();

    res.json({ message: "Members removed successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
