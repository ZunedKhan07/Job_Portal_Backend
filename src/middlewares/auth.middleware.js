import { jwt } from "jsonwebtoken";
import ApiErrors from "../utils/ApiErrors";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


export const varifyJWT = asyncHandler( async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header
        ("Authorization").replace("Bearer ", "")
    
        if (!token) {
            throw new ApiErrors(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.varify(token,
             process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).
        select("-password -refreshToken")
    
        if (!user) {
            throw new ApiErrors(404, "Invalid Access Token")
        }
    
        req.user = user;
        next();
    
    } catch (error) {
        throw new ApiErrors(400, error?.message || "Invalid AccessToken")
    }})