import { Router } from "express";
import authRoutes from "./auth";
import usersRoutes from "./users";
import todosRoutes from "./todos";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/users", usersRoutes);
rootRouter.use("/todos", todosRoutes);

export default rootRouter;
