import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    room:       { type: String, required: true, index: true },
    username:   { type: String, required: true },
    text:       { type: String, required: true },
    avatarSeed: { type: Number, default: 0 },
    timestamp:  { type: Date,   default: Date.now }
});

export default mongoose.model('Message', messageSchema);
