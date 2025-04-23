const express = require("express");
const formidable = require("express-formidable");

// Run command `node .\index.js`

/********** App Settings **********/
const app = express();
const HOST = "localhost";
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(formidable());
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

app.post("/user-auth/signup", (req, res) => {
  res.send("<h1><i>signup ur page</i></h1>");
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