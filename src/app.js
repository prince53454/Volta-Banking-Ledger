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
