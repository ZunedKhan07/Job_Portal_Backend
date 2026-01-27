import { Job } from "../models/job.model.js";
import ApiErrors from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Seeker } from "../models/seeker.model.js";
import { Application } from "../models/application.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Employee } from "../models/employee.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const applyJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) throw new ApiErrors(404, "Job does not exist");

    const seekerProfile = await Seeker.findOne({ userId: req.user._id });
    if (!seekerProfile) throw new ApiErrors(404, "Seeker profile not found.");

    const alreadyApplied = await Application.findOne({
        jobId,
        seekerId: seekerProfile._id
    });
    if (alreadyApplied) throw new ApiErrors(400, "You have already applied!");
    
    let resumeUrl = seekerProfile.resume;

    const resumeLocalPath = req.file?.path; 

    if (resumeLocalPath) {
        const uploadedResume = await uploadOnCloudinary(resumeLocalPath);
        if (uploadedResume) {
            resumeUrl = uploadedResume.url; // अगर नई फाइल अपलोड हुई, तो URL बदल दो
        }
    }

    if (!resumeUrl) {
        throw new ApiErrors(400, "Please upload a resume or add one to your profile.");
    }

    // --- 🚀 CLOUDINARY LOGIC END ---

    // 3. एप्लीकेशन क्रिएट करें
    const application = await Application.create({
        jobId,
        seekerId: seekerProfile._id,
        employerId: job.employerId,
        coverLetter,
        resumeSnapshot: resumeUrl // यहाँ अब Cloudinary का URL या पुराना URL जाएगा
    });

    // 4. जॉब मॉडल अपडेट
    await Job.findByIdAndUpdate(jobId, {
        $push: { applications: application._id }
    });

    return res.status(201).json(
        new ApiResponse(201, application, "Applied successfully!")
    );
});
const getMyApplications = asyncHandler( async(req, res) => {
    const seeker = await Seeker.findOne({ userId : req.user._id})

    const applications = await Application.find({ seekerId : seeker._id }) // find se all aplication aa jayegi
        .sort("-createdAt") // for latest first
        .populate({
            path: "jobId",
            select: "title salary location",
            populate: {
                path: "employeeId",
                select: "companyName logo"
            }
        })

    return res.status(200).json(
        new ApiResponse(200, applications, "Applications fetched successfully")
    );
})

const getJobApplications = asyncHandler( async(req, res) => {
    const { jobId } = req.params;

    const employerProfile = await Employee.findOne({ userId: req.user._id })

    const job = await Job.find({ jobId })
        .sort("-createdAt")
        .populate({
            path: "application",
            select: "status createdAt resumeSnapshot coverLetter",
            populate: {
                path: "seekerId",
                select: "fullName email phoneNumber skills"
            }
        })
    
        if (!job) {
            throw new ApiErrors(404, "Job not found");
        }

        if (job.userId.toString() !== employerProfile._id.toString()) {
            throw new ApiErrors(403, "You are not authorized to view applicants for this job");
        }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                jobTitle: job.title,
                totalApplicants: job.applications.length,
                applicants: job.applications
            },
            "Applicants fetched successfully"
        )
    )
})

const updateApplicationStatus = asyncHandler( async(req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    if (!status) {
        throw new ApiErrors(400, "Status is required");
    }

    const application = await Application.findById(applicationId)
    if (!application) {
        throw new ApiErrors(404, "Application does not Exits")
    }

    const employerProfile = await Employee.findOne({ userId: req.user._id })
    if (!employerProfile) {
        throw new ApiErrors(404, "Employer profile not found")
    }

    if (application.employerId.toString() !== employerProfile._id.toString()) {
        throw new ApiErrors(403, "You are not authorized to view applicants for this job");
    }

    application.status = status;
    await application.save()

    return res.status(200).json(
        new ApiResponse(200, application, "Status Updated Successfully")
    )
})

export {
    applyJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus
}