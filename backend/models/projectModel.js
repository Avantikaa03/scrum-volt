const { Schema } = require("mongoose");
let mongoose = require("mongoose");

// Ref(relationships): https://dev.to/oluseyeo/how-to-create-relationships-with-mongoose-and-node-js-11c8

// All properties will have required set to false by default
let projects = mongoose.Schema({
  creation: { type: Date, default: Date.now },
  title: String,
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  ticket: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tickets",
    },
  ],
});

const ProjectsModel = mongoose.model("Projects", projects);

module.exports = ProjectsModel;
