import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { createTodo, deleteTodo, getTodos } from "../controllers/todos";

const todosRoutes: Router = Router();

todosRoutes.post("/", [authMiddleware], errorHandler(createTodo));
todosRoutes.get("/", [authMiddleware], errorHandler(getTodos));
todosRoutes.delete("/:id", [authMiddleware], errorHandler(deleteTodo));

export default todosRoutes;
