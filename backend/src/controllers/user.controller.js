import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOption } from "../constants.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
   try {
      const user = await User.findById(userId);

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
   
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
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
  if(!(userName || email) || !password) throw new ApiError(400, "All fields are required");

   // console.log(userName,email);

   const user = await User.findOne({
      $or : [
         {userName},
         {email}
      ]
   });

   if(!user) throw new ApiError(404, "User not found");

   const isPasswordCorrect = await user.isPasswordCorrect(password);
   if(!isPasswordCorrect) throw new ApiError(401, "Invalid user credentials");

   const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

   res
   .status(200)
   .cookie("accessToken", accessToken, cookieOption)
   .cookie("refreshToken", refreshToken, cookieOption)
   .json(new ApiResponse(200, user, "User logged in successfully"));
});

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

   res
   .status(200)
   .clearCookie("accessToken", cookieOption)
   .clearCookie("refreshToken", cookieOption)
   .json(new ApiResponse(200, {}, "User logged out successfully"));  

});

// create new accessToken, refreshToken
const refreshAccessToken = asyncHandler(async (req, res) => {
   const refreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "") || req.body.refreshToken;
   if(!refreshToken) throw new ApiError(401, "Unauthorized request");
   const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
   const user = await User.findById(decodedToken._id).select("-password -refreshToken");
   if(!user) throw new ApiError(401, "Invalid Refresh Token");
   const {accessToken, refreshToken : newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

   res
   .status(200)
   .cookie("accessToken", accessToken, cookieOption)
   .cookie("refreshToken", newRefreshToken, cookieOption)
   .json(new ApiResponse(200, user, "New Access Token Generated Successfully"));
});

// update password
const updatePassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;

  if(!oldPassword || !newPassword) throw new ApiError(400, "All fields are required");
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if(!isPasswordCorrect) throw new ApiError(401, "Invalid user credentials");

  user.password = newPassword;
  user.save({validateBeforeSave : false});

  res
  .status(200)
  .json(new ApiResponse(200, {}, "Password updated successfully")); 
});

// update account details - userName, email
const updateAccountDetails = asyncHandler(async (req, res) => {
   const {userName, email} = req.body;
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set : {
            userName,
            email
         }
      },
      {new : true}
   ).select("-password");
   res
   .status(200)
   .json(new ApiResponse(200, user, "Account details updated successfully")); 
});

// update avatar
const updateAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path;
   const user = await User.findById(req.user._id).select("-password");
   if(!user) throw new ApiError(404, "User not found");
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   if(!avatar) throw new ApiError(400, "Avatar is required");
   // delete previous avatar
   await deleteOnCloudinary(user.avatar);
   user.avatar = avatar.url;
   await user.save({validateBeforeSave : false});
   res
   .status(200)
   .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// update coverImage
const updateCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path;
   const user = await User.findById(req.user._id).select("-password");
   if(!user) throw new ApiError(404, "User not found");
   const coverImage = await uploadOnClodinary(coverImageLocalPath);
   if(!coverImage) throw new ApiError(400, "Cover Image is required");
   // delete previous coverImage
   await deleteOnClodinary(user.coverImage);
   user.coverImage = coverImage.url;
   await user.save({validateBeforeSave : false});
   res
   .status(200)
   .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

// get channel details 
const getUserChannelProfile = asyncHandler(async (req, res) => {
   const {username} = req.params;
   if(!username?.trim()) throw new ApiError(400, "Username is required");
   const channel = await User.aggregate([
      {
         $match : {
            userName : username?.toLowerCase()
         }
      },
      {
         $lookup : {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
         }
      },
      {
         $lookup : {
            from : "subscriptions",
            localField : "_id",
            foreignField : "subscriber",
            as : "subscribedTo"
         }
      },
      {
         $addFields : {
            subscribersCount : {
               $size : "$subscribers"
            },
            subscribedToCount : {
               $size : "$subscribedTo"
            },
            isSubscribed : {
               $cond : {
                  if : {
                     $in : [req.user._id, "$subscribers._id"]
                  },
                  then : true,
                  else : false
               }
            }
         }
      },
      {
         $project : {
            fullName : 1,
            userName : 1,
            email : 1,
            avatar : 1,
            coverImage : 1,
            subscribersCount : 1,
            subscribedToCount : 1,
            isSubscribed : 1
         }
      }
   ])
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile
};