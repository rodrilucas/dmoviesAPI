import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      error: "Erro de validação.",
      details: errors,
    });
  }

  console.error("Erro interno:", err);
  return res.status(500).json({ error: "Erro interno do servidor." });
}
