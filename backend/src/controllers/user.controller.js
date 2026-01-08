import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";

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

   if(!user) throw new ApiError(500, "Something went wrong while creating user"); 


   res.status(201).json(new ApiResponse(200, user, "User created successfully"));
});

export {registerUser};