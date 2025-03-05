const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
