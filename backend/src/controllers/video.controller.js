import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { isValidId } from "../utils/ObjectId_Validator.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = req.query.query || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortType = req.query.sortType || "desc";
    const userId = req.query.userId || "";
    const skip = (page - 1) * limit;

    const videos = await Video.find({
        $or : [
            {title : {$regex : query, $options : "i"}},
            {description : {$regex : query, $options : "i"}}
        ],
        ...(userId && {owner : userId})
    })
    .populate("owner", "userName avatar")
    .skip(skip)
    .limit(limit)
    .sort({[sortBy] : sortType});

    const totalVideos = await Video.countDocuments({
        $or : [
            {title : {$regex : query, $options : "i"}},
            {description : {$regex : query, $options : "i"}}
        ],
        ...(userId && {owner : userId})
    });

    return res
    .status(200)
    .json(new ApiResponse(200, {videos, totalVideos, page, limit}, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description} = req.body;
    if(!title || !description) throw new ApiError(400, "Title and Description are required");
    
    // upload video to cloudinary
    const videoLocalPath = req.files?.video[0]?.path;
    if (!videoLocalPath) throw new ApiError(400, "Video is required");
    const {secure_url, duration} = await uploadOnCloudinary(videoLocalPath);
    if (!secure_url) throw new ApiError(400, "Video is required");

    // upload thumbnail to cloudinary
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) throw new ApiError(400, "Thumbnail is required");

    // create video
    const owner = req.user._id;
    const video = await Video.create({
        title,
        description,
        videoFile : secure_url,
        thumbnail : thumbnail.secure_url,
        duration,
        isPublished : true,
        owner
    });

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video created successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}