const express = require("express");
const router = express.Router();

const UserModel = require("../models/userModel");
const auth = require("../middlewares/auth");
const TicketModel = require("../models/ticketModel");
const ProjectsModel = require("../models/projectModel");

/* Note: Following routes are prefixed with `/ticket/` */

router.post("/create", auth, async (req, res) => {
  try {
    // user logg in
    // input
    // input validation & transformation
    // create ticket (add input to table)

    const logged_in_user = await UserModel.findById(req.user_id);
    if (!logged_in_user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { title, description, assignees, deadline, project_id } = req.body;

    // Check for empty fields
    if (!title || !description || !deadline || !project_id) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    // Check if project exists
    const project = await ProjectsModel.findById(project_id);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Only run this block if 'assignees' is provided and is a non-empty array

    // Converts assignees' usernames into their ids
    var assignees_ids = [];
    // Only run this block if 'assignee' is provided and is a non-empty array
    if (Array.isArray(assignees) && assignees.length > 0) {
      for (const uname of assignees) {
        const assig = await UserModel.findOne({ username: uname });
        if (assig) {
          assignees_ids.push(assig._id);
        }
      }
    }

    const ticket = new TicketModel({
      title: title,
      description: description,
      assignees: assignees_ids,
      creator: logged_in_user.id,
      status: "pending",
      deadline: new Date(deadline),
      project: project._id,
    });
    await ticket.save();

    res.json({ text: "Ticket created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const { ticket_id } = req.body;

    // Check if any field is empty
    if (!ticket_id) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }
    const ticket = await TicketModel.findById(ticket_id);
    if (!ticket) {
      return res.status(400).send({ error: "Can't find the ticket!" });
    }

    await TicketModel.deleteOne({ _id: ticket_id });

    res.json({ text: "ticket deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/update", auth, async (req, res) => {
  try {
    const logged_in_user = await UserModel.findById(req.user_id);
    if (!logged_in_user) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    const { ticket_id, new_title, new_description, new_deadline, new_status } =
      req.body;
    // Check for empty fields
    if (
      !ticket_id ||
      !new_title ||
      !new_description ||
      !new_deadline ||
      !new_status
    ) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    const ticket = await TicketModel.findById(ticket_id);
    if (!ticket) {
      return res.status(400).send({ error: "Can't find the ticket!" });
    }

    const ticket_creator = await UserModel.findById(ticket.creator);
    if (!ticket_creator) {
      return res.status(400).send({ error: "Can't find the user!" });
    }

    if (ticket_creator.username === logged_in_user.username) {
      ticket.title = new_title;
      ticket.description = new_description;
      ticket.deadline = new Date(new_deadline);
      ticket.status = new_status;

      await ticket.save();

      res.json({ text: "Ticket updated successfully!" });
    } else {
      return res.status(400).send({ error: "Ticket not owned by the user!!" });
    }
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

    const { ticket_id } = req.body;
    // Check for empty fields
    if (!ticket_id) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }

    const ticket = await TicketModel.findById(ticket_id);
    if (!ticket) {
      return res.status(400).send({ error: "Can't find the ticket!" });
    }

    var assignee_usernames = [];

    // Only run this block if 'assignees' is provided and is a non-empty array
    // Find usernames of assignees from their ids
    if (Array.isArray(ticket.assignees) && ticket.assignees.length > 0) {
      for (const id of ticket.assignees) {
        const aa = await UserModel.findById(id);
        if (aa) {
          assignee_usernames.push(aa.username);
        }
      }
    }

    const output = {
      title: ticket.title,
      description: ticket.description,
      creator: ticket.creator.username,
      assignees: assignee_usernames,
      status: ticket.status,
      deadline: ticket.deadline.toISOString().split('T')[0] // "2025-05-01"
    };

    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add-assignees", auth, async (req, res) => {
  try {
    const { ticket_id, usernames } = req.body;

    // Check for empty fields
    if (!ticket_id || !Array.isArray(usernames) || usernames.length === 0) {
      return res
        .status(400)
        .json({ error: "Ticket ID and usernames are required." });
    }

    const ticket = await TicketModel.findById(ticket_id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    if (String(ticket.creator) !== req.user_id) {
      return res
        .status(403)
        .json({ error: "Only the ticket creator can add assignees." });
    }

    const users = await UserModel.find({ username: { $in: usernames } });

    const newAssigneeIds = users
      .map((u) => u._id)
      .filter((id) => !ticket.assignees.includes(id)); // avoid duplicates

    ticket.assignees.push(...newAssigneeIds);
    await ticket.save();

    res.json({ message: "Assignees added successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/remove-assignees", auth, async (req, res) => {
  try {
    const { ticket_id, usernames } = req.body;

    if (!ticket_id || !Array.isArray(usernames) || usernames.length === 0) {
      return res
        .status(400)
        .json({ error: "Ticket ID and usernames are required." });
    }

    const ticket = await TicketModel.findById(ticket_id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    if (String(ticket.creator) !== req.user_id) {
      return res
        .status(403)
        .json({ error: "Only the ticket creator can remove assignees." });
    }

    const users = await UserModel.find({ username: { $in: usernames } });
    const removeIds = users.map((u) => u._id.toString());

    ticket.assignees = ticket.assignees.filter(
      (memberId) => !removeIds.includes(memberId.toString())
    );

    await ticket.save();

    res.json({ message: "Assignees removed successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-all-in-project", auth, async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: "Project ID is required." });
    }

    const tickets = await TicketModel.find({ project: project_id });

    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-all-tickets-owned-by-user", auth, async (req, res) => {
  try {
    const tickets = await TicketModel.find({ creator: req.user_id });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-all-tickets-assigned-to-user", auth, async (req, res) => {
  try {
    const tickets = await TicketModel.find({ assignees: req.user_id });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
