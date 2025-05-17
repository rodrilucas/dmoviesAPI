import { z } from "zod";
import {
  int,
  positiveInt,
  limitedInt,
  stringRequired,
  enumField,
  regexField,
  pageInt,
  dateBR,
} from "../helpers/validator.js";

export const sortByEnum = enumField(
  ["popularity", "release_date", "vote_average", "title"],
  "Ordenação inválida. As opções são popularity, release_date, vote_average ou title"
);

export const sortOrderEnum = enumField(["asc", "desc"], "Ordem inválida. Deve ser asc ou desc");

export const paginationSchema = z.object({
  page: pageInt().optional(),
  limit: limitedInt(1, 50, "limite").optional(),
  sort_by: regexField(
    /^(popularity|release_date|vote_average|title)\.(asc|desc)$/,
    "Use o formato campo.ordem, ex: popularity.desc"
  ).optional(),
});

export const movieIdParamSchema = z.object({
  id: stringRequired("id"),
});

export const searchQuerySchema = z.object({
  query: z
    .string({
      required_error: "O parâmetro 'query' é obrigatório.",
      invalid_type_error: "O parâmetro 'query' deve ser uma string.",
    })
    .min(1, "O parâmetro 'query' não pode estar vazio."),
  page: pageInt().optional(),
  sort_by: z
    .string()
    .regex(
      /^(popularity|release_date|vote_average|title)\.(asc|desc)$/,
      "O parâmetro 'sort_by' está com valor inválido."
    )
    .optional(),
});


export const updatePopularMoviesSchema = z.object({
  pages: positiveInt(1, "Informe ao menos 1 página."),
});

export const suggestionSchema = z.object({
  keyword: stringRequired("keyword"),
  limit: limitedInt(1, 10, "limite").optional(),
});

export const filtersSchema = z.object({
  startYear: dateBR().optional(),
  endYear: dateBR().optional(),
  language: z
    .string()
    .optional(),
  rating: limitedInt(0, 10, "nota").optional(),
  avaliation: int("Quantidade de avaliações inválida.")
    .min(0, "O número mínimo de avaliações é zero")
    .max(5000, "O número máximo de avaliações e 5.000")
    .optional(),
  includeAdult: z
    .boolean("Conteúdo adulto só poder ser true ou false")
    .optional(),
  keyword: z.string().trim().max(255, "Máximo de 255 caracteres.").optional(),
  genres: z
    .array(positiveInt(1, "ID de gênero inválido."))
    .optional(),
  sort: z
    .object({
      by: sortByEnum,
      order: sortOrderEnum,
    })
    .partial()
    .optional(),
  page: pageInt().optional(),
  limit: limitedInt(1, 50, "limite").default(20),
});
