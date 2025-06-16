import express from "express";
import cors from "cors";
import { router as moviesRoutes } from "./src/routes/moviesRoutes.js";
import { errorHandler, checkApiKey} from "./src/middlewares/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "https://dmovies-beryl.vercel.app/",
    credentials: true,
  })
);
app.use(checkApiKey);
app.use("/api/v1", moviesRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
