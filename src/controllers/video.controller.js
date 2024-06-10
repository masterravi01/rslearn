import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
  };

  const VideoAggregate = Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        title: { $regex: query, $options: "i" },
      },
    },
    { $sort: options.sort },
  ]);
  const results = await Video.aggregatePaginate(VideoAggregate, options);

  if (results.docs?.length == 0) {
    throw new ApiError(404, "No Video found for this filter!");
  }
  //TODO: get all videos based on query, sort, pagination
  res.status(200).json(new ApiResponse(200, results, "Video get successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => !field?.trim())) {
    throw new ApiError(400, "All Fields are required");
  }
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video is required!");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required!");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "video upload failed!");
  }
  if (!thumbnail) {
    throw new ApiError(400, "thumbnail upload failed!");
  }
  const video = await Video.create({
    title,
    description,
    thumbnail: thumbnail.url,
    videoFile: videoFile?.url,
    duration: videoFile?.duration,
    owner: req.user?._id,
  });
  const createdVideo = await Video.findById(video._id);
  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while adding Video!");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video Uploaded Successfully!"));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "No Video found for this Id!");
  }
  res.status(200).json(new ApiResponse(200, video, "Video get successfully"));
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id required");
  }

  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!title && !description && !thumbnailLocalPath) {
    throw new ApiError(400, "Please pass at least one field for change!");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  let thumbnailUrl = "";
  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail.url) {
      throw new ApiError(400, "Error while uploading thumbnail");
    }
    if (video.thumbnail) {
      await deleteFromCloudinary(video.thumbnail);
    }
    thumbnailUrl = thumbnail.url;
  }

  let updateObj = {};
  if (title) updateObj.title = title;
  if (description) updateObj.description = description;
  if (thumbnailUrl) updateObj.thumbnail = thumbnailUrl;

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateObj },
    { new: true } // This option returns the updated document
  );

  if (!updatedVideo) {
    throw new ApiError(400, "Error while updating video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id required");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(404, "No Video found for this Id!");
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, "Video not found"));
  }

  video.isPublished = !video.isPublished;
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: video.isPublished } },
    { new: true } // This option returns the updated document
  );
  // Respond with the updated video
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video publication status toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
