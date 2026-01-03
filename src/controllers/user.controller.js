import ApiErrors from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

const registerUser = asyncHandler( async (req, res) => {
    // get user details from user or frontend
    // validation
    // user already exits
    // check for images like avatar
    // upload them to cloudinary
    // create user obj - create entry in db
    // remove password and refreshtoken from response
    // check for user creation
    // return res


    const {fullName, userName, password, email, phone, location} = req.body;

    // if(fullName?.trim() === "" || 
    //    userName?.trim() === "" || 
    //    password?.trim() === "" || 
    //    email?.trim() === "" || 
    //    phone?.trim() === "" || 
    //    location?.trim() === ""
    // ) {
    //     throw new ApiErrors(404, "All field are required")
    // }

    if(
        [fullName, userName, password, email].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiErrors(404, "All field are required")
    }

    const exitedUser = User.findOne({
        $or: [{userName}, {email}]
    })

    if(exitedUser){
        throw new ApiErrors(409, "email already exits")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;   // files ka eccess multer se milta hai

    if(!avatarLocalPath){
        throw new ApiErrors(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiErrors(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        password,
        userName: userName.toLowerCase(),
        phone,
        location
    })

    const createdUser = await user.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiErrors(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export default registerUser