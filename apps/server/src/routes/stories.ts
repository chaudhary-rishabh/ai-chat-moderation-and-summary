import { Router } from "express";
import * as storiesController from "../controllers/stories.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

router.post("/", storiesController.createStory);
router.get("/feed", storiesController.getFeed);
router.post("/:storyId/view", storiesController.viewStory);
router.post("/:storyId/react", storiesController.reactToStory);
router.delete("/:storyId", storiesController.deleteStory);
router.get("/:storyId/viewers", storiesController.getViewers);

export const storiesRouter = router;
