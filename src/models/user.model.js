import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    avatar: {
        type: String, // Cloudnary url
        required: true
    },
    phone: {
        type: String
    },
    location: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'employee', 'seeker'],
        default: "seeker"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profile:  {
        type: Schema.Types.ObjectId,
        ref: role
    },
    refreshToken: {
        type: String
    },

},
{
    timestamps: true
})

export const User = mongoose.model("User", userSchema)