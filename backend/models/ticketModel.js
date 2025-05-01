const { Schema } = require("mongoose");
let mongoose = require("mongoose");

// Ref(relationships): https://dev.to/oluseyeo/how-to-create-relationships-with-mongoose-and-node-js-11c8

// All properties will have required set to false by default
let ticket = mongoose.Schema({
  creation: { type: Date, default: Date.now },
  title: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  assignees: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  description: String,
  status: String,
  deadline: Date,
  project: {
    type: Schema.Types.ObjectId,
    ref: "Projects"
  },
});

const TicketModel = mongoose.model("Tickets", ticket);

module.exports = TicketModel;
