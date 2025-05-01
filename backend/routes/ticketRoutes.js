const express = require("express");
const router = express.Router();

const UserModel = require("../models/userModel");
const auth = require("../middlewares/auth");
const TicketModel = require("../models/ticketModel");

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

    const { title, description, assignees, deadline } = req.body;

    // Check for empty fields
    if (!title || !description) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
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

module.exports = router;
