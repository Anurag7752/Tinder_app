import express from "express";
import { login, logout, signup } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();


router.get("/me", (req, res) => {
    res.json({ message: "Auth route is working!" });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


// router.get("/me", protectRoute, (req, res) => {
//     res.send({
//         success: true,
//         user: req.user,
//     });
// });


export default router;