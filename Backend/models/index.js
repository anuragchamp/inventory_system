const mongoose = require("mongoose");
const uri = "mongodb+srv://anuragchamp71:pSTIXpxjcxmNFqog@bookingcluster.60n9k2g.mongodb.net/inventory_db?retryWrites=true&w=majority&appName=bookingcluster";


function main() {
    mongoose.connect(uri).then(() => {
        console.log("Succesfull")
    
    }).catch((err) => {
        console.log("Error: ", err)
    })
}

module.exports = { main };