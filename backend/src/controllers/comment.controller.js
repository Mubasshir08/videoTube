import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video

  const { videoId } = req.params;
  if(!videoId) throw new ApiError(400, "Video Id is required");
  if(!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid Video Id");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // get all comments
  const comments = await Comment.find({ video : videoId })
    .populate("owner", "userName avatar")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt : -1});

  const totalComments = await Comment.countDocuments({ video : videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, {comments, totalComments, page, limit}, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if(!videoId) throw new ApiError(400, "Video Id is required");
  if(!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400, "Invalid Video Id");

  const { content } = req.body;
  if(!content) throw new ApiError(400, "Content is required");

  const comment = await Comment.create({
    content,
    video : videoId,
    owner : req.user._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  if(!commentId) throw new ApiError(400, "Comment Id is required");
  if(!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError(400, "Invalid Comment Id");

  const { content } = req.body;
  if(!content) throw new ApiError(400, "Content is required");

  const comment = await Comment.findByIdAndUpdate(commentId, {
    $set : {
      content
    }
  }, {new : true}).select("-video");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if(!commentId) throw new ApiError(400, "Comment Id is required");
  if(!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError(400, "Invalid Comment Id");

  const comment = await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
