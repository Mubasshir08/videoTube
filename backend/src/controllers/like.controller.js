import mongoose from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { isValidId } from "../utils/ObjectId_Validator.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params;
    if(!videoId) throw new ApiError(400, "Video Id is required");
    if(!isValidId(videoId)) throw new ApiError(400, "Invalid Video Id");

    const like = await Like.findOne({video : videoId, likedBy : req.user._id});
    if(!like){
        const newLike = await Like.create({
            video : videoId,
            likedBy : req.user._id
        });
        return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Video liked successfully"));
    }
    await Like.findByIdAndDelete(like._id);
    return res
    .status(200)
    .json(new ApiResponse(200, like, "Video unliked successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const {commentId} = req.params;
    if(!commentId) throw new ApiError(400, "Comment Id is required");
    if(!isValidId(commentId)) throw new ApiError(400, "Invalid Comment Id");

    const like = await Like.findOne({comment : commentId, likedBy : req.user._id});
    if(!like){
        const newLike = await Like.create({
            comment : commentId,
            likedBy : req.user._id
        });
        return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Comment liked successfully"));
    }
    await Like.findByIdAndDelete(like._id);
    return res
    .status(200)
    .json(new ApiResponse(200, like, "Comment unliked successfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const {tweetId} = req.params;
    if(!tweetId) throw new ApiError(400, "Tweet Id is required");
    if(!isValidId(tweetId)) throw new ApiError(400, "Invalid Tweet Id");

    const like = await Like.findOne({tweet : tweetId, likedBy : req.user._id});
    if(!like){
        const newLike = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id
        });
        return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Tweet liked successfully"));
    }
    await Like.findByIdAndDelete(like._id);
    return res
    .status(200)
    .json(new ApiResponse(200, like, "Tweet unliked successfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideo = await Like.find({likedBy : req.user._id}).populate("video");
    return res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}