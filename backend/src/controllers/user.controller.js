import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
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
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   // console.log(avatarLocalPath, coverImageLocalPath);
   if(!avatarLocalPath) throw new ApiError(400, "Avatar is required");
   
   const avatar = await uploadOnClodinary(avatarLocalPath);
   const coverImage = await uploadOnClodinary(coverImageLocalPath);
   // console.log("avatar : ", avatar, "\n", "coverImage : ", coverImage);

   if(!avatar) throw new ApiError(400, "Avatar is required");

   res.status(201).json({
      message: "ok"
   })
});

export {registerUser};