import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const videoCount = await Video.countDocuments({owner : req.user._id});
    const subscriberCount = await Subscription.countDocuments({channel : req.user._id});
    const likeCount = await Like.countDocuments({likedBy : req.user._id});

    return res
    .status(200)
    .json(new ApiResponse(200, {videoCount, subscriberCount, likeCount}, "Channel stats fetched successfully"));

});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.find({owner : req.user._id});

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
    }