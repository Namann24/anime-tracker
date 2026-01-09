import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    type: {
        type: String,
        enum: ['Problem / Bug', 'Feature Suggestion', 'General Feedback', 'Other'],
        default: 'General Feedback'
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved', 'Dismissed'],
        default: 'New'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Feedback can be anonymous or logged in
    }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
