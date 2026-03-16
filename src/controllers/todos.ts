import { Response } from "express";
import { prismaClient } from "../index";
import { AuthenticatedRequest } from "../types/express";

export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
  const todos = req.body;
  const userId = req.user.id;

  if (!Array.isArray(todos) || todos.length === 0) {
    return res.status(400).json({
      message: "Request body must be an array of todos",
    });
  }

  for (const todo of todos) {
    if (!todo.task || !todo.duration || !todo.priority) {
      return res.status(400).json({
        message: "Each todo must contain task, duration and priority",
      });
    }
  }

  const formattedTodos = todos.map((todo) => ({
    task: todo.task,
    duration: todo.duration,
    priority: todo.priority,
    tags: todo.tags || [],
    userId,
  }));

  const result = await prismaClient.todo.createMany({
    data: formattedTodos,
  });

  res.status(201).json({
    message: "Todos created successfully",
    count: result.count,
  });
};

export const getTodos = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;

  const { page = "1", limit = "10", priority, sort } = req.query;

  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);

  const todos = await prismaClient.todo.findMany({
    where: {
      userId,
      ...(priority && { priority: priority as string }),
    },
    orderBy: {
      createdAt: sort === "asc" ? "asc" : "desc",
    },
    skip: (pageNumber - 1) * limitNumber,
    take: limitNumber,
  });

  const total = await prismaClient.todo.count({
    where: {
      userId,
      ...(priority && { priority: priority as string }),
    },
  });

  res.status(200).json({
    page: pageNumber,
    limit: limitNumber,
    total,
    todos,
  });
};

export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const todo = await prismaClient.todo.findUnique({
    where: { id },
  });

  if (!todo) {
    return res.status(404).json({
      message: "Todo not found",
    });
  }

  if (todo.userId !== userId) {
    return res.status(403).json({
      message: "Unauthorized to delete this todo",
    });
  }

  await prismaClient.todo.delete({
    where: { id },
  });

  res.status(200).json({
    message: "Todo deleted successfully",
  });
};
