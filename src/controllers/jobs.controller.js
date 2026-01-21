import asyncHandler from "../utils/asyncHandler.js";
import { Employee } from "../models/employee.model.js";
import { Job } from "../models/job.model.js";
import ApiErrors from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js"

const jobPost = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        salary,
        location,
        skills,
        jobType,
        category,
        isFeatured,
        isUrgent,
        closingDate,
        experienceRequired
        
    } = req.body;

    if (
        [title, description, location, jobType, category].some((feild) =>
            feild?.trim() === ""
        )
    ) {
        throw new ApiErrors(400, "All field are required")
    }

    if (!salary || !salary.min || !salary.max) {
        throw new ApiErrors(400, "All field are required")
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
        throw new ApiErrors(400, "All field are required")
    }

    const employerProfile = await Employee.findOne({ userID: req.user._id })

    if (!employerProfile) {
        throw new ApiErrors(403, "Employer profile not found. Please complete your profile first.")
    }

    const job = await Job.create({
        employerId: employerProfile._id,
        title,
        description,
        category,
        location,
        jobType,
        salary,
        experienceRequired,
        skills,
        isFeatured: isFeatured || false,
        isUrgent: isUrgent || false,
        closingDate: closingDate || null
    })

    Employee.findByIdAndUpdate(
        employerProfile._id,
        {
            $puch: { jobPosted: job._id }
        },
        { new: true }
    )

    return res.status(201).json(
        new ApiResponse(201, job, "Job posted successfully")
    )
})

const deleteJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiErrors(404, "Job does not exist");
    }

    const employeeProfile = await Employee.findOne({ userID: req.user._id });

    if (!employeeProfile) {
        throw new ApiErrors(404, "Employer profile not found");
    }

    if (job.employerId.toString() !== employeeProfile._id.toString()) {
        throw new ApiErrors(403, "You are not authorized to delete this job");
    }

    await Job.findByIdAndDelete(jobId);

    await Employee.findByIdAndUpdate(
        employeeProfile._id,
        {
            $pull: { jobsPosted: jobId } 
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, null, "Job Deleted Successfully")
    );
});

const updateJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiErrors(400, "At least one field is required to update")
    }

    const job = await Job.findById(jobId)
    if (!job) {
        throw new ApiErrors(404, "Job does not exist");
    }

    const employeeProfile = await Employee.findOne({ userID: req.user._id })
    if (!employeeProfile) {
        throw new ApiErrors(404, "Employer Profile Does Not Exits")
    }

    if (job.employerId.toString() !== employeeProfile._id.toString()) {
        throw new ApiErrors(403, "You are not authorized to update this job")
    }

    const newUpdatedJob = await Job.findByIdAndUpdate(
        jobId,
        {
            $set: req.body
        },
        { new: true, runValidators: true}
    )

    return res.status(200).json(
        new ApiResponse(200, newUpdatedJob, "Job Updated Successfully")
    )
})

const getAllJobs = asyncHandler(async (req, res) => {
    const {keyword, location, category, jobType} = req.query;

    const query = { isActive: true }

    if (keyword) {
        query.title = {
            $regex: keyword,
            $options: "i"
        }
    }

    if (location) {
        query.location = {
            $regex: location,
            $options: "i"
        }
    }

    if (category) {
        query.category = category
    }

    if (jobType) {
        query.jobType = jobType
    }

    const jobs = await Job.find(query)
        .populate("employerId", "companyName logo")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, {
            count: jobs.length,
            jobs
        }, "Jobs Fetched Successfully")
    )
})

const getSingleJob = asyncHandler(async (req,res) => {
    const { jobId } = req. params;

    const job = await Job.findById(jobId).populate(
        "employerId",
        "companyName logo website companyEmail description address contact"
    )

    if (!job) {
        throw new ApiErrors(404, "Job not Found")
    }

    return res.status(200).json(
        new ApiResponse(200, job, "Job details fetched successfully")
    )
})

export {
    jobPost,
    deleteJob,
    updateJob,
    getAllJobs,
    getSingleJob
}