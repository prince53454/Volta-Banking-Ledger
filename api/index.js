const connectDB = require("../src/config/db");
const app = require("../src/app");

module.exports = async (req, res) => {
    const missingVariables = ["MONGO_URI", "JWT_SECRET"].filter(
        (name) => !process.env[name]
    );

    if (missingVariables.length > 0) {
        console.error(
            `Missing required environment variables: ${missingVariables.join(", ")}`
        );
        return res.status(500).json({
            message: "Server configuration is incomplete. Check the Vercel environment variables."
        });
    }

    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error("API initialization error:", error);
        return res.status(500).json({
            message: "The API could not start. Check Vercel environment variables and database access."
        });
    }
};
