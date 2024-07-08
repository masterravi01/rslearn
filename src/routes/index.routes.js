import { Router } from "express";
import userRoutes from "./user.routes.js";
import healthcheckRoutes from "./healthcheck.routes.js";
import tweetRoutes from "./tweet.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import videoRoutes from "./video.routes.js";
import commentRoutes from "./comment.routes.js";
import likeRoutes from "./like.routes.js";
import playlistRoutes from "./playlist.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/healthcheck", healthcheckRoutes);
router.use("/tweets", tweetRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/videos", videoRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/playlists", playlistRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
