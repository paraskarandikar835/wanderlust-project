// Insert sample data into the database (Seeding)

require("dotenv").config({
    path: require("path").join(__dirname, "../.env"),
});

const dns = require("dns");

// Use Google DNS for MongoDB Atlas SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    try {
        console.log("Connecting to MongoDB Atlas...");

        await mongoose.connect(dbUrl);

        console.log("Connected to MongoDB Atlas");

        await initDb();

        await mongoose.connection.close();

        console.log("Database connection closed");
    } catch (err) {
        console.log("Database error:", err);
    }
}

const initDb = async () => {

    await Listing.deleteMany({});

    const ownerId = new mongoose.Types.ObjectId(
        "69a558a6321f83259915af87"
    );

    const updatedData = initData.data.map((obj) => ({
        ...obj,
        owner: ownerId,
    }));

    await Listing.insertMany(updatedData);

    console.log(`${updatedData.length} listings inserted successfully`);
};

main();