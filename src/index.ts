import express, { Express } from "express";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { COOKIE_SECRET, FRONTEND_URL, PORT } from "./secrets";
import rootRouter from "./routes";
import { errorMiddleware } from "./middlewares/errors";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(cookieParser(COOKIE_SECRET));
app.use("/api/v1", rootRouter);

app.get("/", (req, res) => {
  res.status(200).send();
});

export const prismaClient = new PrismaClient({
  log: ["query"],
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
