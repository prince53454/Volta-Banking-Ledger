const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
    if (mongoose.connection.readyState >= 1 || isConnected) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = connectDB;