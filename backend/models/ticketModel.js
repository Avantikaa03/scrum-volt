const { Schema } = require("mongoose");
let mongoose = require("mongoose");

// Ref(relationships): https://dev.to/oluseyeo/how-to-create-relationships-with-mongoose-and-node-js-11c8

// All properties will have required set to false by default
let ticket = mongoose.Schema({
  creation: { type: Date, default: Date.now },
  title: String,
  assignees: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  description: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  deadline: { type: Date },
  status: String,
});

const TicketModel = mongoose.model("Tickets", ticket);

module.exports = TicketModel;
