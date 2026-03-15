import { Response } from "express";
import { prismaClient } from "../index";
import { AuthenticatedRequest } from "../types/express";

export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
  const { task, duration, priority, tags } = req.body;

  const userId = req.user.id;

  if (!task || !duration || !priority) {
    return res.status(400).json({
      message: "task, duration and priority are required",
    });
  }

  const todo = await prismaClient.todo.create({
    data: {
      task,
      duration,
      priority,
      tags: tags || [],
      userId,
    },
  });

  res.status(201).json({
    message: "Todo created successfully",
    todo,
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
