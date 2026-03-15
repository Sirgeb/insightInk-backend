import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { signin, me, signup } from "../controllers/auth";

const authRoutes: Router = Router();

authRoutes.post("/signup", errorHandler(signup));
authRoutes.post("/signin", errorHandler(signin));
authRoutes.get("/me", [authMiddleware], errorHandler(me));

export default authRoutes;
