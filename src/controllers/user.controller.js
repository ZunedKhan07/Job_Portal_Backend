import ApiErrors from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = (async (user_Id) => {
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

const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body
  
    // Check if either username or email is provided
    if (!userName && !email) {
      throw new ApiErrors(400, "Username or email must be provided");
    }
  
    // Find user by username or email
    const user = await User.findOne({ $or: [{ userName }, { email }] });
  
    // If user not found, throw error
    if (!user) {
      throw new ApiErrors(404, "User does not exist");
    }
  
    // Validate password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
  
    // If password is invalid, throw error
    if (!isPasswordCorrect) {
      throw new ApiErrors(401, "Wrong password");
    }
  
    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  
    // Send the user details and tokens in response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
    const options = {
      httpOnly: true,
      secure: true, // Set to true in production
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        status: 200,
        message: "User logged in successfully",
        data: {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
      });
    });
    
const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
    
        {
            $set: {refreshToken}
        },
        {
            new: true
        }
    ,
    )
     const options = {
             httpOnly: true,
             secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logedout successfully"))

    })

export {
    registerUser,
    loginUser,
    logoutUser
}