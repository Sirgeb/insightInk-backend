import { Router } from "express";
import authRoutes from "./auth";
import usersRoutes from "./users";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/users", usersRoutes);

export default rootRouter;
