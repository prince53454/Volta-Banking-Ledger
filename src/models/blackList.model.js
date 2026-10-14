const mongoose = require("mongoose")



const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required"],
        unique: [true, "token already blacklisted"]
    }
}, {
    timestamps: true
})

tokenBlackListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 })

const tokenBlackListModel = mongoose.model("tokenBlackList", tokenBlackListSchema)

module.exports = tokenBlackListModel;