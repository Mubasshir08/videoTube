import mongoose from "mongoose"
import {isValidId} from "../utils/ObjectId_Validator.js"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const {channelId} = req.params;
    const {subscriberId} = req.body;
    
    if(!isValidId(channelId)) throw new ApiError(400, "Invalid Channel Id");
    if(!isValidId(subscriberId)) throw new ApiError(400, "Invalid Subscriber Id");

    const channel = await User.findById(channelId);
    const subscriber = await User.findById(subscriberId);
    if(!channel) throw new ApiError(404, "Channel not found");
    if(!subscriber) throw new ApiError(404, "Subscriber not found");

    const subscription = await Subscription.findOne({
        subscriber : subscriberId,
        channel : channelId
    });
    if(subscription) {
        await subscription.remove();
        return res
        .status(200)
        .json(new ApiResponse(200, subscription, "Subscription removed successfully"));
    }
    const newSubscription = await Subscription.create({
        subscriber : subscriberId,
        channel : channelId
    });
    return res
    .status(200)
    .json(new ApiResponse(200, newSubscription, "Subscription added successfully"));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if (!isValidId(channelId)) throw new ApiError(400, "Invalid Channel Id");
    const subscribers = await Subscription.find({channel : channelId}).populate("subscriber", "userName avatar");
    if(!subscribers) throw new ApiError(404, "Subscribers not found");
    return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!isValidId(subscriberId)) throw new ApiError(400, "Invalid Subscriber Id");
    const channels = await Subscription.find({subscriber : subscriberId}).populate("channel", "userName avatar");
    if(!channels) throw new ApiError(404, "Channels not found");
    return res
    .status(200)
    .json(new ApiResponse(200, channels, "Channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}