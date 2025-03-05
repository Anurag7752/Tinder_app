import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getConversation } from "../controllers/messageController.js";

const router = express.Router();


router.use(protectRoute);
router.get("/conversation/:userId", getConversation);

export default router;