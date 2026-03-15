import express, { Express } from "express";
import { PORT } from "./secrets";
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
