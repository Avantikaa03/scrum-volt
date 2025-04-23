const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/SCRUM_DB")

mongoose.connection.on("connected", ()=> {
    console.log('Database successfully connected...');
})

mongoose.connection.on("error", ()=> {
    console.log('Database connected failed!!');
})

module.exports = mongoose