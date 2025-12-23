import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema({
    employerId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, "Employer ID is required"]
    },
    title: {
        type: String,
        required: [true, "title is required"],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, "description is required"]
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['Remote', 'Offline', 'Hybrid', 'Other'],
        default: 'Offline',
        required: true
    },
    salary: {
        min: {type: Number, required: true},
        max: {type: Number, required: true},
        currency: {type: String, default: 'INR'},
        required: true
    },
    experienceRequired: {
        type: Number,
        default: 0
    },
    skillsRequired: [{
        type: String
    }],
    isFeatured: {
        type: Boolean,
        default: falsse
    },
    isUrgent: {
        type: Boolean,
        default: falsse
    },
    isActive: {
        type: Boolean,
        default: true
    },
    closingDate: {
        type: Date
    }

}, { timestamps: true })

export const Job = mongoose.model('Job', jobSchema)