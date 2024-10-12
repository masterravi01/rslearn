import { Router } from "express";
import {
  getUrlAnalytics,
  addUrl,
  gotoUrlByShortId,
  getAllUrls,
} from "../controllers/url.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Url } from "../models/url.model.js";

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.get("/", async (req, res) => {
  const AllUrls = await Url.find({});
  return res.render("home", { AllUrls });
});
router.route("/").post(addUrl);
router.route("/:shortId").get(gotoUrlByShortId);
router.route("/url/all").get(getAllUrls);
router.route("/analytics/:shortId").get(getUrlAnalytics);
export default router;
