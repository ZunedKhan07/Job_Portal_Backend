import { Router } from "express";
import {varifyJWT, isSeeker, isEmployee} from "../middlewares/auth.middleware.js";
import { applyJob, getJobApplications, getMyApplications, updateApplicationStatus } from "../controllers/application.controller.js";

const router = Router();

router.route("/apply/:jobId").post(varifyJWT, isSeeker, applyJob)
router.route("/my-application").get(varifyJWT, isSeeker, getMyApplications)

router.route("/applicants/:jobId").get(varifyJWT, isEmployee, getJobApplications)
router.route("/status/:applicationId").patch(varifyJWT, isEmployee, updateApplicationStatus)

export default router