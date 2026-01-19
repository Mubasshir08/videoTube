import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {isValidId} from "../utils/ObjectId_Validator.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const {videoId} = req.params;
    const {name, description} = req.body;
    if (!videoId || !name || !description) throw new ApiError(400, "Name, Description and Video Id are required");
    if(!isValidId(videoId)) throw new ApiError(400, "Invalid Video Id");

    const playlist = Playlist.create({
        name,
        description,
        videos : [videoId],
        owner : req.user._id
    });
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const {userId} = req.params;
    if(!userId) throw new ApiError(400, "User Id is required");
    if(!isValidId(userId)) throw new ApiError(400, "Invalid User Id");

    const playlists = await Playlist.find({owner : userId});
    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const {playlistId} = req.params;
    if(!playlistId) throw new ApiError(400, "Playlist Id is required");
    if(!isValidId(playlistId)) throw new ApiError(400, "Invalid Playlist Id");

    const playlist = await Playlist.findById(playlistId);
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    const playlist = await Playlist.findById(playlistId);
    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave : false});
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const {playlistId, videoId} = req.params;

    const playlist = await Playlist.findById(playlistId);
    playlist.videos.pull(videoId);
    await playlist.save({validateBeforeSave : false});
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params;

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params;
    const {name, description} = req.body;

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description
    }, {new : true}).select("-videos owner");
    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}