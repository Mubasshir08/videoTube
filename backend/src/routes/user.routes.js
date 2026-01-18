import {Router} from "express";
import { getUserChannelProfile, getUserDetails, getWatchHistory, loginUser, logoutUser, registerUser, updateAccountDetails, updateAvatar, updateCoverImage, updatePassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// all post requests

// register user route
router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
);

// login user route
router.route("/login").post(loginUser);

// logout user route
router.route("/logout").post(
    verifyJWT,
    logoutUser
);

// refresh access token route
router.route("/refreshAccessToken").post(
    refreshAccessToken
);

// change password route
router.route("/changePassword").post(
    verifyJWT,
    updatePassword
);

// update current user details
router.route("/updateAccountDetails").post(
    verifyJWT,
    updateAccountDetails
);

// update avatar
router.route("/updateAvatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
);

// update cover image
router.route("/updateCoverImage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateCoverImage
);

// all get requests

// get user details
router.route("/getUserDetails").get(
    verifyJWT,
    getUserDetails
);

// get user channel profile
router.route("/getUserChannelProfile").get(
    verifyJWT,
    getUserChannelProfile
);

// get watch history
router.route("/getWatchHistory").get(
    verifyJWT,
    getWatchHistory
);



export default router;
