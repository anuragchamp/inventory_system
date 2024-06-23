// Import the express module
const express = require('express');
const { connectToDb } = require('./dbconfig')
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb'); // Importing ObjectId
const bodyParser = require('body-parser');
const cors = require('cors');

//Import .env file 
require('dotenv').config();

let client;
// Create an instance of the express application
const app = express();
app.use(bodyParser.json());
app.use(cors())


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    await client.connect();
    // Get the database and collection
    const db = client.db("booking_db");
    const collection = db.collection("user_col");

    try {
        // Find user in the database
        const user = await collection.findOne({ username, password });

        if (user) {
            // If user found, send success response with user details
            res.status(200).json(user);
        } else {
            // If user not found, send error response
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error fetching user from MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/get-all-room", async (req, res) => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('booking_db');
        const collection = db.collection('booking_col');

        // Fetch all data from the collection
        const cursor = collection.find();

        // Convert cursor to array of documents
        const documents = await cursor.toArray();

        // Log the fetched documents
        console.log('Fetched data:', documents);
        res.status(200);
        res.send(documents);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500);
        res.send(error);
    } finally {
       
        console.log('Connection closed');
    }
})


// POST endpoint to reserve a room for 1 hour or update existing entry
app.post('/reserve-room', async (req, res) => {
    const { room_id, user_id, start_time, end_time } = req.body;

    // Validate required fields
    if (!room_id || !user_id || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db('booking_db');
        const collection = db.collection('booking_col');

        const objectId = new ObjectId(room_id);

        const roomAlreadyExists = await collection.findOne({

            user_id: user_id
        });

        if (roomAlreadyExists) {
            return res.status(200).json({ result: 'Room already reserved for the same user' });
        }

        // Check if the room is already reserved for the same time
        const existingReservation = await collection.findOne({
            _id: objectId,
            start_time: { $lte: end_time },
            end_time: { $gte: start_time }
        });

        if (existingReservation) {
            /* The line `return res.status(409).json({ error: 'Room already reserved for the same time'
            });` is handling a scenario where a room is already reserved for the same time slot. */
            return res.status(409).json({ error: 'Room already reserved for the same time' });
        }

        // Check if the room is already reserved for the same time by any user
        const existingReservation1 = await collection.findOne({
            $or: [
                {
                    start_time: { $lte: end_time },
                    end_time: { $gte: start_time }
                },
                {
                    user_id,
                    start_time: { $lte: end_time },
                    end_time: { $gte: start_time }
                }
            ]
        });

        if (existingReservation1) {
            return res.status(409).json({ error: 'Room already reserved for the same time or by the same user' });
        }

        // Reserve the room for 1 hour
        const reservation = {
            user_id,
            start_time,
            end_time: new Date(end_time).setHours(new Date(end_time).getHours() + 1) // Adding 1 hour to end time
        };

        // Update or insert reservation
        const result = await collection.updateOne(
            { _id: objectId },
            { $set: reservation },
            { upsert: true }
        );

        res.status(200).json({ message: 'Room reserved for 1 hour', result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Close MongoDB connection
        
    }
});


// GET endpoint to get name from _id
app.get('/get-name/:id', async (req, res) => {
    const id = req.params.id;

    console.log("came here", id)
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db('booking_db');
        const collection = db.collection('user_col');

        const idToFind = new ObjectId(id)
        // Find document by _id and retrieve the name
        const result = await collection.findOne({ _id: idToFind });
        console.log(result);
        if (!result) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Respond with the name
        res.status(200).json({ name: result.name });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Close MongoDB connection
        
    }
});

// GET endpoint to retrieve rooms reserved by a logged-in user
app.get('/reserved-rooms/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db('booking_db');
        const collection = db.collection('booking_col');

        // Find rooms reserved by the user
        const reservedRooms = await collection.find({ user_id: user_id }).toArray();

        res.status(200).json(reservedRooms);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Close MongoDB connection
        
    }
});

app.post('/add-room', async (req, res) => {

    const data = req.body;
    try {
        await client.connect();
        const db = client.db('booking_db');
        const collection = db.collection('booking_col');
        const result = await collection.insertOne(data);
        res.status(200);
        res.send('saved');
    } catch (e) {
        console.log(e);
        res.status(400);
        res.send('None shall pass');
    } finally {
       
        console.log('Connection closed');
    }

})

// Function to remove specified keys from reservations
const removeKeysFromReservations = async () => {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db('booking_db');
        const collection = db.collection('booking_col');

        // Find and update expired reservations
        const result = await collection.updateMany(
            { end_time: { $lte: new Date() } }, // Find expired reservations
            { $unset: { booked_by_user_id: "", booking_time: "", booking_date: "", start_time: "", end_time: "" } } // Remove specified keys
        );

        console.log(`Removed keys from ${result.modifiedCount} expired reservations`);
    } catch (error) {
        console.error('Error:', error);
    }
};

// Schedule the task to run every hour (adjust the interval as needed)
setInterval(removeKeysFromReservations, 3600000); // 1 hour = 3600000 milliseconds

// Set the port number for the server
const port = process.env.SERVER;

// Start the server and listen on the specified port
app.listen(port, async () => {
    client = await connectToDb();
    console.log(`Server running at http://localhost:${port}`);
});
