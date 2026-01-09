import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    fullName: {
        type: String,
        required: true,
        trim: true
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
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
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
        ref: "role"
    },
    refreshToken: {
        type: String
    },

},
{
    timestamps: true
})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFERSH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFERSH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)