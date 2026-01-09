import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
   try {
      const user = User.findById(userId);

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave : false});

      return {accessToken, refreshToken};
   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating access token and refresh token");
   }
}

// register user
const registerUser = asyncHandler(async (req, res) => {
   const {fullName, userName, email, password} = req.body;
   // console.log(fullName); // check if data is coming or not
   // console.log(req.files);

   if(
      [fullName, userName, email, password].some((field) => field?.trim() === "")
   ){
      throw new ApiError(400, "All fields are required");
   }

   const existedUser = await User.findOne({
      $or : [
         {userName},
         {email}
      ]
   })

   if(existedUser) throw new ApiError(409, "User Already Existed");
   const avatarLocalPath = req.files?.avatar[0]?.path;
   let coverImageLocalPath;
   if(req.files?.coverImage && req.files?.coverImage[0]?.path){
      coverImageLocalPath = req.files?.coverImage[0]?.path;
   }

   // console.log(avatarLocalPath, coverImageLocalPath);
   if(!avatarLocalPath) throw new ApiError(400, "Avatar is required");
   
   const avatar = await uploadOnClodinary(avatarLocalPath);
   const coverImage = await uploadOnClodinary(coverImageLocalPath);
   // console.log("avatar : ", avatar, "\n", "coverImage : ", coverImage);

   if(!avatar) throw new ApiError(400, "Avatar is required");

   const user = await User.create({
      fullName,
      userName,
      email,
      password,
      avatar : avatar.url,
      coverImage : coverImage?.url || ""
   });

   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if(!createdUser) throw new ApiError(500, "Something went wrong while creating user"); 


   res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
});

// login user
const loginUser = asyncHandler(async (req, res) => {
   const {userName,email, password} = req.body;
   if(
      [userName, email, password].some((field) => field?.trim() === "")
   ){
      throw new ApiError(400, "All fields are required");
   }

   const user = User.findOne({
      $or : [
         {userName},
         {email}
      ]
   });

   if(!user) throw new ApiError(404, "User not found");

   const isPasswordCorrect = await user.isPasswordCorrect(password);
   if(!isPasswordCorrect) throw new ApiError(401, "Invalid user credentials");

   const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

   const option = {
      httpOnly : true,
      secure : true
   };

   res
   .status(200)
   .cookie("accessToken", accessToken, option)
   .cookie("refreshToken", refreshToken, option)
   .json(new ApiResponse(200, user, "User logged in successfully"));
})

// logout user
const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id, 
      {
         $set : {
            refreshToken : undefined
         }
      },
      {
         new : true
      }
   )

   const option = {
      httpOnly : true,
      secure : true
   }

   res
   .status(200)
   .clearCookie("accessToken", option)
   .clearCookie("refreshToken", option)
   .json(new ApiResponse(200, {}, "User logged out successfully"));  

})

export {registerUser, logoutUser};