const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Workout: {
        type: String,
        required: true,
    },
    Sets: {
        type: Number,
        required: true,
    },
    Reps: {
        type: Number,
        required: true,
    },
    Target: {
        type: String,
        required: true,
    },
    'prog-pic': {
        type: String,
        required: false,
    }
});
module.exports = mongoose.model("User", userSchema);