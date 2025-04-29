const express = require("express");
const UserModel = require("./models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
let db = require("./db");
const auth = require("./middlewares/auth");

// Run command `node .\index.js`

/********** App Settings **********/
const app = express();
const HOST = "localhost";
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.static("./public"));
// app.use(formidable());
app.use(express.json()); // To convert request body into json
app.use(express.urlencoded({ extended: true }));

// Should definitely be changed as this is supposed to be private
// should also match the one in ./middlewares/auth.js
const JWT_KEY = "the_definition_of_insanity";
/**********************************/

/*****************/
/* HTTP Methods */
/* get -- when retreiving data from db */
/* post -- when adding data to db OR when security is needed, like sending password with request */
/* put -- when updating data in db */
/* delete -- when deleting data from db */
/*****************/

/*********** Routes ***********/
// Extended Routes
// app.use("/emp", empRoutes);


const authRoutes = require('./routes/authRoutes');
app.use("/user-auth", authRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use("/project", projectRoutes);



// Home Routes
app.get("/", (req, res) => {
  res.send("<h1><i>Look at how they massacared my boy</i></h1>");
});
/*******************************/

app.listen(PORT, HOST, (err) => {
  if (!err) {
    console.log("Server started...");
    console.log(`Server adress: http://${HOST}:${PORT}`);
  } else {
    console.log(`Error Occured: ${err}`);
  }
});
