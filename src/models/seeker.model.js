import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";

const seekerSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bio: {
        type: String,
        trim: true
    },
    education: [{
        institude:  String,
        degree: String,
        year: Number
    }],
    experience: [{
        company: String,
        role: String,
        from: Date,
        to: Date,
        current: {type: Boolean, default: false}
    }],
    skills: [String],

    resume: {
        type: String
    },
    portfolio: {
        type: String
    },
    currentLocation: {
        type: String
    }
}, { timestamps: true })

export const Seeker = mongoose.model("Seeker", seekerSchema)