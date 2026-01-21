
import { User } from "../models/user.model.js";
import ApiErrors from "../utils/ApiErrors.js";
import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const varifyJWT = asyncHandler( async(req, res, next) => {
    try {
        const token = req.cookie?.accessToken || req
        .header("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiErrors(401, "Unauthorised Request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiErrors(404, "Invelide Access Token")
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiErrors(401, "Invelide Access Token")
    }
})

const isEmployee = asyncHandler( async(req, res, next) => {
    if (req.user?.role !== 'employer') {
        throw new ApiError(403, "Only Employers can post jobs!")
    }
    next();
})

export {
    varifyJWT,
    isEmployee
 }
