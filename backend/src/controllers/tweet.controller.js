import mongoose from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { isValidId } from "../utils/ObjectId_Validator.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if(!content) throw new ApiError(400, "Content is required");
    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    });
    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const tweets = await Tweet.find({owner : req.user._id});
    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!tweetId) throw new ApiError(400, "Tweet Id is required");
    if(!isValidId(tweetId)) throw new ApiError(400, "Invalid Tweet Id");

    if(!content) throw new ApiError(400, "Content is required");

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        content
    }, {new : true});
    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));

});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if(!tweetId) throw new ApiError(400, "Tweet Id is required");
    if(!isValidId(tweetId)) throw new ApiError(400, "Invalid Tweet Id");
    const tweet = await Tweet.findByIdAndDelete(tweetId);
    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}