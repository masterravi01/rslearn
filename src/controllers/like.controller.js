import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video;
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404, {}, "video not found");
  }
  const like = await Like.findOne({ video: videoId, likedBy: req.user?._id });
  let isLiking;
  if (like) {
    const deleteLike = await Like.deleteOne(like._id);
    isLiking = false;
    if (!deleteLike) {
      throw new ApiError(
        500,
        "Something went wrong while deleteing  to video!"
      );
    }
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    isLiking = true;
    if (!newLike) {
      throw new ApiError(
        500,
        "Something went wrong while Adding Like to video!"
      );
    }
  }
  const message = isLiking
    ? "Add like to video success"
    : "Remove like from video success";
  res.status(200).json(new ApiResponse(200, {}, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(404, {}, "comment not found");
  }
  const like = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  let isLiking;
  if (like) {
    const deleteLike = await Like.deleteOne(like._id);
    isLiking = false;
    if (!deleteLike) {
      throw new ApiError(
        500,
        "Something went wrong while deleteing Like to comment!"
      );
    }
  } else {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    isLiking = true;
    if (!newLike) {
      throw new ApiError(
        500,
        "Something went wrong while Adding Like to comment!"
      );
    }
  }
  const message = isLiking
    ? "Add like to comment success"
    : "Remove like from comment success";
  res.status(200).json(new ApiResponse(200, {}, message));
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(404, {}, "tweet not found");
  }
  const like = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id });
  let isLiking;
  if (like) {
    const deleteLike = await Like.deleteOne(like._id);
    isLiking = false;
    if (!deleteLike) {
      throw new ApiError(
        500,
        "Something went wrong while deleteing Like to tweet!"
      );
    }
  } else {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    isLiking = true;
    if (!newLike) {
      throw new ApiError(
        500,
        "Something went wrong while Adding Like to tweet!"
      );
    }
  }
  const message = isLiking
    ? "Add like to tweet success"
    : "Remove like from tweet success";
  res.status(200).json(new ApiResponse(200, {}, message));
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        video: {
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $project: {
              title: 1,
              videoFile: 1,
              thumbnail: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $project: {
        videos: 1,
        _id: 0,
      },
    },
    {
      $replaceRoot: { newRoot: "$videos" },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, videosCount: videos.length },
        "Get All Likes Successfully!"
      )
    );
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
