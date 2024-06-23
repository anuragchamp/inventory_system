// Import MongoClient and ServerApiVersion from the 'mongodb' package
const { MongoClient } = require('mongodb');

// Connection URI to your MongoDB database
const uri = "mongodb+srv://anuragchamp71:pSTIXpxjcxmNFqog@bookingcluster.60n9k2g.mongodb.net/?retryWrites=true&w=majority&appName=bookingcluster";

// Create a MongoClient with specified options


// Asynchronous function to connect to the MongoDB database
async function connectToDb() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        // Connect the client to the MongoDB server
        await client.connect();
        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        // Return the connected client object
        return client;
    } catch (e) {
        // Handle connection errors
        console.error("Error while connecting to database:", e);
        throw e; // Rethrow the error to handle it outside
    }
}

// Export the connectToDb function
module.exports = { connectToDb };
