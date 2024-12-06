const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    Workout: { type: String, required: true },
    Sets: { type: Number, required: true },
    Reps: { type: Number, required: true },
    Target: { type: String, required: true },
    Weight: { type: Number, required: true },
});

module.exports = mongoose.model('Workout', workoutSchema);
