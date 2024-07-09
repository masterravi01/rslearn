import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import {
  CLOUD_THUMBNAIL_FOLDER_NAME,
  CLOUD_VIDEO_FOLDER_NAME,
} from "../constants.js";

import { Like, Video, Comment } from "../models/index.model.js";

// eslint-disable-next-line no-unused-vars
const getAllVideos_my = asyncHandler(async (req, res) => {
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
        $and: [
          { owner: new mongoose.Types.ObjectId(userId) },
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
            ],
          },
        ],
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

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  page = isNaN(page) ? 1 : Number(page);
  limit = isNaN(limit) ? 10 : Number(limit);
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    page = 10;
  }

  const matchStage = {};
  if (userId && isValidObjectId(userId)) {
    matchStage["$match"] = {
      owner: new mongoose.Types.ObjectId(userId),
    };
  } else if (query) {
    matchStage["$match"] = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };
  } else {
    matchStage["$match"] = {};
  }

  if (userId && query) {
    matchStage["$match"] = {
      $and: [
        { owner: new mongoose.Types.ObjectId(userId) },
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        },
      ],
    };
  }

  const joinOwnerStage = {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $project: {
            username: 1,
            avatar: 1,
            fullname: 1,
          },
        },
      ],
    },
  };

  const addFieldStage = {
    $addFields: {
      owner: {
        $first: "$owner",
      },
    },
  };

  const sortStage = {};
  if (sortBy && sortType) {
    sortStage["$sort"] = {
      [sortBy]: sortType === "asc" ? 1 : -1,
    };
  } else {
    sortStage["$sort"] = {
      createdAt: -1,
    };
  }

  const skipStage = { $skip: (page - 1) * limit };
  const limitStage = { $limit: limit };

  const videos = await Video.aggregate([
    matchStage,
    joinOwnerStage,
    addFieldStage,
    sortStage,
    skipStage,
    limitStage,
  ]);

  res.status(200).json(new ApiResponse(200, videos, "Get videos success"));
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

  const videoFile = await uploadOnCloudinary(
    videoLocalPath,
    CLOUD_VIDEO_FOLDER_NAME
  );
  const thumbnail = await uploadOnCloudinary(
    thumbnailLocalPath,
    CLOUD_THUMBNAIL_FOLDER_NAME
  );

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
  if (!video) {
    await deleteFromCloudinary(videoFile?.url, "video");
    await deleteFromCloudinary(thumbnail.url);
    throw new ApiError(500, "Something went wrong while adding Video!");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video Uploaded Successfully!"));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id required");
  }
  let video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        likes: {
          $size: "$likes",
        },
        views: {
          $add: [1, "$views"],
        },
      },
    },
  ]);

  if (video.length > 0) {
    video = video[0];
  }

  await Video.findByIdAndUpdate(videoId, {
    $set: {
      views: video.views,
    },
  });

  res.status(200).json(new ApiResponse(200, video, "Get single video success"));
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !isValidObjectId(videoId)) {
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
    const thumbnail = await uploadOnCloudinary(
      thumbnailLocalPath,
      CLOUD_THUMBNAIL_FOLDER_NAME
    );
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
  if (!videoId?.trim() || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found for deletion");
  }

  if (video.owner?._id?.toString() !== req.user?._id?.toString()) {
    throw new ApiError(401, "You cannot delete this video");
  }

  const { _id, videoFile, thumbnail } = video;
  const delResponse = await Video.findByIdAndDelete(_id);
  if (delResponse) {
    await Promise.all([
      Like.deleteMany({ video: _id }),
      Comment.deleteMany({ video: _id }),
      deleteFromCloudinary(videoFile, "video"),
      deleteFromCloudinary(thumbnail),
    ]);
  } else {
    throw new ApiError(500, "Something went wrong while deleting video");
  }
  res.status(200).json(new ApiResponse(200, {}, "Video deletion success"));
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
