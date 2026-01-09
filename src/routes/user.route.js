import { Router } from "express";
import { registerUser, logInUser, logoutUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([    // middleware for images[]
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(logInUser)

router.route("/logout").post(varifyJWT, logoutUser)

export default router;