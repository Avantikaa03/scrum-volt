const express = require("express");
const UserModel = require("./models/userModel");
const bcryptjs = require("bcryptjs");
let db = require("./db")

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

app.post("/user-auth/signup", async (req, res) => {
  // res.send("<h1><i>signup ur page</i></h1>");
  try {
    const { username, password, confirm_password, name, email } = req.body;


    // Check for empty fields
    if (!username || !password || !confirm_password || !name || !email) {
      return res.status(400).json({ error: "Please enter all the fields -_-" });
    }


    // Validate password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be atleast 6 characters :)" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }
    if (confirm_password !== password) {
      return res
        .status(400)
        .json({ error: "Both the passwords dont match -_-" });
    }


    // Check if username exists
    const exists = await UserModel.findOne({ username: username });
    if (exists) {
      return res.status(400).json({ error: "User name already taken ;)" });
    }
   

    // Check if email exists
    const emailexists = await UserModel.findOne({ email: email });
    if (emailexists) {
      return res.status(400).json({ error: "email already taken ;)" });
    }


    // Encrypt password
    const hashedPassword = await bcryptjs.hash(password, 8);


    const user = new UserModel({
      username,
      name,
      password: hashedPassword,
      is_admin: false,
      email
    });
    await user.save();


    res.json({ text: "User created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/user-auth/signin", (req, res) => {  
  res.send("<h1><i>signin ur page</i></h1>");
});

app.put("/user-auth/update", (req, res) => {
  res.send("<h1><i>update ur password</i></h1>");
});

app.delete("/user-auth/delete", (req, res) => {
  res.send("<h1><i>delete ur page</i></h1>");
});

app.get("/user-auth/info", (req, res) => {
  res.send("<h1><i>info</i></h1>");
});

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
