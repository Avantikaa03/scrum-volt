let mongoose = require("mongoose");

// All properties will have required set to true by default
let user = mongoose.Schema({
  username: { type: String, unique: true },
  name: String,
  password: String,
  joining: { type: Date, default: Date.now },
  is_admin: Boolean,
  email:{ type: String, unique: true },
  pronouns: { type: String, required: false }
});

const UserModel = mongoose.model("Users", user);

module.exports = UserModel;