import { Router } from "express";
import { isEmployee, varifyJWT } from "../middlewares/auth.middleware.js";
import { 
    deleteJob,
    getAllJobs, 
    getSingleJob, 
    jobPost,
    updateJob} from "../controllers/jobs.controller.js";

const router = Router();

router.route("/all-jobs").get(getAllJobs)
router.route("/get/:jobId").get(getSingleJob)

router.route("/post-job").post(varifyJWT, isEmployee, jobPost)

router.route("/update-job/:jobId").patch(varifyJWT, isEmployee, updateJob)
router.route("/delete-job/:jobId").delete(varifyJWT, isEmployee, deleteJob)

export default router