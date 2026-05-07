import { Router } from "express";
import {
  getConversations,
  getOrCreateDM,
  createGroup,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
} from "../controllers/conversationController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.route("/").get(protect, getConversations);
router.route("/dm").post(protect, getOrCreateDM);
router.route("/group").post(protect, createGroup);
router.route("/group/:id").put(protect, updateGroup);
router.route("/group/:id/members").put(protect, addMembers);
router.route("/group/:id/members/:userId").delete(protect, removeMember);
router.route("/group/:id/leave").post(protect, leaveGroup);

export default router;
