
import { Router } from "express";
import { googleAuth, login } from "../controllers/authController";

const router = Router();

router.post("/google", googleAuth);
router.post("/login", login);

export default router;
