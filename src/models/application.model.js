import mongoose, { Schema } from "mongoose";

const applicationSchema = Schema({
    jonbId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    seekerId: {
        type: Schema.Types.ObjectId,
        ref: 'Seeker',
        required: true
    },
    employerId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Interviewing', 'Rejected', 'Hired'],
        default: 'Applied'
    },
    resumeSnapshot: {
        type: String
    },
    coverLatter: {
        type: String
    },
}, { timestamps: true })

//1 to 1 (ek user ek hi job me apply kar sake)
applicationSchema.index({jonbId: 1, seekerId: 1}, { unique: true })

export const Application = mongoose.model("Application", applicationSchema)