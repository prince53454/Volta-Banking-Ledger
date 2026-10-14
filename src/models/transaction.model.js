const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "fromAccount is required"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "toAccount is required"],
        index: true

    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "status can be either PENDING,COMPLETED,FAILED or REVERSED"
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "amount is requested for creaiting transaction"],
        min: [0, "Transaction can't be negative"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "idempotencyKey is required for transaction"],
        unique: [true, "idempotencyKey must be unique for transaction"],
        index: true
    }
}, {
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel;