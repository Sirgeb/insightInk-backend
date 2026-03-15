import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { upload } from "../middlewares/upload";
import { updateProfileInfo, uploadProfilePicture } from "../controllers/users";

const usersRoutes: Router = Router();

usersRoutes.post(
  "/upload-profile-picture",
  upload.single("image"),
  [authMiddleware],
  errorHandler(uploadProfilePicture),
);

usersRoutes.put(
  "/update-profile-info",
  [authMiddleware],
  errorHandler(updateProfileInfo),
);

export default usersRoutes;
