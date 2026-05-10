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
import { validateRequest } from "../middlewares/validateRequest";
import {
  dmConversationSchema,
  createGroupSchema,
  updateGroupSchema,
  groupMembersSchema,
} from "../validators";

const router = Router();

router.route("/").get(protect, getConversations);
router.route("/dm").post(protect, validateRequest(dmConversationSchema), getOrCreateDM);
router.route("/group").post(protect, validateRequest(createGroupSchema), createGroup);
router.route("/group/:id").put(protect, validateRequest(updateGroupSchema), updateGroup);
router.route("/group/:id/members").put(protect, validateRequest(groupMembersSchema), addMembers);
router.route("/group/:id/members/:userId").delete(protect, removeMember);
router.route("/group/:id/leave").post(protect, leaveGroup);

export default router;
