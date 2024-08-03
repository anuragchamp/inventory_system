const mongoose = require("mongoose");
const uri = "mongodb+srv://ekakashkumar4:04042006@bookingcluster.oqwpxgg.mongodb.net/Inven_database?retryWrites=true&w=majority&appName=BookingCluster";


function main() {
    mongoose.connect(uri).then(() => {
        console.log("Succesfull")
    
    }).catch((err) => {
        console.log("Error: ", err)
    })
}

module.exports = { main };