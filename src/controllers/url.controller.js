import mongoose, { isValidObjectId } from "mongoose";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Url } from "../models/url.model.js";
import { nanoid } from "nanoid";

const gotoUrlByShortId = asyncHandler(async (req, res) => {
  const { shortId } = req.params;
  if (!shortId) {
    throw new ApiError(400, "shortId is required ");
  }

  let UrlObj = await Url.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  if (!UrlObj) {
    throw new ApiError(400, "No Records Founds");
  }
  //   res.end("<h1>Hello Theree</h1>"); //ssr
  res.redirect(UrlObj.redirectURL);
});

const addUrl = asyncHandler(async (req, res) => {
  const { redirectURL } = req.body;
  if (!redirectURL) {
    throw new ApiError(400, "redirectURL is required ");
  }
  let shortId = nanoid(8);
  let UrlObj = await Url.create({
    shortId,
    redirectURL,
    visitHistory: [],
  });

  if (!UrlObj) {
    throw new ApiError(400, "Error while adding Url");
  }
  return res.render("home", {
    id: shortId,
  });
  // res.status(201).json(new ApiResponse(201, UrlObj, "Add Url success"));
});
const getUrlAnalytics = asyncHandler(async (req, res) => {
  const { shortId } = req.params;
  if (!shortId) {
    throw new ApiError(400, "shortId is required ");
  }

  let Analytics = await Url.findOne({ shortId });
  if (!Analytics) {
    throw new ApiError(400, "Error while fetching Data");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { totalCounts: Analytics.visitHistory.length, Analytics },
        "Url Analytics fetched successfully!"
      )
    );
});

const getAllUrls = asyncHandler(async (req, res) => {
  let AllUrls = await Url.find({});

  res.render("home", { AllUrls });
  //   res.end(`<html>
  //         <head>
  //         </head>
  //           <ol>
  //           ${AllUrls.map((url) => `<li>${url.shortId}-${url.redirectURL}-${url.visitHistory?.length} </li>`)}
  //           </ol>
  //         </html>`);
});

export { gotoUrlByShortId, addUrl, getUrlAnalytics, getAllUrls };
