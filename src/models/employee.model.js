import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
    user : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName : {
        type: String,
        required: true,
        trim: true
    },
    website : {
        type: String,
        required: true,
        unique: true
    },
    companyEmail : {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    description : {
        type: String
    },
    logo: {
        type: String
    },
    industry: {
        type: String
    },
    companySize: {
        type: String
    },
    address: {
        type: String
    },
    contact: {
        type: String
    },
    jobsPosted: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }
    ]
}, 
{
    timestamps: true
})

export const Employee = mongoose.model("Employee", employeeSchema)