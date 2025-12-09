const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Using original working credentials
        await mongoose.connect(
            "mongodb+srv://soumikb0001_db_user:DX9Nak8JMDOkGaCF@cluster0.ogsx2gt.mongodb.net/coinchanger?retryWrites=true&w=majority&appName=Cluster0"
        );

        console.log("🌍 MongoDB Atlas Connected Successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
