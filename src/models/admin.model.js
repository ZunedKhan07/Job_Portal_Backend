import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";

const adminSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    permission: [{
        type: String,
        enum: ['all', 'job_moderator', 'user_manager', 'financial_view']
    }],
    department: {
        type: String
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    actionsPerforemd: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const Admin = mongoose.model('Admin', adminSchema)