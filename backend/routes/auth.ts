import { Router } from "express";
import { googleAuth, login } from "../controllers/authController";
import { getUserById } from "../db";
const router = Router();

router.post("/google", googleAuth);
router.post("/login", login);


router.get("/me", async (req, res) => {
  if (!req.session.userId) {
     res.json({ user: null });
     return;
  }

  const user = await getUserById(req.session.userId);
  if (!user) {
    res.json({ user: null });
    return;
  }

  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
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
