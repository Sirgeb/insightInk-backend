import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import { prismaClient } from "..";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { JWT_SECRET } from "../secrets";

const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const token = req.signedCookies?.session ?? tokenFromHeader;

  if (!token) {
    return next(new UnauthorizedException("Unauthorized."));
  }

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);

    const user = await prismaClient.user.findFirst({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        imageUrl: true,
      },
    });

    if (!user) {
      res.clearCookie("session");
      return next(new UnauthorizedException("Unauthorized User"));
    }

    req.user = user;
    console.log("User authenticated:", user);
    next();
  } catch (error: any) {
    console.log(error.message, "from middleware");
    res.clearCookie("session");
    next(new UnauthorizedException("Unauthorized"));
  }
};

export default authMiddleware;
