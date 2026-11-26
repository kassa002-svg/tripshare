import { Router } from "express";
import { googleAuth, login } from "../controllers/authController";
import { getPublicUserById } from "../db";
const router = Router();

router.post("/google", googleAuth);
router.post("/login", login);


router.get("/me", async (req, res) => {
  if (!req.session.userId) {
     res.json({ user: null });
     return;
  }

  const user = await getPublicUserById(req.session.userId);
  res.json({user})
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
        res.status(500).json({ error: "Can't sign out" });
    } else {
        res.json({ message: "Signed out" });
    }
    });
});

export default router;
