const jwt = require("jsonwebtoken");

// Should definitely be changed as this is supposed to be private
// should also match the one in ./routes/authRoutes.js
const JWT_KEY = "the_definition_of_insanity";


// Use this middleware in any route that requires a user
const auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({ error: "No auth token, access denied" });
    const verified = jwt.verify(token, JWT_KEY);
    if (!verified)
      return res
        .status(401)
        .json({ error: "Token verification failed, authorization denied" });
    req.user_id = verified.id;

    // Don't remove!!
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;