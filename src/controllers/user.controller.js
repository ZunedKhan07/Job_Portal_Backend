import ApiErrors from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

const generateAccessandRefreshToken = (async (user_Id) => {
    const user = await User.findById(user_Id)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken  // user me obj save krana
    await user.save({ validateBeforeSave: false })  // db se save krna

    return {accessToken, refreshToken}

})

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


    const {fullName, userName, password, email, phone, location, role} = req.body;

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

    const exitedUser = await User.findOne({
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
        location,
        role
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiErrors(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const logInUser = asyncHandler( async (req, res) => {
    // req body se data
    // username or email
    // find the user
    // password checking
    // generate access and refresh token
    // send cookie

    const {email, userName, password} = req.body;

    if (!userName || !email) {
        throw new ApiErrors(401, "usrename or email is required")
    }

    const user = await User.findOne({
        $nor: [{email}, {userName}]
    })

    if (!user) {
        throw new ApiErrors(404, "user does not exits")  
    }

    const isPasswordCorrect = user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiErrors(400, "Invalide User Credentials")
    }

    const {accessToken, refreshToken} = await 
    generateAccessandRefreshToken(user._id);

    const loggedInUser =  await User.findById(user._id)
    .select("-password refreshToken")

    const options = {
        httpOnly: true,  // only server se modified hoganot frontend
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCokkie("accessToken", options)
    .clearCokkie("refreshToken", options)
    .json(
        new ApiResponse(201, {}, "User logged Out")
    )
})

export default {
    registerUser,
    logInUser,
    logoutUser
}