import { NextFunction, Request, Response } from "express";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { prismaClient } from "../index";
import { BadRequestsException } from "../exceptions/bad-requests";
import { JWT_SECRET } from "../secrets";
import { NotFoundException } from "../exceptions/not-found";
import { SignInSchema, SignUpSchema } from "../schema/users";
import { AuthenticatedRequest } from "../types/express";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  SignUpSchema.parse(req.body);
  const { fullname, email, password } = req.body;

  const names = fullname.trim().split(" ");
  const firstname = names[0]?.trim() || "";
  const lastname = names.slice(1).join(" ").trim();

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    throw new BadRequestsException("User already exists!");
  }

  user = await prismaClient.user.create({
    data: {
      firstname,
      lastname,
      email,
      password: hashSync(password, 10),
    },
  });

  res.json({
    ok: true,
    email: user.email,
    message: "User registered successfully",
  });
};

export const signin = async (req: Request, res: Response) => {
  SignInSchema.parse(req.body);
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    throw new NotFoundException("User does not exists!");
  }

  if (!compareSync(password, user.password!)) {
    throw new BadRequestsException("Incorrect password");
  }

  //@ts-ignore
  delete user["password"];

  const sessionToken = jwt.sign({ userId: user.id }, JWT_SECRET);

  res.cookie("session", sessionToken, {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    ok: true,
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      imageUrl: user.imageUrl,
      token: sessionToken,
    },
    message: "User logged in successfully",
  });
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  const sessionToken = jwt.sign({ userId: req.user.id }, JWT_SECRET);
  res.json({
    ok: true,
    user: {
      id: req.user.id,
      firstName: req.user.firstname,
      lastName: req.user.lastname,
      email: req.user.email,
      picture: req.user.imageUrl,
      token: sessionToken,
    },
  });
};
