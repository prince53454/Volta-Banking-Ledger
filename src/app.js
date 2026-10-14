const express = require("express");
const cookieParser=require("cookie-parser")
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();  

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

const path = require("path");

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use((err, req, res, next) => {
    if (!req.path.startsWith("/api")) {
        return next(err);
    }

    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
        ? err.status
        : 500;
    const message = err.type === "entity.parse.failed"
        ? "Request body must be valid JSON."
        : "An unexpected server error occurred.";

    console.error("API request error:", err);
    return res.status(status).json({ message });
});

app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// In production, serve the built React frontend
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"), (err) => {
        if (err) {
            res.status(200).send("Volta API is running. Build frontend to view UI.");
        }
    });
});

module.exports = app;
